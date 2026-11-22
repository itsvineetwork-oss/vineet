# C Bank

Banking system written in C with a console app and an HTML frontend served by a small C HTTP server.

## Files

| File | Purpose |
| --- | --- |
| `bank.h` / `bank.c` | Core library: accounts, deposit, withdraw, transfer, statement, binary file persistence |
| `cli.c` | Console menu application (`bankcli`) |
| `server.c` | HTTP server with JSON API, serves `web/` (`bankserver`) |
| `web/index.html` | Browser frontend |
| `test.c` | Unit tests |

## Build

```bash
make          # builds bankcli and bankserver
make test     # runs unit tests
```

## Run

Console:

```bash
./bankcli
```

Web:

```bash
./bankserver 8080
```

Open http://127.0.0.1:8080. Data is stored in `bank.dat` in the working directory.

## API

All POST bodies are JSON. Amounts are strings or numbers in rupees (`"150.50"`).

| Endpoint | Body |
| --- | --- |
| `GET /api/summary` | – |
| `POST /api/open` | `name`, `pin`, `type` (`S`/`C`), `amount` |
| `POST /api/account` | `number`, `pin` |
| `POST /api/deposit` | `number`, `amount` |
| `POST /api/withdraw` | `number`, `pin`, `amount` |
| `POST /api/transfer` | `number`, `pin`, `to`, `amount` |
| `POST /api/close` | `number`, `pin` |

The server binds to localhost only and is intended for local use.
