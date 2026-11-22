#include "bank.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    Bank b; bank_init(&b);
    long a1, a2;
    assert(bank_open(&b, "Alice", "1234", ACC_SAVINGS, 100000, &a1) == BANK_OK);
    assert(bank_open(&b, "Bob", "5678", ACC_CURRENT, 0, &a2) == BANK_OK);
    assert(a1 == 100001 && a2 == 100002);
    assert(bank_open(&b, "", "1234", ACC_SAVINGS, 0, NULL) == BANK_ERR_INVALID_INPUT);
    assert(bank_open(&b, "X", "12", ACC_SAVINGS, 0, NULL) == BANK_ERR_INVALID_INPUT);

    assert(bank_deposit(&b, a1, 5000) == BANK_OK);
    assert(bank_find(&b, a1)->balance_paise == 105000);
    assert(bank_deposit(&b, a1, 0) == BANK_ERR_INVALID_AMOUNT);
    assert(bank_deposit(&b, 999, 100) == BANK_ERR_NOT_FOUND);

    assert(bank_withdraw(&b, a1, "0000", 100) == BANK_ERR_BAD_PIN);
    assert(bank_withdraw(&b, a1, "1234", 200000) == BANK_ERR_INSUFFICIENT);
    assert(bank_withdraw(&b, a1, "1234", 5000) == BANK_OK);
    assert(bank_find(&b, a1)->balance_paise == 100000);

    assert(bank_transfer(&b, a1, "1234", a1, 100) == BANK_ERR_SAME_ACCOUNT);
    assert(bank_transfer(&b, a1, "1234", a2, 25000) == BANK_OK);
    assert(bank_find(&b, a1)->balance_paise == 75000);
    assert(bank_find(&b, a2)->balance_paise == 25000);

    Transaction txs[10];
    int n = bank_statement(&b, a1, txs, 10);
    assert(n == 4 && txs[0].type == TX_TRANSFER_OUT && txs[3].type == TX_OPEN);

    assert(bank_close(&b, a2, "5678") == BANK_OK);
    assert(bank_deposit(&b, a2, 100) == BANK_ERR_INACTIVE);
    assert(bank_transfer(&b, a1, "1234", a2, 100) == BANK_ERR_INACTIVE);

    assert(bank_parse_amount("123.45") == 12345);
    assert(bank_parse_amount("7") == 700);
    assert(bank_parse_amount("7.5") == 750);
    assert(bank_parse_amount("1.234") == -1);
    assert(bank_parse_amount("abc") == -1);
    assert(bank_parse_amount("") == -1);
    char buf[32]; bank_format_amount(12345, buf, sizeof buf); assert(!strcmp(buf, "123.45"));

    const char *path = "test_bank.dat";
    assert(bank_save(&b, path) == 0);
    Bank c; assert(bank_load(&c, path) == 0);
    assert(c.account_count == 2 && c.tx_count == b.tx_count && c.next_account == 100003);
    assert(bank_find(&c, a1)->balance_paise == 75000);
    remove(path);

    puts("all tests passed");
    return 0;
}
