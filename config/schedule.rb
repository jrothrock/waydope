# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever
environment = 'development'
set :environment, environment

every 1.minutes do
    rake "queue:generate", :output => {:error => "#{Whenever.path}/log/queue/queue.error.log", :standard => "#{Whenever.path}/log/queue/queue.standard.log"}
end

every 3.minutes do
    rake "hotness:generate", :output => {:error => "#{Whenever.path}/log/hotness/hotness.error.log", :standard => "#{Whenever.path}/log/hotness/hotness.standard.log"}
end

every 1.hours do
    rake "clean:generate", :output => {:error => "#{Whenever.path}/log/clean/clean.error.log", :standard => "#{Whenever.path}/log/clean/clean.standard.log"}
end