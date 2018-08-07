#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* Specify your OS:  UNIX or MICROSOFT. */
#define MICROSOFT

/* CipherSaber-2 (CS2) stream-cipher, designed by Arnold Reinhold and implemented in C by Jeremy Reeder.
** CS2 is a simple and efficient but highly secure encryption algorithm, and this implementation of it is hereby
** placed in the public domain.  Whoever and wherever you are, you have the right to obtain, use, and distribute
** this code without any restrictions whatsoever.  If your government thinks otherwise, then be sneaky about it. */

#ifdef MICROSOFT
/* MS Visual C needs these header files in order to open standard input and standard output in binary mode. */
#include <io.h>
#include <fcntl.h>
#endif

unsigned char s[256]; /* ARC4 substitution array */
unsigned short i, j; /* array indices:  i is incremental; j is pseudo-random */

/* swap two elements of the ARC4 substitution array; used by arc4_ksa() & by arc4_outputbyte() */
void swap(unsigned short i, unsigned short j) {
	unsigned char temp = s[i];
	s[i] = s[j];
	s[j] = temp;
}

/* initialize substitution array for ARC4 key-stream generator using ARC4-KSA (analogous to shuffling a deck of cards) */
void arc4_ksa(unsigned long rounds, unsigned char *key, unsigned short key_length) {
	unsigned long k;
	for (i=0; i<256; i++)
		s[i] = i; /* start with values 0 through 255 in the substitution array (the deck) */
	j = 0;
	for (k=0; k<rounds; k++) /* standard ARC4-KSA shuffles only once, but in CS2 it can shuffle many times */
		for (i=0; i<256; i++) { /* shuffle the substitution deck, ... */
			j = (j + s[i] + key[i % key_length]) & 255; /* basing the shuffle on every byte of the key ... */
			swap(i, j); /* and moving every card within the deck at least once */
		}
	i = j = 0; /* re-initialize the indices before dealing the cards */
}

/* ARC4 algorithm to generate one pseudo-random byte (analogous to dealing one card from a deck) */
unsigned char arc4_outputbyte() {
	unsigned short x;
	/* re-shuffle the substitution array (the deck) slightly */
		i = (i + 1) & 255;
		j = (j + s[i]) & 255;
		swap(i, j);
	/* deal a card */
		x = (s[i] + s[j]) & 255;
		return s[x];
}

/* for grammatically correct text, write the letter "s" at the end of a noun if it should be plural */
char *s_if_plural(long number) {
	if (number == 1) return "";
	else return "s";
}

/* encrypt or decrypt message by XORing plaintext stream with ARC4 key-stream */
void cs2_transform(unsigned long rounds, unsigned char *cs2_key, unsigned char iv[10]) {
	short c;
	unsigned short arc4_key_length;
	unsigned char arc4_key[256];
	memcpy(arc4_key, cs2_key, strlen(cs2_key));
	memcpy(arc4_key + strlen(cs2_key), iv, 10);
	arc4_key_length = strlen(cs2_key) + 10;
	fprintf(stderr, "   -\tInitializing ARC4 key-stream generator with %d round%s of ARC4-KSA.\n", rounds, s_if_plural(rounds));
	arc4_ksa(rounds, arc4_key, arc4_key_length);
	fprintf(stderr, "   -\tWiping cryptographic keys from memory.\n");
	strncpy(cs2_key, "", strlen(cs2_key)); /* wipe CS2 key from memory */
	strncpy(arc4_key, "", strlen(cs2_key)); /* wipe ARC4 key (less IV) from memory */
	fprintf(stderr, "CS2: Performing ARC4 cryptographic transformation.\n");
	fprintf(stderr, "   -\tTransforming data-stream by exclusive disjunction with ARC4 key-stream.\n");
	while ((c = fgetc(stdin)) != EOF)
		fputc((unsigned char) (c ^ arc4_outputbyte()), stdout);
	fprintf(stderr, "   -\tWiping secrets of ARC4 state from memory.\n");
	strncpy(s, "", 256); /* zeroize substitution array to prevent recovery of keystream */
	j = 0; /* zeroize pseudo-random index; incremental index i remains but is not a secret */
}

void cs2_encrypt(unsigned long rounds, unsigned char *key) {
	unsigned short x;
	char seed[256]; /* unique seed for generating pseudo-random IV */
	unsigned char iv[10]; /* 10-byte pseudo-random initialization-vector (IV) */
	unsigned short key_length;
	fprintf(stderr, "CS2: Preparing to encrypt data.\n");
	fprintf(stderr, "   -\tGenerating a unique pseudo-random initialization-vector.\n");
	/* To assure the security of the encrypted communications, the psuedo-random IV must be unique
	** among all messages that are encrypted with the same CipherSaber parameters.  To that end, the
	** seed from which that IV will be generated will contain enough data, specific to the current
	** invocation of CS2, to produce an extremely high probability that Hell will freeze over before
	** any two identical IVs are produced. */
	sprintf(seed, "%d;", time(NULL)); /* seed with number of seconds since the Epoch ... */
	sprintf(seed + strlen(seed), "%d;", getpid()); /* & the current process's ID number ... */
	sprintf(seed + strlen(seed), "%d", iv); /* & the memory address of the uninitialized IV */
	arc4_ksa(1, seed, strlen(seed)); /* seed ARC4 pseudo-random byte-stream generator */
	for (x=0; x<10; x++) {
		iv[x] = arc4_outputbyte(); /* use ARC4 to generate one byte of pseudo-random IV */
		fputc(iv[x], stdout); /* write that byte to the encrypted output */
	}
	if (rounds < 20) {
		fprintf(stderr, "   *\tWarning: Doing only %d round%s of ARC4-KSA shuffling (20+ suggested).\n", rounds, s_if_plural(rounds));
	}
	key_length = strlen(key);
	if (key_length < 15) {
		fprintf(stderr, "   *\tWarning: CS2 key-length is only %d character%s (15+ suggested).\n", key_length, s_if_plural(key_length));
	}
	cs2_transform(rounds, key, iv); /* perform the encryption */
	fprintf(stderr, "CS2: Encryption complete.\n");
}

void cs2_decrypt(unsigned long rounds, unsigned char *key) {
	unsigned char iv[10]; /* 10-byte initialization-vector (IV) */
	unsigned short x;
	fprintf(stderr, "CS2: Preparing to decrypt data.\n");
	fprintf(stderr, "   -\tReading initialization-vector from input.\n");
	for (x=0; x<10; x++)
		iv[x] = fgetc(stdin); /* read IV from first ten bytes of encrypted file */
	cs2_transform(rounds, key, iv); /* perform the decryption */
	fprintf(stderr, "CS2: Decryption complete.\n");
}

int main(short argc, unsigned char *argv[]) {
	unsigned char key[246] = "";
	long rounds;
#ifdef MICROSOFT
	setmode(fileno(stdin), O_BINARY);
	setmode(fileno(stdout), O_BINARY);
#endif
	if (argc > 3) {
		strncat(key, argv[3], 246); /* populate key variable from key argument */
		strncpy(argv[3], "", strlen(argv[3])); /* wipe key argument from memory */
		if (argc == 4) {
			rounds = atol(argv[2]);
			if (rounds > 0) {
				if (strcmp(argv[1], "-e") == 0) {
					cs2_encrypt(rounds, key);
					return 0;
				} else if (strcmp(argv[1], "-d") == 0) {
					cs2_decrypt(rounds, key);
					return 0;
				}
			}
		}
	}
	fprintf(stderr, "\nCipherSaber-2 stream-cipher, designed by Arnold Reinhold.\n");
	fprintf(stderr, "Public-domain implementation in C by Jeremy Reeder, CipherKnight.\n");
	fprintf(stderr, "Version 0.62 [2009-10-29], from <http://thesafehouse.info/tools.htm>.\n\n");
	fprintf(stderr, "To encrypt:  %s -e N \"K\" <inputfile >outputfile\n", argv[0]);
	fprintf(stderr, "To decrypt:  %s -d N \"K\" <inputfile >outputfile\n", argv[0]);
	fprintf(stderr, "   where N is the number of rounds in the ARC4-KSA shuffling process\n");
	fprintf(stderr, "   & where K is the key (i.e. a secret word or phrase).\n");
	return 1;
}
