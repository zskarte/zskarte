#!/bin/sh
if [ "$(uname -o)" = "Darwin" ]; then
	DYLD_FALLBACK_LIBRARY_PATH=$(pwd) ./##executableName## "$@"
else
	LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:$(pwd) ./##executableName## "$@" 
fi