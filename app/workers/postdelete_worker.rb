class PostdeleteWorker
	include Sidekiq::Worker
	def perform
		posts = NewsPost.where('in_deletion = true').all
		posts.each do |post|
			userids = post.likes.keys
			if userids
				userids.each do |userid|
					user = User.where('UUID = ?', userid).last
					user.posts = user.posts.except(post.uuid)
					user.save
				end
			end
			category = BoardCategory.where("url = ?",post.main_category).first
			if category
				category.count -= 1
				### Again, may want to change the include? to hash or set. 
				if category.top_day.include?(post.uuid.to_s) then category.top_day -= [post.uuid.to_s]	end
				if category.top_week.include?(post.uuid.to_s) then category.top_week -= [post.uuid.to_s] end
				if category.top_month.include?(post.uuid.to_s) then category.top_month -= [post.uuid.to_s] end
				if category.top_year.include?(post.uuid.to_s) then category.top_year -= [post.uuid.to_s] end
				if category.top_alltime.include?(post.uuid.to_s) then category.top_alltime -= [post.uuid.to_s] end
				category.save
			end
			post.in_deletion = false
			if post.deleted
				post.delete
			else
				post.save
			end
		end
	end
end
