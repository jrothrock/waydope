require 'sidekiq/api'
namespace :retry_workers do
    desc "loop through queue"
	task :generate => :environment do
        jobs = Sidekiq::RetrySet.new
        jobs.each{|job| job.retry}
    end
end