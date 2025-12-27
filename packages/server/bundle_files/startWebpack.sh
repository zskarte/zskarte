#!/bin/sh
if [ ! -e "libvips*" ]; then
	cp ../exec/libvips* .
fi
if [ "$(uname -o)" = "Darwin" ]; then
	libName=$(ls "sharp-$(uname -o | tr 'A-Z' 'a-z')-$(uname -m)"*.node)
	#check rpath already exist
	if ! otool -l "${libName}" | grep -A2 RPATH | grep "$(pwd)"; then
		#add it if not
		install_name_tool -add_rpath "$(pwd)" "${libName}"
	fi
	node index.js "$@"
else
	LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:$(pwd) node index.js "$@"
fi