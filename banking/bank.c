#include "bank.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define FILE_MAGIC 0x424E4B31 /* "BNK1" */

void bank_init(Bank *b) {
    memset(b, 0, sizeof *b);
    b->next_account = 100001;
    b->next_tx = 1;
}

int bank_load(Bank *b, const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) { bank_init(b); return 0; }
    unsigned magic = 0;
    if (fread(&magic, sizeof magic, 1, f) != 1 || magic != FILE_MAGIC) { fclose(f); bank_init(b); return -1; }
    if (fread(b, sizeof *b, 1, f) != 1) { fclose(f); bank_init(b); return -1; }
    fclose(f);
    return 0;
}

int bank_save(const Bank *b, const char *path) {
    char tmp[512];
    snprintf(tmp, sizeof tmp, "%s.tmp", path);
    FILE *f = fopen(tmp, "wb");
    if (!f) return -1;
    unsigned magic = FILE_MAGIC;
    if (fwrite(&magic, sizeof magic, 1, f) != 1 || fwrite(b, sizeof *b, 1, f) != 1) { fclose(f); remove(tmp); return -1; }
    if (fclose(f) != 0) { remove(tmp); return -1; }
    if (rename(tmp, path) != 0) { remove(tmp); return -1; }
    return 0;
}

Account *bank_find(Bank *b, long number) {
    for (int i = 0; i < b->account_count; i++)
        if (b->accounts[i].number == number) return &b->accounts[i];
    return NULL;
}

static Transaction *add_tx(Bank *b, long acc, long other, TxType t, long long amt, long long after) {
    if (b->tx_count >= MAX_TRANSACTIONS) {
        /* drop oldest half to make room */
        int keep = MAX_TRANSACTIONS / 2;
        memmove(b->txs, b->txs + (MAX_TRANSACTIONS - keep), keep * sizeof(Transaction));
        b->tx_count = keep;
    }
    Transaction *tx = &b->txs[b->tx_count++];
    tx->id = b->next_tx++;
    tx->account = acc;
    tx->counterpart = other;
    tx->type = t;
    tx->amount_paise = amt;
    tx->balance_after = after;
    tx->at = time(NULL);
    return tx;
}

static int valid_pin(const char *pin) {
    size_t n = strlen(pin);
    if (n < 4 || n >= PIN_LEN) return 0;
    for (size_t i = 0; i < n; i++) if (!isdigit((unsigned char)pin[i])) return 0;
    return 1;
}

BankError bank_open(Bank *b, const char *name, const char *pin,
                    AccountType type, long long initial_paise, long *out_number) {
    if (!name || !*name || strlen(name) >= NAME_LEN) return BANK_ERR_INVALID_INPUT;
    if (!pin || !valid_pin(pin)) return BANK_ERR_INVALID_INPUT;
    if (initial_paise < 0) return BANK_ERR_INVALID_AMOUNT;
    if (b->account_count >= MAX_ACCOUNTS) return BANK_ERR_FULL;

    Account *a = &b->accounts[b->account_count++];
    memset(a, 0, sizeof *a);
    a->number = b->next_account++;
    strncpy(a->name, name, NAME_LEN - 1);
    strncpy(a->pin, pin, PIN_LEN - 1);
    a->type = type;
    a->balance_paise = initial_paise;
    a->active = 1;
    a->created_at = time(NULL);
    add_tx(b, a->number, 0, TX_OPEN, initial_paise, initial_paise);
    if (out_number) *out_number = a->number;
    return BANK_OK;
}

BankError bank_auth(Bank *b, long number, const char *pin) {
    Account *a = bank_find(b, number);
    if (!a) return BANK_ERR_NOT_FOUND;
    if (!a->active) return BANK_ERR_INACTIVE;
    if (!pin || strcmp(a->pin, pin) != 0) return BANK_ERR_BAD_PIN;
    return BANK_OK;
}

BankError bank_close(Bank *b, long number, const char *pin) {
    BankError e = bank_auth(b, number, pin);
    if (e != BANK_OK) return e;
    Account *a = bank_find(b, number);
    long long bal = a->balance_paise;
    a->balance_paise = 0;
    a->active = 0;
    add_tx(b, number, 0, TX_CLOSE, bal, 0);
    return BANK_OK;
}

BankError bank_deposit(Bank *b, long number, long long paise) {
    if (paise <= 0) return BANK_ERR_INVALID_AMOUNT;
    Account *a = bank_find(b, number);
    if (!a) return BANK_ERR_NOT_FOUND;
    if (!a->active) return BANK_ERR_INACTIVE;
    a->balance_paise += paise;
    add_tx(b, number, 0, TX_DEPOSIT, paise, a->balance_paise);
    return BANK_OK;
}

BankError bank_withdraw(Bank *b, long number, const char *pin, long long paise) {
    if (paise <= 0) return BANK_ERR_INVALID_AMOUNT;
    BankError e = bank_auth(b, number, pin);
    if (e != BANK_OK) return e;
    Account *a = bank_find(b, number);
    if (a->balance_paise < paise) return BANK_ERR_INSUFFICIENT;
    a->balance_paise -= paise;
    add_tx(b, number, 0, TX_WITHDRAW, paise, a->balance_paise);
    return BANK_OK;
}

BankError bank_transfer(Bank *b, long from, const char *pin, long to, long long paise) {
    if (paise <= 0) return BANK_ERR_INVALID_AMOUNT;
    if (from == to) return BANK_ERR_SAME_ACCOUNT;
    BankError e = bank_auth(b, from, pin);
    if (e != BANK_OK) return e;
    Account *src = bank_find(b, from);
    Account *dst = bank_find(b, to);
    if (!dst) return BANK_ERR_NOT_FOUND;
    if (!dst->active) return BANK_ERR_INACTIVE;
    if (src->balance_paise < paise) return BANK_ERR_INSUFFICIENT;
    src->balance_paise -= paise;
    dst->balance_paise += paise;
    add_tx(b, from, to, TX_TRANSFER_OUT, paise, src->balance_paise);
    add_tx(b, to, from, TX_TRANSFER_IN, paise, dst->balance_paise);
    return BANK_OK;
}

int bank_statement(const Bank *b, long number, Transaction *out, int max) {
    int n = 0;
    for (int i = b->tx_count - 1; i >= 0 && n < max; i--)
        if (b->txs[i].account == number) out[n++] = b->txs[i];
    return n;
}

const char *bank_strerror(BankError e) {
    switch (e) {
    case BANK_OK:                 return "OK";
    case BANK_ERR_NOT_FOUND:      return "Account not found";
    case BANK_ERR_BAD_PIN:        return "Incorrect PIN";
    case BANK_ERR_INSUFFICIENT:   return "Insufficient balance";
    case BANK_ERR_INVALID_AMOUNT: return "Invalid amount";
    case BANK_ERR_FULL:           return "Bank is full";
    case BANK_ERR_INACTIVE:       return "Account is closed";
    case BANK_ERR_SAME_ACCOUNT:   return "Cannot transfer to same account";
    case BANK_ERR_IO:             return "Storage error";
    case BANK_ERR_INVALID_INPUT:  return "Invalid input (name required, PIN 4-7 digits)";
    }
    return "Unknown error";
}

const char *bank_tx_name(TxType t) {
    static const char *names[] = { "DEPOSIT", "WITHDRAW", "TRANSFER_IN", "TRANSFER_OUT", "OPEN", "CLOSE" };
    return (t >= 0 && t <= TX_CLOSE) ? names[t] : "?";
}

const char *bank_type_name(AccountType t) {
    return t == ACC_CURRENT ? "CURRENT" : "SAVINGS";
}

long long bank_parse_amount(const char *s) {
    if (!s) return -1;
    while (isspace((unsigned char)*s)) s++;
    if (!*s) return -1;
    long long rupees = 0; int paise = 0, pd = 0, digits = 0;
    while (isdigit((unsigned char)*s)) { rupees = rupees * 10 + (*s - '0'); s++; digits++; if (rupees > 1000000000000LL) return -1; }
    if (*s == '.') {
        s++;
        while (isdigit((unsigned char)*s) && pd < 2) { paise = paise * 10 + (*s - '0'); s++; pd++; digits++; }
        if (pd == 1) paise *= 10;
        if (isdigit((unsigned char)*s)) return -1;
    }
    while (isspace((unsigned char)*s)) s++;
    if (*s || digits == 0) return -1;
    return rupees * 100 + paise;
}

void bank_format_amount(long long paise, char *buf, size_t n) {
    const char *sign = paise < 0 ? "-" : "";
    if (paise < 0) paise = -paise;
    snprintf(buf, n, "%s%lld.%02lld", sign, paise / 100, paise % 100);
}
