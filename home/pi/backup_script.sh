#!/bin/bash

# Setting up directories
SUBDIR=raspberrypi_backup
DIR=/mnt/$SUBDIR
LOGFILE=backup_script.log
NODESERVERFILE=/home/pi/node_server.js

# Shut down node express
echo "Shutting down node express..." > $LOGFILE
pkill -f node

echo "Starting backup process..." >> $LOGFILE

# First check if pv package is installed, if not, install it first
PACKAGESTATUS=`dpkg -s pv | grep Status`;

if dpkg -s pv | grep -q Status;
   then
      echo "Package 'pv' is installed." >> $LOGFILE
   else
      echo "Package 'pv' is NOT installed." >> $LOGFILE
      echo "Installing package 'pv'. Please wait..." >> $LOGFILE
      apt-get -y install pv
fi

# Check if backup directory exists
if [ ! -d "$DIR" ];
   then
      echo "Backup directory $DIR does not exist, creating it now..." >> $LOGFILE
      mkdir $DIR
fi

# Create a file name with datestamp for our current backup (without .img suffix)
OFILE="$DIR/backup_$(date +%Y%m%d_%H%M%S)"

# Create final filename, with suffix
OFILEFINAL=$OFILE.img

# First sync disks
sync; sync

# Begin the backup process, should some time from SD card to HDD
echo "Backing up SD card to USB HDD." >> $LOGFILE
echo "This will take some time depending on your SD card size and read performance. Please wait..." >> $LOGFILE
SDSIZE=`blockdev --getsize64 /dev/mmcblk0`;
pv -tpreb /dev/mmcblk0 -s $SDSIZE | dd of=$OFILE bs=1M conv=sync,noerror iflag=fullblock

# Wait for DD to finish and catch result
RESULT=$?

# If command has completed successfully, delete previous backups and exit
if [ $RESULT = 0 ];
   then
      echo "Successful backup, deleting old backup files..." >> $LOGFILE
      rm -f $DIR/backup_*.img
      mv $OFILE $OFILEFINAL 
      rm -rf $OFILEFINAL
      echo "Backup process completed. FILE: $OFILEFINAL" >> $LOGFILE
      
      # Update node server file with information about backup
      sed -i '1 c\
               var backupMsg = "<h3 style=\\"color:green;\\">Last server backup successfully completed on "+new Date().toLocaleString()+"</h3>";' $NODESERVERFILE
      
   # Else remove attempted backup file
   else
      echo "Backup failed. Old backup files untouched." >> $LOGFILE
      echo "Please check there is sufficient space on the HDD." >> $LOGFILE
      
      # Update node server file with information about backup
       sed -i '1 c\
               var backupMsg = "<h3 style=\\"color:red;\\">Last server backup FAILED  on "+new Date().toLocaleString()+"</h3>";' $NODESERVERFILE

      rm -f $OFILE
fi

# Reboot 
reboot
