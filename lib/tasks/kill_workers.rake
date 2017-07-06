require 'sidekiq/api'
namespace :kill_workers do
    desc "loop through queue"
	task :generate => :environment do
        rs = Sidekiq::RetrySet.new
        rs.size
        rs.clear
    end
end