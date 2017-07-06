ls -t /home/jackrothrock/waydope/db/backups/*.sql | sed -e '1,13d' | xargs -d '\n' rm
echo Done at `date +\%Y-\%m-\%d_\%T`
pg_dump waydope_production --username=jackrothrock > /home/jackrothrock/waydope/db/backups/`date +\%Y-\%m-\%d_\%T`.sql
