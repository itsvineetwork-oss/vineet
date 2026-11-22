CC      = gcc
CFLAGS  = -std=gnu11 -O2 -Wall -Wextra -Wpedantic

all: bankcli bankserver

bankcli: cli.c bank.c bank.h
	$(CC) $(CFLAGS) -o $@ cli.c bank.c

bankserver: server.c bank.c bank.h
	$(CC) $(CFLAGS) -o $@ server.c bank.c

test: test.c bank.c bank.h
	$(CC) $(CFLAGS) -o banktest test.c bank.c && ./banktest

clean:
	rm -f bankcli bankserver banktest bank.dat bank.dat.tmp

.PHONY: all test clean
