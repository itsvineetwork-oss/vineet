/* Minimal single-threaded HTTP server exposing the bank as a JSON API
 * and serving the HTML frontend from ./web. POSIX sockets only. */
#include "bank.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define REQ_MAX   65536
#define OUT_MAX   262144

static Bank bank;
static volatile sig_atomic_t running = 1;
static void on_sigint(int s) { (void)s; running = 0; }

/* ---------- tiny helpers ---------- */

static void send_all(int fd, const char *buf, size_t n) {
    while (n > 0) {
        ssize_t w = send(fd, buf, n, MSG_NOSIGNAL);
        if (w <= 0) return;
        buf += w; n -= (size_t)w;
    }
}

static void respond(int fd, int status, const char *ctype, const char *body, size_t len) {
    const char *reason = status == 200 ? "OK" : status == 400 ? "Bad Request" : status == 401 ? "Unauthorized"
                       : status == 404 ? "Not Found" : status == 405 ? "Method Not Allowed" : "Error";
    char hdr[512];
    int n = snprintf(hdr, sizeof hdr,
        "HTTP/1.1 %d %s\r\nContent-Type: %s\r\nContent-Length: %zu\r\n"
        "Cache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n",
        status, reason, ctype, len);
    send_all(fd, hdr, (size_t)n);
    send_all(fd, body, len);
}

static void json_err(int fd, int status, const char *msg) {
    char body[512];
    int n = snprintf(body, sizeof body, "{\"ok\":false,\"error\":\"%s\"}", msg);
    respond(fd, status, "application/json", body, (size_t)n);
}

/* Escape a string for inclusion in JSON. */
static void json_escape(const char *s, char *out, size_t n) {
    size_t o = 0;
    for (; *s && o + 6 < n; s++) {
        unsigned char c = (unsigned char)*s;
        if (c == '"' || c == '\\') { out[o++] = '\\'; out[o++] = (char)c; }
        else if (c < 0x20) { o += (size_t)snprintf(out + o, n - o, "\\u%04x", c); }
        else out[o++] = (char)c;
    }
    out[o] = 0;
}

/* Extract a string field from a flat JSON object: {"key":"value"} or {"key":123} */
static int json_get(const char *json, const char *key, char *out, size_t n) {
    char pat[80];
    snprintf(pat, sizeof pat, "\"%s\"", key);
    const char *p = strstr(json, pat);
    if (!p) return 0;
    p += strlen(pat);
    while (*p && (isspace((unsigned char)*p) || *p == ':')) p++;
    size_t o = 0;
    if (*p == '"') {
        p++;
        while (*p && *p != '"' && o + 1 < n) {
            if (*p == '\\' && p[1]) { p++; }
            out[o++] = *p++;
        }
    } else {
        while (*p && *p != ',' && *p != '}' && !isspace((unsigned char)*p) && o + 1 < n) out[o++] = *p++;
    }
    out[o] = 0;
    return 1;
}

static void persist(void) { bank_save(&bank, DATA_FILE); }

/* ---------- API handlers ---------- */

static size_t account_json(const Account *a, char *out, size_t n) {
    char name[NAME_LEN * 6], bal[32];
    json_escape(a->name, name, sizeof name);
    bank_format_amount(a->balance_paise, bal, sizeof bal);
    return (size_t)snprintf(out, n,
        "{\"number\":%ld,\"name\":\"%s\",\"type\":\"%s\",\"balance\":\"%s\",\"active\":%s,\"created\":%ld}",
        a->number, name, bank_type_name(a->type), bal, a->active ? "true" : "false", (long)a->created_at);
}

static void api_open(int fd, const char *body) {
    char name[NAME_LEN], pin[16], type[16], amt[32] = "0";
    if (!json_get(body, "name", name, sizeof name) || !json_get(body, "pin", pin, sizeof pin)) { json_err(fd, 400, "name and pin required"); return; }
    json_get(body, "type", type, sizeof type);
    json_get(body, "amount", amt, sizeof amt);
    long long paise = bank_parse_amount(amt);
    if (paise < 0) { json_err(fd, 400, "Invalid amount"); return; }
    long num;
    BankError e = bank_open(&bank, name, pin, (type[0] == 'C' || type[0] == 'c') ? ACC_CURRENT : ACC_SAVINGS, paise, &num);
    if (e != BANK_OK) { json_err(fd, 400, bank_strerror(e)); return; }
    persist();
    char out[512]; size_t n = account_json(bank_find(&bank, num), out, sizeof out);
    char resp[640]; int m = snprintf(resp, sizeof resp, "{\"ok\":true,\"account\":%.*s}", (int)n, out);
    respond(fd, 200, "application/json", resp, (size_t)m);
}

static void api_account(int fd, const char *body) {
    char numS[32], pin[16];
    if (!json_get(body, "number", numS, sizeof numS) || !json_get(body, "pin", pin, sizeof pin)) { json_err(fd, 400, "number and pin required"); return; }
    long num = strtol(numS, NULL, 10);
    BankError e = bank_auth(&bank, num, pin);
    if (e != BANK_OK) { json_err(fd, e == BANK_ERR_BAD_PIN ? 401 : 400, bank_strerror(e)); return; }

    static char resp[OUT_MAX];
    char acc[512]; account_json(bank_find(&bank, num), acc, sizeof acc);
    size_t o = (size_t)snprintf(resp, sizeof resp, "{\"ok\":true,\"account\":%s,\"transactions\":[", acc);
    Transaction txs[100];
    int n = bank_statement(&bank, num, txs, 100);
    for (int i = 0; i < n && o + 256 < sizeof resp; i++) {
        char a[32], b[32];
        bank_format_amount(txs[i].amount_paise, a, sizeof a);
        bank_format_amount(txs[i].balance_after, b, sizeof b);
        o += (size_t)snprintf(resp + o, sizeof resp - o,
            "%s{\"id\":%ld,\"type\":\"%s\",\"amount\":\"%s\",\"balance\":\"%s\",\"counterpart\":%ld,\"at\":%ld}",
            i ? "," : "", txs[i].id, bank_tx_name(txs[i].type), a, b, txs[i].counterpart, (long)txs[i].at);
    }
    o += (size_t)snprintf(resp + o, sizeof resp - o, "]}");
    respond(fd, 200, "application/json", resp, o);
}

static void api_money(int fd, const char *body, const char *op) {
    char numS[32], pin[16] = "", toS[32] = "0", amtS[32];
    if (!json_get(body, "number", numS, sizeof numS) || !json_get(body, "amount", amtS, sizeof amtS)) { json_err(fd, 400, "number and amount required"); return; }
    json_get(body, "pin", pin, sizeof pin);
    json_get(body, "to", toS, sizeof toS);
    long num = strtol(numS, NULL, 10), to = strtol(toS, NULL, 10);
    long long paise = bank_parse_amount(amtS);
    if (paise < 0) { json_err(fd, 400, "Invalid amount"); return; }
    BankError e;
    if (!strcmp(op, "deposit"))       e = bank_deposit(&bank, num, paise);
    else if (!strcmp(op, "withdraw")) e = bank_withdraw(&bank, num, pin, paise);
    else                              e = bank_transfer(&bank, num, pin, to, paise);
    if (e != BANK_OK) { json_err(fd, e == BANK_ERR_BAD_PIN ? 401 : 400, bank_strerror(e)); return; }
    persist();
    char acc[512]; account_json(bank_find(&bank, num), acc, sizeof acc);
    char resp[640]; int m = snprintf(resp, sizeof resp, "{\"ok\":true,\"account\":%s}", acc);
    respond(fd, 200, "application/json", resp, (size_t)m);
}

static void api_close(int fd, const char *body) {
    char numS[32], pin[16];
    if (!json_get(body, "number", numS, sizeof numS) || !json_get(body, "pin", pin, sizeof pin)) { json_err(fd, 400, "number and pin required"); return; }
    BankError e = bank_close(&bank, strtol(numS, NULL, 10), pin);
    if (e != BANK_OK) { json_err(fd, e == BANK_ERR_BAD_PIN ? 401 : 400, bank_strerror(e)); return; }
    persist();
    respond(fd, 200, "application/json", "{\"ok\":true}", 11);
}

static void api_summary(int fd) {
    long long total = 0; int active = 0;
    for (int i = 0; i < bank.account_count; i++) if (bank.accounts[i].active) { active++; total += bank.accounts[i].balance_paise; }
    char tot[32]; bank_format_amount(total, tot, sizeof tot);
    char resp[256];
    int m = snprintf(resp, sizeof resp, "{\"ok\":true,\"accounts\":%d,\"active\":%d,\"transactions\":%d,\"total_balance\":\"%s\"}",
                     bank.account_count, active, bank.tx_count, tot);
    respond(fd, 200, "application/json", resp, (size_t)m);
}

/* ---------- static files ---------- */

static void serve_file(int fd, const char *path) {
    if (strstr(path, "..")) { respond(fd, 404, "text/plain", "not found", 9); return; }
    char full[512];
    snprintf(full, sizeof full, "web/%s", (*path == 0 || !strcmp(path, "/")) ? "index.html" : path + 1);
    FILE *f = fopen(full, "rb");
    if (!f) { respond(fd, 404, "text/plain", "not found", 9); return; }
    static char buf[OUT_MAX];
    size_t n = fread(buf, 1, sizeof buf, f);
    fclose(f);
    const char *ct = strstr(full, ".css") ? "text/css" : strstr(full, ".js") ? "application/javascript"
                   : strstr(full, ".svg") ? "image/svg+xml" : "text/html; charset=utf-8";
    respond(fd, 200, ct, buf, n);
}

/* ---------- request dispatch ---------- */

static void handle(int fd) {
    static char req[REQ_MAX + 1];
    size_t got = 0; char *body = NULL; size_t clen = 0;
    for (;;) {
        ssize_t r = recv(fd, req + got, REQ_MAX - got, 0);
        if (r <= 0) break;
        got += (size_t)r; req[got] = 0;
        char *hend = strstr(req, "\r\n\r\n");
        if (hend) {
            body = hend + 4;
            char *cl = strcasestr(req, "Content-Length:");
            if (cl && cl < hend) clen = (size_t)strtoul(cl + 15, NULL, 10);
            if (clen > REQ_MAX) { json_err(fd, 400, "body too large"); return; }
            if (got - (size_t)(body - req) >= clen) break;
        }
        if (got >= REQ_MAX) break;
    }
    if (!body) return;
    body[clen] = 0;

    char method[8] = "", path[256] = "";
    if (sscanf(req, "%7s %255s", method, path) != 2) { respond(fd, 400, "text/plain", "bad", 3); return; }
    char *q = strchr(path, '?'); if (q) *q = 0;

    if (!strncmp(path, "/api/", 5)) {
        const char *ep = path + 5;
        if (!strcmp(method, "GET") && !strcmp(ep, "summary")) { api_summary(fd); return; }
        if (strcmp(method, "POST")) { json_err(fd, 405, "POST required"); return; }
        if (!strcmp(ep, "open"))          api_open(fd, body);
        else if (!strcmp(ep, "account"))  api_account(fd, body);
        else if (!strcmp(ep, "deposit"))  api_money(fd, body, "deposit");
        else if (!strcmp(ep, "withdraw")) api_money(fd, body, "withdraw");
        else if (!strcmp(ep, "transfer")) api_money(fd, body, "transfer");
        else if (!strcmp(ep, "close"))    api_close(fd, body);
        else json_err(fd, 404, "unknown endpoint");
        return;
    }
    if (strcmp(method, "GET")) { respond(fd, 405, "text/plain", "GET only", 8); return; }
    serve_file(fd, path);
}

int main(int argc, char **argv) {
    int port = argc > 1 ? atoi(argv[1]) : 8080;
    if (bank_load(&bank, DATA_FILE) != 0) fprintf(stderr, "warning: data file unreadable, starting fresh\n");
    signal(SIGINT, on_sigint);
    signal(SIGTERM, on_sigint);

    int srv = socket(AF_INET, SOCK_STREAM, 0);
    if (srv < 0) { perror("socket"); return 1; }
    int one = 1; setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    addr.sin_port = htons((unsigned short)port);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    if (listen(srv, 16) < 0) { perror("listen"); return 1; }
    printf("C Bank server listening on http://127.0.0.1:%d\n", port);
    fflush(stdout);

    while (running) {
        int fd = accept(srv, NULL, NULL);
        if (fd < 0) { if (errno == EINTR) continue; perror("accept"); break; }
        handle(fd);
        close(fd);
    }
    persist();
    close(srv);
    printf("\nserver stopped\n");
    return 0;
}
