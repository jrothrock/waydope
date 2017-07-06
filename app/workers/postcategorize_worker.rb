class PostcategorizeWorker
	include Sidekiq::Worker
	def perform
		posts = NewsPost.where('categorized = false').all
		posts.each do |post|

			# Keeps creating new instances for some reason.
			# This method, from what I've tried, MAY have led to a memory leak.
			# category = BoardCategory.where("title = ?",post.main_category).first_or_create do |new_category|
			# 	new_category.title = post.main_category
			# 	new_category.display = post.main_category.titleize
			# 	new_category.count = 1
			# 	new_category.top_day << post
			# 	new_category.top_week << post
			# 	new_category.top_month << post
			# 	new_category.top_year << post
			# 	new_category.top_alltime << post
			# end
			if post.old_category
				oldcategory = BoardCategory.where("url = ?",post.old_category).first
				oldcategory.count -= 1
				# did include? instead of Set or Hash, due to there only being three. May want to change later.
				if oldcategory.top_day.include?(post.uuid) then oldcategory.top_day -= [post.uuid]	end
				if oldcategory.top_week.include?(post.uuid) then oldcategory.top_week -= [post.uuid] end
				if oldcategory.top_month.include?(post.uuid) then oldcategory.top_month -= [post.uuid] end
				if oldcategory.top_year.include?(post.uuid) then oldcategory.top_year -= [post.uuid] end
				if oldcategory.top_alltime.include?(post.uuid) then oldcategory.top_alltime -= [post.uuid] end
				oldcategory.save
				post.old_category = nil
			end
			category = BoardCategory.where("url = ?",post.main_category).first
			if category
				category.count += 1
				if category.top_day.length < 5 then category.top_day << post.uuid end
				if category.top_week.length < 5 then category.top_week << post.uuid end
				if category.top_month.length < 5 then category.top_month << post.uuid end
				if category.top_year.length < 5 then category.top_year << post.uuid end
				if category.top_alltime.length < 5 then category.top_alltime << post.uuid end
				category.new_posts = true
				category.save
			else
				new_category =  BoardCategory.new
				new_category.title = post.main_category_display.strip()
				new_category.url = post.main_category.strip()
				new_category.count = 1
				new_category.top_day << post.uuid
				new_category.top_week << post.uuid
				new_category.top_month << post.uuid
				new_category.top_year << post.uuid
				new_category.top_alltime << post.uuid
				new_category.new_posts = true
				new_category.save
			end
			post.categorized = true
			if !post.worked
				puts 'post purge'
				NewsPost.purge_cache
			else
				puts 'app purge'
				App.purge_cache(post.post_type,post.uuid)
			end
			post.worked = true
			post.save
		end
	end
	
end
