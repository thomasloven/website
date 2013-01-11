#!/bin/sh

cd _site
ncftpput -R -v -u "thomasloven.com" ftp.thomasloven.com / .
