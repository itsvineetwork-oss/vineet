#ifndef BANK_H
#define BANK_H

#include <stddef.h>
#include <time.h>

#define MAX_ACCOUNTS     1000
#define MAX_TRANSACTIONS 10000
#define NAME_LEN         64
#define PIN_LEN          8
#define DATA_FILE        "bank.dat"

typedef enum { ACC_SAVINGS = 0, ACC_CURRENT = 1 } AccountType;

typedef enum {
    TX_DEPOSIT = 0,
    TX_WITHDRAW,
    TX_TRANSFER_IN,
    TX_TRANSFER_OUT,
    TX_OPEN,
    TX_CLOSE
} TxType;

typedef struct {
    long        number;        /* account number, starts at 100001 */
    char        name[NAME_LEN];
    char        pin[PIN_LEN];
    AccountType type;
    long long   balance_paise; /* stored in paise to avoid float error */
    int         active;
    time_t      created_at;
} Account;

typedef struct {
    long      id;
    long      account;     /* account affected */
    long      counterpart; /* other account for transfers, else 0 */
    TxType    type;
    long long amount_paise;
    long long balance_after;
    time_t    at;
} Transaction;

typedef struct {
    Account     accounts[MAX_ACCOUNTS];
    int         account_count;
    Transaction txs[MAX_TRANSACTIONS];
    int         tx_count;
    long        next_account;
    long        next_tx;
} Bank;

typedef enum {
    BANK_OK = 0,
    BANK_ERR_NOT_FOUND,
    BANK_ERR_BAD_PIN,
    BANK_ERR_INSUFFICIENT,
    BANK_ERR_INVALID_AMOUNT,
    BANK_ERR_FULL,
    BANK_ERR_INACTIVE,
    BANK_ERR_SAME_ACCOUNT,
    BANK_ERR_IO,
    BANK_ERR_INVALID_INPUT
} BankError;

void        bank_init(Bank *b);
int         bank_load(Bank *b, const char *path);
int         bank_save(const Bank *b, const char *path);

Account    *bank_find(Bank *b, long number);
BankError   bank_open(Bank *b, const char *name, const char *pin,
                      AccountType type, long long initial_paise, long *out_number);
BankError   bank_close(Bank *b, long number, const char *pin);
BankError   bank_auth(Bank *b, long number, const char *pin);
BankError   bank_deposit(Bank *b, long number, long long paise);
BankError   bank_withdraw(Bank *b, long number, const char *pin, long long paise);
BankError   bank_transfer(Bank *b, long from, const char *pin, long to, long long paise);
int         bank_statement(const Bank *b, long number, Transaction *out, int max);

const char *bank_strerror(BankError e);
const char *bank_tx_name(TxType t);
const char *bank_type_name(AccountType t);
long long   bank_parse_amount(const char *s); /* "123.45" -> 12345, -1 on error */
void        bank_format_amount(long long paise, char *buf, size_t n);

#endif
