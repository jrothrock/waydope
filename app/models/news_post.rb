require 'rubygems'
require 'active_support/core_ext/numeric/time'
require 'action_view'
require 'action_view/helpers'
require 'pismo'
class NewsPost < ApplicationRecord
	include PgSearch
	include ActionView::Helpers::DateHelper
	# belongs_to :user
	# has_many :comments, as: :commentable, dependent: :delete_all
	belongs_to :searchable, polymorphic: true
	validates :title, :main_category, :link, :url, :user_id, presence: true

	multisearchable :against => [:title, :main_category, :post_type, :description],
							 :if => lambda { |record| record.removed === false && record.flagged === false }

	pg_search_scope(
		:search,
		against: {
		title: 'A',
		main_category: 'B',
		description: 'C',
		},
		using: {
			tsearch: {
				dictionary: "english",
			}
		}
	)
	def self.find_by_category(category, limit=nil,offset=nil)
	 	# news = NewsPost.where("categorized = true AND main_category = ?", category).order("average_vote DESC").limit(limit).offset(offset)
		sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('news',true,'p')} FROM news_posts p WHERE categorized = true AND main_category = ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY average_vote DESC, created_at DESC OFFSET ? LIMIT ?", category,offset,limit]) 
		news = NewsPost.find_by_sql(sanitized_query)
	 	#news = NewsPost.where("category = ?", category).order("freshness DESC").limit(count)
		return news
	end

	def self.sanitize(link) #this can definitely be refined and made better
		begin 
			if link
				nsfw = false
				flagged = false
				if !link.start_with?('http')
					link = 'http://' + link
				end
				if open("#{Rails.root}/lib/assets/hosts") { |f| f.each_line.detect { |line| /^#{URI.parse(link).host}$/.match(line) } }
					flagged = true
					nsfw = true
				end
				return [link,nsfw,flagged]
			else
				puts 'link type doesnt work'
				return [false,false,false]
			end
		rescue URI::InvalidURIError => e
			puts 'link type definitely doesnt work'
			return [false,false,false]
		end
	end

	def self.findUrl(post,title)
		if !title || title != post.title || !post.url
			if !NewsPost.exists? NewsPost.exists?(url: post.og_url_name, main_category: post.main_category)
				return post.og_url_name
			elsif !NewsPost.exists?(url: "#{post.og_url_name}-#{post.main_category.parameterize.gsub('_','-')}", main_category: post.main_category)
				return "#{post.og_url_name}-#{post.main_category.parameterize.gsub('_','-')}"
			elsif !NewsPost.exists?(url: "#{post.main_category.parameterize.gsub('_','-')}-#{post.og_url_name}", main_category: post.main_category)
				return "#{post.main_category.parameterize.gsub('_','-')}-#{post.og_url_name}"
			elsif !NewsPost.exists?(url: "#{post.og_url_name}-#{Time.now.strftime('%m%d%Y')}", main_category: post.main_category)
				return "#{post.og_url_name}-#{Time.now.strftime('%m%d%Y')}"
			elsif !NewsPost.exists?(url: "#{post.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}", main_category: post.main_category)
				return "#{post.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}"
			else
				#this will most likely never result in a collision, and if it does, it was purposeful, and they'll just receive the first one
				return "#{post.og_url_name}-#{Time.now.strftime('%H%M%ST%d%m%Y')}"
			end
		else
			return post.url
		end
	end


	def self.setUUID
		begin 
		uuid = SecureRandom.hex(5)
		uuid[0] = '' # bring string down to 9 characters
		# if the 68 billion mark is getting close, just remove the upper line. Bam another trillion. If that's closed in on, change the 5 to a 6. Bam another 281 trillion. 
		if(NewsPost.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, product UUID has a duplicate!' end
		return uuid
		rescue
			retry
		end
	end

	def self.userCheck(posts,header)
	    if header
	      user = User.find_by_token(header.split(' ').last)
				posts.each do |category|
					category.each do |post|
						if user
							post_votes_hash = post["votes"]
							post["user_voted"] = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
						end
						post["time_ago"] = time_ago_in_words(post["created_at"]).gsub('about ','') + ' ago'
					end
				end
	    end
	    return posts  
	  end
	
	  def self.getTeaser(link)
		  begin 
			doc = Pismo::Document.new(link)
			i = 0
			puts doc.sentences
			if doc && doc.sentences
				begin
					i += 1
				end while doc.sentences(i).length < 270
				sentences = doc.sentences(i+1)
				teaser = "#{sentences[0..255]}#{sentences[256] === ' ' ? ' ' : ''}#{sentences.length > 256 ? sentences[256..270].split()[0] : ''}..."
			else
				teaser = ""
			end
		  rescue RuntimeError => e
			return false
		  rescue => e
			  teaser = ""
		  end
	  end
	  def self.teaserDescription(text)
		  if text.length > 255
			  if text.length < 270
				  return "#{text[0..255]}#{text[256] === ' ' ? ' ' : ''}#{text[256..270].split()[0]}"
			  else
				  return "#{text[0..245]}#{text[246] === ' ' ? ' ' : ''}#{text[246..text.length].split()[0]}"
			  end
		  else
			  return text
		  end
	  end
	  def self.purge_cache
		$redis = Redis::Namespace.new("way_dope", :redis => Redis.new)
		if $redis.exists("news_all_keys")
			$redis.lrange("news_all_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("news_all_keys")
		end
		if $redis.exists("news_menu_total") && $redis.get("news_menu_total").to_i < 15
			$redis.lrange("news_menu_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("news_menu_keys")
		end
		if $redis.exists("home_news_total") && $redis.get("home_news_total").to_i < 25
			$redis.lrange("home_type_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("home_posts")
			$redis.del("home_type_keys")
		end
	  end
	def self.select_with columns
  		select(columns.map(&:to_s))
	end
end
