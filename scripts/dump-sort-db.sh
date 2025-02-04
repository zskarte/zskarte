#!/usr/bin/env sh
#create the dump
docker exec --env PGPASSWORD="supersecret123" pgadmin-zskarte /usr/local/pgsql-16/pg_dump --host "postgresql-zskarte" --port "5432" --username "postgres" --format=p "zskarte" | sed 's/\r$//' > packages/server/init/init_new.sql

fileToUse=packages/server/init/init_merged.sql
if which perl >/dev/null; then
  #merge original init with new one to prevent timestamp updates only
  ./scripts/pg_dump_update_merge_sort.pl packages/server/init/init.sql packages/server/init/init_new.sql > packages/server/init/init_merged.sql
  if [ $? -ne 0 ] || [ ! -s packages/server/init/init_merged.sql ]; then
    echo "there was an error on merge the init.sql, sort only"
    ./scripts/pg_dump_sort.pl packages/server/init/init_new.sql > packages/server/init/init_merged.sql
    if [ $? -ne 0 ] || [ ! -s packages/server/init/init_merged.sql ]; then
      echo "sort also failed, use plain export"
      fileToUse=packages/server/init/init_new.sql
      if [ -e packages/server/init/init_merged.sql ]; then
        rm packages/server/init/init_merged.sql
      fi
    else
      echo "init.sql successful exported & sorted"
      rm packages/server/init/init_new.sql
    fi
  else
      echo "init.sql successful exported & merged/updated & sorted"
      rm packages/server/init/init_new.sql
  fi
else
  echo "ERROR: no perl installed to run pg_dump_update_merge_sort.pl, use plain export"
  fileToUse=packages/server/init/init_new.sql
fi

rm packages/server/init/init.sql
mv ${fileToUse} packages/server/init/init.sql
