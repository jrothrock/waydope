require 'sidekiq/api'
namespace :retry_worker do
    desc "loop through queue"
	task :generate, [:id] => :environment do |t,args|
        job = Sidekiq::RetrySet.new.find_job(args[:id])
        job.retry
    end
end