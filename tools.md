---
layout: default
title: Tools of the Trade
---

# Tools of the Trade
With five hundred pounds of suction, this suction-mount holds safe-drilling
rigs quite well to a wide variety of safes. It is designed for use with either
of the following drill rigs: the Lockmasters Magnum Bullet or the StrongArm
Mini-Rig.

![][suction-mount]
*Suction mount*

![][suction-in-use]
*Suction mount in use with Magnum Bullet II*

![][geocracker-hud]
*GeoCracker™ representation of an indirect-drive vault lock*

I made this tool myself by adapting a big bad hand-pumped suction device. I do
not manufacture this tool for sale. If you're a professional safe technician in
need of such a tool, you can either make their own or buy the StrongArm
Mini-Vac, which is similar.

# Free Safe-lock Software
Safe and vault work can be aided greatly by the use of appropriate software.
The Safe House™ provides two free web-applications for use by professional
safecrackers and safe-technicians. If you have a strong knowledge of safe and
vault locks, you should be able to use these applications easily. You can run
them online or, alternatively, download the .ZIP archive for off-line use.

- [Run ComboGenerator™!][combogenerator] (an online web-app that generates
  pseudo-random combinations suitable for use with a combination lock)
- [Run GeoCracker™!][geocracker] (an online geometry web-app that performs
  vector addition and coordinate conversion, useful for calculating
  drill-points on safe and vault locks)
- [Download ComboGenerator™ & GeoCracker™ for offline use][download-apps]

# Free Cryptographic Software
If you're in need of strong encryption software that is fast and free, then
CIPHERSABER is for you. Designed by Arnold Reinhold, it incorporates Ron
Rivest's well-known ARC4 stream-cipher algorithm — an lgorithm which, since its
introduction in 1987, has worked astonishingly well considering its simplicity.
Among other enhancements, CipherSaber improves upon ARC4 by applying a random
10-byte initialization-vector to each message's encryption. This drastically
improves the security and usability of the algorithm without sacrificing its
speed, efficiency, and simplicity.

Speed and efficiency are important because they allow CipherSaber to run well even within very low-cost devices. Simplicity in a crypto-system is desirable because it facilitates complete security analysis. If a system is too complex to be understood, then it is almost certainly insecure and may even contain intentional back-doors.

I've implemented the CIPHERSABER-2 algorithm in C. My implementation generates its initialization vectors using the ARC4 pseudo-random byte-stream generator (seeded with the current time, process ID, and memory location), thereby making the output both unique and indistinguishable from random noise. This helps to assure the security of your encrypted data and to hide the fact that you're using encryption software. (If some despotic ruler prohibits encryption or requires that you grant access to your data, then it will be advantageous to defy such bogus laws in secret.)

In the interest of promoting the availability of encryption technology world-wide, my CipherSaber is hereby placed in the public domain and is freely available for any use whatsoever. As far as I'm concerned, everyone everywhere has the right to unrestricted use of this software.

- [Download CipherSaber-2 source code in C][saber-source] (simple &
  well-commented; compiles with GCC in Linux or with Visual C in MS Windows)
- [Download CipherSaber-2 executable for MS Windows][saber-exec] (32-bit)

To learn more about the CipherSaber algorithm and how you can help save the
world, see the [CipherSaber home-page][saber-home].


[combogenerator]: combo_generator.htm
[download-apps]:  download/tsh-software.zip
[geocracker]:     geocracker.htm
[geocracker-hud]: images/hud.jpg
[saber-exec]:     https://github.com/jeremyreeder/safehouse/releases/download/1.0/cs2.exe
[saber-home]:     http://ciphersaber.gurus.org/
[saber-source]:   download/cs2.c
[suction-in-use]: images/suctionmountinuse.jpg
[suction-mount]:  images/suctionmount.jpg
