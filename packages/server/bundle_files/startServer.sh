#!/bin/sh
if [ "$(uname -o)" = "Darwin" ]; then
	DYLD_FALLBACK_LIBRARY_PATH=$(pwd) ./zskarte-server "$@"
else
	LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:$(pwd) ./zskarte-server "$@" 
fi