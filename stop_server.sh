sudo service waydope stop
ps -ef | grep sidekiq | grep -v grep | awk '{print $2}' | xargs kill -9