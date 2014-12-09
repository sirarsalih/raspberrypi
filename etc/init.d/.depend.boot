TARGETS = fake-hwclock mountkernfs.sh hostname.sh udev keyboard-setup mountdevsubfs.sh console-setup networking mountall.sh mountall-bootclean.sh mountnfs.sh mountnfs-bootclean.sh x11-common kbd checkroot.sh urandom alsa-utils bootmisc.sh procps checkfs.sh mtab.sh plymouth-log kmod checkroot-bootclean.sh udev-mtab
INTERACTIVE = udev keyboard-setup console-setup kbd checkroot.sh checkfs.sh
udev: mountkernfs.sh
keyboard-setup: mountkernfs.sh udev
mountdevsubfs.sh: mountkernfs.sh udev
console-setup: mountall.sh mountall-bootclean.sh mountnfs.sh mountnfs-bootclean.sh kbd
networking: mountkernfs.sh mountall.sh mountall-bootclean.sh urandom
mountall.sh: checkfs.sh checkroot-bootclean.sh
mountall-bootclean.sh: mountall.sh
mountnfs.sh: mountall.sh mountall-bootclean.sh networking
mountnfs-bootclean.sh: mountall.sh mountall-bootclean.sh mountnfs.sh
x11-common: mountall.sh mountall-bootclean.sh mountnfs.sh mountnfs-bootclean.sh
kbd: mountall.sh mountall-bootclean.sh mountnfs.sh mountnfs-bootclean.sh
checkroot.sh: fake-hwclock keyboard-setup mountdevsubfs.sh hostname.sh
urandom: mountall.sh mountall-bootclean.sh
alsa-utils: mountall.sh mountall-bootclean.sh mountnfs.sh mountnfs-bootclean.sh
bootmisc.sh: mountnfs-bootclean.sh mountall-bootclean.sh mountall.sh mountnfs.sh udev checkroot-bootclean.sh
procps: mountkernfs.sh mountall.sh mountall-bootclean.sh udev
checkfs.sh: checkroot.sh mtab.sh
mtab.sh: checkroot.sh
plymouth-log: mountall.sh mountall-bootclean.sh mountnfs.sh mountnfs-bootclean.sh
kmod: checkroot.sh
checkroot-bootclean.sh: checkroot.sh
udev-mtab: udev mountall.sh mountall-bootclean.sh
