require 'rubygems'
require 'active_support/core_ext/numeric/time'
require 'action_view'
require 'action_view/helpers'
include ActionView::Helpers::DateHelper
include ActionView::Helpers::NumberHelper
module Json
  class Checker
	include ActionView::Helpers::DateHelper
	include ActionView::Helpers::NumberHelper
	def self.singleCheck(posts,type,authorization=nil,user=nil)
		## if singleCheck called on it's own find the user, if being called from checkUser, use the user.
		begin
			user ||= User.find_by_token(authorization.split(' ').last)
		rescue 
			user = nil
		end
		if type === 'music' || type === 'videos'
			posts.each do |post|
				if user && user.uuid
					post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
					post_votes_hash = post["votes"]
					post["user_voted"] = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
					post["likes"] = nil
					post["votes"] = nil
					post["report_users"] = nil
					post["ratings"] = nil
				end
				if(post && post["created_at"]) then post["time_ago"] = time_ago_in_words(post["created_at"]).gsub('about ','') + ' ago' end
			end
		elsif type === 'news' && posts != []
			posts.each do |post|
				if user
					post_votes_hash = post["votes"]
					post["user_voted"] = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
					post["votes"] = nil
					post["report_users"] = nil
					post["ratings"] = nil
				end
				if(post && post["created_at"]) then post["time_ago"] = time_ago_in_words(post["created_at"]).gsub('about ','') + ' ago' end
			end
		elsif (type === 'apparel' || type === 'technology') && posts != []
			posts.each do |post|
				if user
					post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
					post_votes_hash = post["votes"]
					post["user_voted"] = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
					post["likes"] = nil
					post["votes"] = nil
					post["ratings"] = nil
					post["report_users"] = nil
				end
				post["price"] = number_to_currency(post["price"])
				post["sale_price"] = nil
				# post["sale_price"] = post["sale_price"].to_f != 0 ? number_to_currency(post["sale_price"]) : 0
				post["shipping"] = number_to_currency(post["shipping"])
				if !!post["photos"] then post["photos"]=[] end
			end
		end
		return posts
	end
		
			
	def self.checkUser(posts,songs,videos,apparel,technology,header)
		if header && header != 'Bearer undefined'
			# this will fail because for some reason the header is undefined or something. I'm lazy, and this is a temp fix.
			begin
			 user = User.find_by_token(header.split(' ').last)
			rescue 
			 user = nil
			end
		end
		posts.each do |category|
			singleCheck(category,'news',nil,user)
		end

		songs.each do |genre|
			singleCheck(genre,'music',nil,user)
		end
		
		videos.each do |category|
			singleCheck(category,'videos',nil,user)
		end
		
		apparel.each do |category|
			singleCheck(category,'apparel',nil,user)
		end

		technology.each do |category|
			singleCheck(category,'technology',nil,user)
		end
		return [posts,songs,videos,apparel,technology]
	end

	def self.checkComments(comments,user,gen=0)
		puts comments
		puts comments.is_a?(Array)
		comments.each do |comment|
			comment_votes_hash = comment["votes"]
     		comment["user_voted"] = comment_votes_hash.key?(user) ? comment_votes_hash[user] : nil
			 if comment["children"] != []
				 checkComments(comment["children"],user,gen+1)
			 end
			comment["votes"] = nil
			comment["report_users"] = nil
		end
		result = {comments:comments}
	end
  end
end
