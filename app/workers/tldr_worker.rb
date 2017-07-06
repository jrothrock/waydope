require 'pismo'
class TldrWorker
    include Sidekiq::Worker
	def perform
		posts = NewsPost.where("categorized = false AND link != 'na'").all
        posts.each do |post|
            text = Pismo::Document.new(post.link).body
        end
	end
end
