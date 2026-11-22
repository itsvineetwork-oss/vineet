/* Console banking application */
#include "bank.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static Bank bank;

static void read_line(const char *prompt, char *buf, size_t n) {
    printf("%s", prompt);
    fflush(stdout);
    if (!fgets(buf, (int)n, stdin)) { buf[0] = 0; return; }
    buf[strcspn(buf, "\r\n")] = 0;
}

static long read_long(const char *prompt) {
    char buf[64];
    read_line(prompt, buf, sizeof buf);
    return strtol(buf, NULL, 10);
}

static long long read_amount(const char *prompt) {
    char buf[64];
    read_line(prompt, buf, sizeof buf);
    return bank_parse_amount(buf);
}

static void persist(void) {
    if (bank_save(&bank, DATA_FILE) != 0) printf("Warning: could not save data\n");
}

static void print_account(const Account *a) {
    char amt[32]; bank_format_amount(a->balance_paise, amt, sizeof amt);
    char when[32]; strftime(when, sizeof when, "%Y-%m-%d", localtime(&a->created_at));
    printf("  Account : %ld\n  Name    : %s\n  Type    : %s\n  Balance : Rs %s\n  Status  : %s\n  Opened  : %s\n",
           a->number, a->name, bank_type_name(a->type), amt, a->active ? "ACTIVE" : "CLOSED", when);
}

static void do_open(void) {
    char name[NAME_LEN], pin[16], type[8];
    read_line("Holder name   : ", name, sizeof name);
    read_line("PIN (4-7 dig) : ", pin, sizeof pin);
    read_line("Type (S/C)    : ", type, sizeof type);
    long long init = read_amount("Initial deposit: ");
    if (init < 0) { printf("Invalid amount\n"); return; }
    long num;
    BankError e = bank_open(&bank, name, pin, (type[0] == 'C' || type[0] == 'c') ? ACC_CURRENT : ACC_SAVINGS, init, &num);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    persist();
    printf("Account opened. Your account number is %ld\n", num);
}

static void do_deposit(void) {
    long num = read_long("Account number: ");
    long long amt = read_amount("Amount        : ");
    BankError e = bank_deposit(&bank, num, amt);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    persist();
    printf("Deposit successful\n");
}

static void do_withdraw(void) {
    long num = read_long("Account number: ");
    char pin[16]; read_line("PIN           : ", pin, sizeof pin);
    long long amt = read_amount("Amount        : ");
    BankError e = bank_withdraw(&bank, num, pin, amt);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    persist();
    printf("Withdrawal successful\n");
}

static void do_transfer(void) {
    long from = read_long("From account  : ");
    char pin[16]; read_line("PIN           : ", pin, sizeof pin);
    long to = read_long("To account    : ");
    long long amt = read_amount("Amount        : ");
    BankError e = bank_transfer(&bank, from, pin, to, amt);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    persist();
    printf("Transfer successful\n");
}

static void do_balance(void) {
    long num = read_long("Account number: ");
    char pin[16]; read_line("PIN           : ", pin, sizeof pin);
    BankError e = bank_auth(&bank, num, pin);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    print_account(bank_find(&bank, num));
}

static void do_statement(void) {
    long num = read_long("Account number: ");
    char pin[16]; read_line("PIN           : ", pin, sizeof pin);
    BankError e = bank_auth(&bank, num, pin);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    Transaction txs[50];
    int n = bank_statement(&bank, num, txs, 50);
    printf("%-6s %-19s %-13s %12s %12s %8s\n", "ID", "DATE", "TYPE", "AMOUNT", "BALANCE", "OTHER");
    for (int i = 0; i < n; i++) {
        char a[32], b[32], when[32];
        bank_format_amount(txs[i].amount_paise, a, sizeof a);
        bank_format_amount(txs[i].balance_after, b, sizeof b);
        strftime(when, sizeof when, "%Y-%m-%d %H:%M:%S", localtime(&txs[i].at));
        printf("%-6ld %-19s %-13s %12s %12s %8ld\n", txs[i].id, when, bank_tx_name(txs[i].type), a, b, txs[i].counterpart);
    }
    if (n == 0) printf("(no transactions)\n");
}

static void do_close(void) {
    long num = read_long("Account number: ");
    char pin[16]; read_line("PIN           : ", pin, sizeof pin);
    char sure[8]; read_line("Close account? (y/N): ", sure, sizeof sure);
    if (sure[0] != 'y' && sure[0] != 'Y') return;
    BankError e = bank_close(&bank, num, pin);
    if (e != BANK_OK) { printf("Error: %s\n", bank_strerror(e)); return; }
    persist();
    printf("Account closed\n");
}

static void do_list(void) {
    printf("%-8s %-24s %-8s %14s %-7s\n", "ACCOUNT", "NAME", "TYPE", "BALANCE", "STATUS");
    for (int i = 0; i < bank.account_count; i++) {
        const Account *a = &bank.accounts[i];
        char amt[32]; bank_format_amount(a->balance_paise, amt, sizeof amt);
        printf("%-8ld %-24s %-8s %14s %-7s\n", a->number, a->name, bank_type_name(a->type), amt, a->active ? "ACTIVE" : "CLOSED");
    }
    if (bank.account_count == 0) printf("(no accounts)\n");
}

int main(void) {
    if (bank_load(&bank, DATA_FILE) != 0) printf("Warning: data file unreadable, starting fresh\n");
    for (;;) {
        printf("\n===== C BANK =====\n"
               "1. Open account\n2. Deposit\n3. Withdraw\n4. Transfer\n5. Balance enquiry\n"
               "6. Mini statement\n7. Close account\n8. List accounts (admin)\n0. Exit\n");
        long c = read_long("Choice: ");
        switch (c) {
        case 1: do_open(); break;
        case 2: do_deposit(); break;
        case 3: do_withdraw(); break;
        case 4: do_transfer(); break;
        case 5: do_balance(); break;
        case 6: do_statement(); break;
        case 7: do_close(); break;
        case 8: do_list(); break;
        case 0: persist(); printf("Bye\n"); return 0;
        default: printf("Invalid choice\n");
        }
        if (feof(stdin)) { persist(); return 0; }
    }
}
