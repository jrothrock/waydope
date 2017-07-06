sudo service waydope start
bundle exec sidekiq -d -L log/sidekiq.log -e production