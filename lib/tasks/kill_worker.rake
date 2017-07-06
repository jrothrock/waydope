require 'sidekiq/api'
namespace :kill_worker do
    desc "loop through queue"
	task :generate, [:id] => :environment do |t,args|
        job = Sidekiq::RetrySet.new.find_job(args[:job_id])
        job.delete
    end
end