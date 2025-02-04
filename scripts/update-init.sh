#!/usr/bin/env sh

#abort if any command fails
set -e
logPrefix="[update init] "
if [ -e data ] && [ ! -e data_backup ]; then
  echo "${logPrefix}make sure DB runs for export"
  npm run docker-run
  echo "${logPrefix}export current rights config"
  npm run server:export
fi
echo "${logPrefix}stop DB"
npm run docker-stop
if [ ! -e data_backup ]; then
  echo "${logPrefix}backup own DB"
  mv data data_backup
fi

if [ "$(uname -s)" = "Linux" ]; then
  echo "${logPrefix}do linux prerequisites inkl. sudo for chown"
  if [ -e data ]; then
    echo "${logPrefix}there seams to be another db state backup to data_backup2"
    if [ -e data_backup2 ]; then
      sudo rm -rf data_backup2
    fi
    mv data data_backup2
  fi
  mkdir data
  mkdir data/postgresql
  sudo chown 1001:1001 data/postgresql
  mkdir data/pgadmin
  sudo chown 5050:5050 data/pgadmin
fi

echo "${logPrefix}reinitialize the DB"
npm run docker-run
echo "${logPrefix}import the config"
npm run server:import
echo "${logPrefix}create new DB dump"
$(dirname $0)/dump-sort-db.sh

echo "${logPrefix}stop DB"
npm run docker-stop
echo "${logPrefix}cleanup temp DB"
sudo rm -rf data
echo "${logPrefix}restore own DB"
mv data_backup data
echo "${logPrefix}start DB"
npm run docker-run
