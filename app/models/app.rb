require 'net/http'
class App < ApplicationRecord

    def self.nsfwCheck(image)
        # puts image
        # image has to be in the same directory as the docker container.
        begin
            FileUtils.cp(image, Rails.root+File.basename(image))
            if Rails.env.production?
                check = %x[#{Rails.root}/nsfw_docker.sh #{File.basename(image)}]
            else
                check = %x[#{Rails.root}/nsfw_docker_dev.sh #{File.basename(image)}]
            end
            check = check.scan(/0\..*/) ? check.scan(/0\..*/)[0].to_f : nil
            check_return = (check && check.to_f > 0.38) ? true : false
            FileUtils.rm(Rails.root+File.basename(image))
            return check_return
            rescue 
                return false
        end
    end

    def self.nsfwImage(image)
        destination  = File.dirname(image) + '/' + File.basename(image).split('.').insert(-2,'nsfw').join('.')
        value = %x[convert -resize 480x480^ -scale 1% -scale 10000% -strip -interlace Plane -gaussian-blur 0.05 -quality 85% #{image} #{destination}]
        return destination
    end

    def self.change_color(hex_color,color_frequency)
       if color_frequency.length > 1 && color_frequency[1] != 0
        difference_freq = (color_frequency[0] / color_frequency[1])
       else
        difference_freq = 100
       end
        values = hex_color.gsub('#','').scan(/../).map {|color| color.hex}
        if values.sum > 690
            if values.uniq.length === 1
                values = [34,34,34]
            else
                min = values.min
                if values.count(min) > 1
                    index = values.each_with_index.map{|x,i| x == min ? i : nil}.compact
                else
                    index = values.find_index(min)
                    values[index] = 0
                end
            end
        end


        if difference_freq > 30 
            value = "#%02x%02x%02x" % values
            return [value,value]
        elsif difference_freq > 15
            # the lower the dark amount, the darker it becomes
            # the higher the light amount, the lighter it becomes
            dark_amount = 0.7
            light_amount = 0.9 
        else
            dark_amount = 0.6
            light_amount = 0.9
        end

        # this will create an actual lighter color, but our background should be darker

        # light_hex = "#%02x%02x%02x" % values.map{|value| [(value.to_i + 255 * light_amount).round, 255].min}

        # this light_hex is well lighter than the darker but is darker than the original_hex
        light_hex = "#%02x%02x%02x" % values.map{|value| (value.to_i * light_amount).round}

        dark_hex = "#%02x%02x%02x" % values.map{|value| (value.to_i * dark_amount).round}
        
        return [dark_hex, light_hex]
    end


    # isn't necessary currently, but this will get the main color of the image.
    def self.getColor(image)
       first_output = %x[convert #{image} -quantize transparent -colors 1 -unique-colors txt:-]
       second_output = %x[convert #{image} +dither -colors 3 -define histogram:unique-colors=true -format "%c" histogram:info:]
       color_frequency = second_output.gsub(':', '  ').split('  ').flatten.each_with_index.map{|value,i| if(i % 2 === 0) then value end}.compact.sort.reverse.map(&:to_i)
       original_hex = first_output.sub('#','').split()[first_output.sub('#','').split().index{|s| s.include?("#")}]
       puts original_hex
       return change_color(original_hex,color_frequency)
    end

    # i really should have made these objects for the params
    def self.getGoodColumns(type, array=false, array_letter=nil,post=false)
         columns = $redis.get("#{type}_columns")
        if columns.nil?
             columns = Object.const_get(classGet(type)).column_names.to_json
             $redis.set("#{type}_columns", columns)
        end
        columns = JSON.parse(columns)
        case type
        when 'news'
            if !post
                good =  ["title", "description", "link", "submitted_by", "created_at", "updated_at", "url", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "user_voted", "main_category", "main_category_display", "categories", "likes", "user_liked", "likes_count", "user_rated", "average_rating", "ratings_count", "users_rated", "average_simplified_rating", "average_simplified_rating_count", "categorized", "form", "og_url_name", "old_category", "edited", "ratings", "votes", "marked", "stripped", "time_ago", "karma_update", "voted", "locked", "hostname", "secure_link", "teaser", "nsfw", "featured", "nsfw_flag", "reported", "report_users", "user_reported", "uuid"]
            else
                # the post needs the worked column, but no where else
                good =  ["title", "description", "link", "submitted_by", "created_at", "updated_at", "url", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "user_voted", "main_category", "main_category_display", "categories", "likes", "user_liked", "likes_count", "user_rated", "average_rating", "ratings_count", "users_rated", "average_simplified_rating", "average_simplified_rating_count", "categorized", "form", "flagged", "og_url_name", "old_category", "edited", "ratings", "votes", "marked", "stripped", "time_ago", "karma_update", "voted", "locked", "hostname", "secure_link", "teaser", "worked", "nsfw", "featured", "nsfw_flag", "reported", "report_users", "user_reported", "user_viewed","removed","flagged", "uuid"]
            end
         when 'music'
            if !post
                good = ["title", "artist", "description", "submitted_by", "created_at", "updated_at", "url", "link_type", "user_liked", "post_type", "likes_count", "average_rating", "ratings_count", "user_rated", "comment_count", "freshness", "main_genre", "main_genre_display", "genres", "average_advanced_rating", "average_advanced_rating_count", "average_simplified_rating", "average_simplified_rating_count", "average_lyrics_rating", "average_lyrics_rating_count", "average_production_rating", "average_production_rating_count", "average_originality_rating", "average_originality_rating_count", "upvotes", "downvotes", "average_vote", "votes_count", "user_voted", "artwork_url", "post_link", "categorized", "form", "og_url_name", "old_genre", "edited", "likes", "ratings", "votes", "marked", "stripped", "download", "download_text", "download_url", "time_ago", "karma_update", "voted", "locked", "average_simplified_rating_variance", "average_simplified_rating_deviation", "average_advanced_rating_variance", "average_advanced_rating_deviation", "average_lyrics_rating_variance", "average_rating_variance", "average_rating_deviation", "average_lyrics_rating_deviation", "average_production_rating_variance", "average_production_rating_deviation", "average_originality_rating_variance", "average_originality_rating_deviation", "link", "link_artwork", "upload_url", "upload_artwork_url", "uploaded", "original_link", "featured", "nsfw_flag", "nsfw", "background", "reported", "report_users", "user_reported", "upload_artwork_url_nsfw", "colors", "user_played", 'uuid']
            else
                # the post needs the worked column, but no where else
                good = [ "title", "artist", "description", "submitted_by", "created_at", "updated_at", "url", "link_type", "user_liked", "post_type", "likes_count", "average_rating", "ratings_count", "user_rated", "comment_count", "worked", "freshness", "main_genre", "main_genre_display", "genres", "average_advanced_rating", "average_advanced_rating_count", "average_simplified_rating", "average_simplified_rating_count", "average_lyrics_rating", "average_lyrics_rating_count", "average_production_rating", "average_production_rating_count", "average_originality_rating", "average_originality_rating_count", "upvotes", "downvotes", "average_vote", "votes_count", "user_voted", "artwork_url", "post_link", "categorized", "form", "flagged", "og_url_name", "old_genre", "edited", "likes", "ratings", "votes", "marked", "stripped", "download", "download_text", "download_url", "time_ago", "karma_update", "voted", "locked", "average_simplified_rating_variance", "average_simplified_rating_deviation", "average_advanced_rating_variance", "average_advanced_rating_deviation", "average_lyrics_rating_variance", "average_rating_variance", "average_rating_deviation", "average_lyrics_rating_deviation", "average_production_rating_variance", "average_production_rating_deviation", "average_originality_rating_variance", "average_originality_rating_deviation", "link", "link_artwork", "upload_url", "upload_artwork_url", "uploaded", "original_link", "featured", "nsfw_flag", "nsfw", "background", "reported", "report_users", "user_reported", "upload_artwork_url_nsfw", "colors", "user_played", "user_viewed", "removed", 'uuid']
            end
         when 'videos'
             if !post
                good = ["title", "description", "submitted_by", "created_at", "updated_at", "url", "link_type", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "worked", "user_voted", "main_category", "main_category_display", "categories", "user_rated", "average_rating", "ratings_count", "users_rated", "average_simplified_rating", "average_simplified_rating_count", "user_liked", "likes_count", "artwork_url", "clicked", "post_link", "categorized", "form", "video", "artwork", "og_url_name", "flag_checked", "old_category", "edited", "likes", "ratings", "votes", "marked", "stripped", "time_ago", "karma_update", "voted", "locked", "link", "link_artwork", "upload_url", "upload_artwork_url", "uploaded", "original_link", "featured", "nsfw_flag", "nsfw", "reported", "report_users", "user_reported", "upload_artwork_url_nsfw", "download_url", "user_played", 'uuid']
            else 
                good = ["title", "description", "submitted_by", "created_at", "updated_at", "url", "link_type", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "worked", "user_voted", "main_category", "main_category_display", "categories", "user_rated", "average_rating", "ratings_count", "users_rated", "average_simplified_rating", "average_simplified_rating_count", "user_liked", "likes_count", "artwork_url", "clicked", "post_link", "categorized", "form", "video", "artwork", "flagged", "og_url_name", "flag_checked", "old_category", "edited", "likes", "ratings", "votes", "marked", "stripped", "time_ago", "karma_update", "voted", "locked", "link", "link_artwork", "upload_url", "upload_artwork_url", "uploaded", "original_link", "featured", "nsfw_flag", "nsfw", "reported", "report_users", "user_reported", "upload_artwork_url_nsfw", "user_played", "user_viewed", "removed", 'uuid']
            end
         when 'apparel'
            if !post
                good = ["title", "creator", "creator_link", "submitted_by", "category", "url", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "user_voted", "main_category", "main_category_display", "categories", "likes_count", "user_rated", "average_rating", "ratings_count", "users_rated", "ratings_user", "average_simplified_rating", "average_simplified_rating_count", "form", "categorized", "worked", "description", "created_at", "updated_at", "sub_category", "shipping", "shipping_type", "tax", "returns", "has_site", "has_variations", "turnaround_time", "condition", "votes", "likes", "size", "color", "height", "width", "depth", "quantity", "marked", "stripped", "discount_percentage", "ratings", "fit", "fit_count", "featured", "guest_purchases", "user_liked", "approved", "sold_out", "time_ago", "price", "sale_price", "updated", "karma_update", "voted", "locked", "uploaded", "upload_urls", "upload_urls_nsfw", "nsfw_flag", "nsfw", "upload_artwork_url_nsfw_ids", "reported", "report_users", "user_reported", "properties", 'uuid']
            else
                good = ["id","title", "creator", "creator_link", "submitted_by", "category", "url", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "user_voted", "flagged", "main_category", "main_category_display", "categories", "likes_count", "user_rated", "average_rating", "ratings_count", "users_rated", "ratings_user", "average_simplified_rating", "average_simplified_rating_count", "form", "categorized", "worked", "description", "created_at", "updated_at", "sub_category", "zip", "shipping", "shipping_type", "tax", "returns", "has_site", "has_variations", "turnaround_time", "condition", "votes", "likes", "size", "color", "height", "width", "depth", "quantity", "marked", "stripped", "discount_percentage", "ratings", "fit", "fit_count", "featured", "guest_purchases", "user_liked", "approved", "sold_out", "time_ago", "price", "sale_price", "updated", "karma_update", "voted", "locked", "uploaded", "upload_urls", "upload_urls_nsfw", "nsfw_flag", "nsfw", "upload_artwork_url_nsfw_ids", "reported", "report_users", "user_reported", "user_viewed", "removed", "width", "height", "depth", "properties",'uuid']
            end
         when 'technology'
            if !post
                good = ["title", "creator", "creator_link", "submitted_by", "category", "url", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "user_voted", "main_category", "main_category_display", "categories", "likes_count", "user_rated", "average_rating", "ratings_count", "users_rated", "ratings_user", "average_simplified_rating", "average_simplified_rating_count", "form", "categorized", "worked", "description", "created_at", "updated_at", "sub_category", "shipping", "shipping_type", "tax", "returns", "has_site", "has_variations", "turnaround_time", "condition", "votes", "likes", "size", "color", "height", "width", "depth", "quantity", "marked", "stripped", "discount_percentage", "ratings", "fit", "fit_count", "featured", "guest_purchases", "user_liked", "approved", "sold_out", "time_ago", "price", "sale_price", "updated", "karma_update", "voted", "locked", "uploaded", "upload_urls", "upload_urls_nsfw", "nsfw_flag", "nsfw", "upload_artwork_url_nsfw_ids", "reported", "report_users", "user_reported","properties",'uuid']
            else
                good = ["id","title", "creator", "creator_link", "submitted_by", "category", "url", "post_type", "upvotes", "downvotes", "average_vote", "comment_count", "votes_count", "freshness", "user_voted", "flagged", "main_category", "main_category_display", "categories", "likes_count", "user_rated", "average_rating", "ratings_count", "users_rated", "ratings_user", "average_simplified_rating", "average_simplified_rating_count", "form", "categorized", "worked", "description", "created_at", "updated_at", "sub_category", "zip", "shipping", "shipping_type", "tax", "returns", "has_site", "has_variations", "turnaround_time", "condition", "votes", "likes", "size", "color", "height", "width", "depth", "quantity", "marked", "stripped", "discount_percentage", "ratings", "fit", "fit_count", "featured", "guest_purchases", "user_liked", "approved", "sold_out", "time_ago", "price", "sale_price", "updated", "karma_update", "voted", "locked", "uploaded", "upload_urls", "upload_urls_nsfw", "nsfw_flag", "nsfw", "upload_artwork_url_nsfw_ids", "reported", "report_users", "user_reported", "user_viewed", "removed", "properties",'uuid']
            end
         when 'comments'
             good = ["body", "generation", "submitted_by", "created_at", "commentable_type", "commentable_uuid", "upvotes", "downvotes", "average_vote", "edited", "flagged", "deleted", "hidden", "votes", "votes_count", "marked", "stripped", "parent_uuid", "category", "subcategory", "url", "post_type", "post_id", "user_voted", "title", "admin", "seller", "submitter", "time_ago", "styled", "archived", "voted", "removed", "locked", "stickied", "uuid", "reported", "report_users", "user_reported"] 
         when 'order'
            good = ["id", "status", "quantities", "products", "uuid", "user_uuid", "sellers_notified", "firstname", "lastname", "address", "zip", "address_two", "city", "state", "created_at", "updated_at", "new_shipping", "new_shipping_notification", "total", "sub_total", "shipping", "tax", "tax_rate", "taxes", "email", "shipping_confirmations", "shipped", "totals", "shippings", "sub_totals", "properties", "purchased_at"]
         end
         if !array
             return good
         else
            return "#{array_letter ? array_letter + '.' : ''}#{(good).join(", #{array_letter ? array_letter + '.' : ''}")}"
         end
    end

     def self.removePost(id,type)
        case type
        when 'news'
            post = NewsPost.where("uuid = ?", id).first
            category = BoardCategory.where("url = ?",post.main_category.downcase).first
            if category.top_day.include?(id)
                category.top_day = NewsPost.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.day.ago).order("hotness DESC, created_at DESC").limit(4).map(&:id)
                change = true
            end
            if category.top_week.include?(id)
                category.top_week = NewsPost.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.week.ago).order("hotness DESC, created_at DESC").limit(4).map(&:id)
                change = true
            end
            if category.top_month.include?(id)
                category.top_month = NewsPost.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.month.ago).order("hotness DESC, created_at DESC").limit(4).map(&:id)
                change = true
            end
             if category.top_year.include?(id)
                category.top_year = NewsPost.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.year.ago).order("hotness DESC, created_at DESC").limit(4).map(&:id)
                change = true
            end
            if category.top_alltime.include?(id)
                category.top_alltime = NewsPost.where("main_category = ? AND removed = false AND flagged = false",category.url).order("hotness DESC, created_at DESC").limit(4).map(&:id)
                change = true
            end
            if change
                category.save
            end
        when 'music'
            song = Song.where("uuid = ?",id).first
            category = MusicGenre.where("url = ?",song.main_genre.downcase).first
            if category.top_day.include?(id)
                category.top_day = Song.where("main_genre = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.day.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_week.include?(id)
                category.top_week = Song.where("main_genre = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.week.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_month.include?(id)
                category.top_month = Song.where("main_genre = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.month.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_year.include?(id)
                category.top_year = Song.where("main_genre = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.year.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_alltime.include?(id)
                category.top_alltime = Song.where("main_genre = ? AND removed = false AND flagged = false",category.url).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if change
                category.save
            end
        when 'videos'
            video = Video.where("uuid = ?", id).first
            category = VideoCategory.where("url = ?",video.main_category.downcase).first
            if category.top_day.include?(id)
                category.top_day = Video.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.day.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_week.include?(id)
                category.top_week = Video.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.week.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_month.include?(id)
                category.top_month = Video.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.month.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_year.include?(id)
                category.top_year = Video.where("main_category = ? AND removed = false AND flagged = false AND created_at > ?",category.url, 1.year.ago).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if category.top_alltime.include?(id)
                category.top_alltime = Video.where("main_category = ? AND removed = false AND flagged = false",category.url).order("hotness DESC, created_at DESC").limit(3).map(&:id)
                change = true
            end
            if change
                category.save
            end
        end    
     end
     

     def self.classGet(type)
        case type
        when 'news'
            return 'NewsPost'
        when 'music'
            return 'Song'
        when 'videos'
            return 'Video'
        when 'apparel'
            return 'Product'
        when 'technology'
            return 'Product'
        when 'comments'
            return 'Comment'
        end
    end

    def self.typeGet(type)
        case type
        when 'news'
            return 'news_posts'
        when 'music'
            return 'songs'
        when 'videos'
            return type
        when 'apparel'
            return 'products'
        when 'technology'
            return 'products'
        end
    end

    def self.typeGetDB(type,id=nil)
        # this converts DB type to regular type
        case type
        when 'NewsPost'
            return 'news'
        when 'Song'
            return 'music'
        when 'Video'
            return 'videos'
        when 'Product'
            # cache it for next the next search
            type = $redis.hget('product_search_type_hash',id.to_s)
            if type.nil?
                type = Product.find_by_id(id).post_type
                $redis.hset("product_search_type_hash",id.to_s,type)
            end
            return type
        end
    end

    def self.whereType(type,category)
        category = category != '' ? category : nil
        case type
		when 'news'
           case category
           when 'hot'
               return 'categorized = true AND flagged = false AND removed = false'
           when 'new'
               return 'categorized = true AND flagged = false AND removed = false'
           when 'featured'
               return 'categorized = true AND flagged = false AND removed =f alse'
           end
		when 'music'
           case category
		   when 'hot'
               return 'worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false'
           when 'new'
               return 'worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false'
           when 'featured'
               return 'worked = true AND categorized = true AND uploaded = true AND featured = true AND flagged = false AND removed = false'
           end
		when 'videos'
           case category            
		   when 'hot'
               return 'worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false'
           when 'new'
               return 'worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false'
           when 'featured'
               return 'worked = true AND categorized = true AND uploaded = true AND featured = true AND flagged = false AND removed = false'
           end
		when 'apparel'
            case category 
            when 'hot'
			    return "post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false"
            when 'new'
                return "post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false"
            when 'featured'
                return "post_type = 'apparel' AND sold_out = false AND featured = true AND approved = true AND uploaded = true AND flagged = false AND removed = false"
            end
		when 'technology'
			case category 
            when 'hot'
			    return "post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false"
            when 'new'
                return "post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false"
            when 'featured'
                return "post_type = 'technology' AND sold_out = false AND featured = true AND approved = true AND uploaded = true AND flagged = false AND removed = false"
            end
		else
			return false
		end
    end
    def self.orderGet(type,category)
        case type
		when 'news'
			return 'average_vote DESC, created_at DESC'
		when 'music'
			return "average_vote DESC, created_at DESC"
		when 'videos'
			return "average_vote DESC, created_at DESC"
		when 'apparel'
            case category 
            when 'hot'
			    return "average_vote DESC, created_at DESC"
            when 'new'
                return "created_at DESC"
            when 'featured'
                return "RANDOM()"
            end
		when 'technology'
			case category 
            when 'hot'
			    return "average_vote DESC, created_at DESC"
            when 'new'
                return "created_at DESC"
            when 'featured'
                return "RANDOM()"
            end
		else
			return false
		end
    end


    ### I'm not sure if I want this to run at first, and just see how bad the original content is. If it gets bad, I'll turn it on.
    # this will just tell you if the string has something bad, it won't replace it or anything

    def self.checkContent(str)
     # If this gets big, it'd probably be best to load each line from a text file.
      bad = ["Way Dope sucks", "Waydope sucks", "Waydope fucking sucks", "Way Dope fucking sucks", "Way Dope blows", "Fuck this site", "Way Dope is garbage", "this place is garbage", "this site is garbage", "this site sucks", "this site is dumb", "this site is stupid", "why would people ever come to this site", "this site is trash", "waydope is trash", "waydope is stupid", "fuck black people", "fuck white people", "fuck mexicans", "fuck beaners", "fuck porch monkeys", "fuck chinese people", "fuck chinks", "fuck niggers", "niggers", "nigger", "faggot", "fuck gay people", "fuck lesbians", "fuck dikes", "fag", "faggots"]
      # this may not catch all singularize and plurals
      # regex should probably be applied to catch those: "How i make $69 by selling my shit online..."
      # even better would be to do a figure out how close it matches, and if above a certain threshold, remove it.
      bad_worked = bad.map{|phrase| phrase.split().map{|word| word.downcase.singularize}.join(" ")}
     # some words are close:
     # fuck this place
     #bad = ["foo", "bar"]

     bad_hash = {}
     bad_phrase_hash = {}

     bad_worked.each do |word|
         words = word.split()
         if words.length > 1
             words.each do |inner|
                if bad_hash.key?(inner)
                    if bad_hash[inner].is_a?(Hash) && !bad_hash[inner].key?(words.length)
                         bad_hash[inner][words.length] = true
                    elsif bad_hash[inner] == 1
                        bad_hash[inner] = {1=>true,words.length => true}
                    end
                else
                    bad_hash[inner] = {words.length => true}
                end
             end
             bad_phrase_hash[word] = true
         else
             bad_hash[word] = 1
         end
     end

     string = str.split().map{|word| word.downcase.singularize}
     string.each_with_index do |word,index|
        if bad_hash.key?(word)
            if bad_hash[word].is_a?(Hash)
                if bad_hash[word].key?(1)
                    return false
                else
                    bad_hash[word].keys.sort.each do |length|
                        value = string[index...(index + length)].join(" ")
                        if bad_phrase_hash.key?(value)
                            return false
                        end
                    end
                end
            else
                return false
            end
        end
     end
     return true
  end

  def self.is_mobile(agent)
      return agent.include?('Mobi') # this cover IE and Opera as well
  end

  def self.cache_menu(posts,type)
    all_ids = []
    total = 0
    posts.each do |category|
        ids = category.map{ |post| post["id"] }
        total += ids.length
        all_ids = all_ids.concat(ids)
    end
    $redis.set("#{type}_menu_ids",all_ids.uniq.to_json)
    $redis.set("#{type}_menu_total",total.to_s)
    $redis.rpush("#{type}_menu_keys", "#{type}_menu_ids")
    $redis.rpush("#{type}_menu_keys", "#{type}_menu_total")
  end

  def self.set_home_cache_keys(posts,songs,videos,apparels,technologies)
    post_ids = []
    post_total = 0
    posts.each do |category|
      ids = category.map{ |post| post["uuid"] }
      post_total += ids.length
      post_ids = post_ids.concat(ids)
    end
    $redis.set("home_news_ids",post_ids.uniq.to_json)
    $redis.set("home_news_total", post_total.to_s)
    $redis.rpush("home_type_keys", "home_news_ids")
    $redis.rpush("home_type_keys", "home_news_total")
    
    song_ids = []
    song_total = 0
    songs.each do |category|
      ids = category.map{ |song| song["uuid"] }
      song_total += ids.length
      song_ids = song_ids.concat(ids)
    end
    $redis.set("home_music_ids",song_ids.uniq.to_json)
    $redis.set("home_music_total", song_total.to_s)
    $redis.rpush("home_type_keys", "home_music_ids")
    $redis.rpush("home_type_keys", "home_music_total")

    video_ids = []
    video_total = 0
    videos.each do |category|
      ids = category.map{ |video| video["uuid"] }
      video_total += ids.length
      video_ids = video_ids.concat(ids)
    end
    $redis.set("home_videos_ids",video_ids.uniq.to_json)
    $redis.set("home_videos_total",video_total.to_s)
    $redis.rpush("home_type_keys", "home_videos_ids")
    $redis.rpush("home_type_keys", "home_videos_total")

    apparel_ids = []
    apparel_total = 0
    apparels.each do |category|
      ids = category.map{ |apparel| apparel["uuid"] }
      apparel_total += ids.length
      apparel_ids = apparel_ids.concat(ids)
    end
    $redis.set("home_apparel_ids",apparel_ids.uniq.to_json)
    $redis.set("home_apparel_total",apparel_total.to_s)
    $redis.rpush("home_type_keys", "home_apparel_ids")
    $redis.rpush("home_type_keys", "home_apparel_total")

    technology_ids = []
    technology_total = 0
    technologies.each do |category|
      ids = category.map{ |technology| technology["uuid"] }
      technology_total += ids.length
      technology_ids = technology_ids.concat(ids)
    end
    $redis.set("home_technology_ids",technology_ids.uniq.to_json)
    $redis.set("home_technology_total",technology_total.to_s)
    $redis.rpush("home_type_keys", "home_technology_ids")
    $redis.rpush("home_type_keys", "home_technology_total")
  end

  def self.purge_cache(post_type,id,comment_type=nil)
    # comment_type is the post_type for the comment - ie. music
    # comment_type can also be 'upload' for embeded songs and videos.
    # comment_type can also be 'purge' this comes form the hottness which just means, fuck it, it's all deleting - except for trackers and comments and shit.
    case post_type
    when 'news'
        if $redis.exists("news_all_keys") 
            $redis.lrange("news_all_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("news_all_keys")
        end
        menu = menu_purge(post_type,id)
        home = home_purge(post_type,id)
        if Rails.env.production? then warm_cache(post_type,home,menu) end
    when 'music'
        if $redis.exists("music_all_keys") 
            $redis.lrange("music_all_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("music_all_keys")
        end
        menu = menu_purge(post_type,id,comment_type) 
        home = home_purge(post_type,id,comment_type)
        if Rails.env.production? then warm_cache(post_type,home,menu) end
    when 'videos'
        if $redis.exists("videos_all_keys") 
            $redis.lrange("videos_all_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("videos_all_keys")
        end 
        menu = menu_purge(post_type,id,comment_type)
        home = home_purge(post_type,id,comment_type)
        if Rails.env.production? then warm_cache(post_type,home,menu) end
    when 'apparel'
        if $redis.exists("apparel_all_keys") 
            $redis.lrange("apparel_all_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("apparel_all_keys")
        end 
        menu = menu_purge(post_type,id,comment_type)
        home = home_purge(post_type,id,comment_type)
        if Rails.env.production? then warm_cache(post_type,home,menu) end
    when 'technology'
        if $redis.exists("technology_all_keys") 
            $redis.lrange("technology_all_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("technology_all_keys")
        end
        menu = menu_purge(post_type,id,comment_type) 
        home = home_purge(post_type,id,comment_type)
        if Rails.env.production? then warm_cache(post_type,home,menu) end
    when 'comment'
        puts "comments_#{comment_type}_#{id}_keys"
        if $redis.exists("comments_#{comment_type}_#{id}_keys")
            $redis.lrange("comments_#{comment_type}_#{id}_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("comments_#{comment_type}_#{id}_keys")
        end
        menu = false
        home = false
        if Rails.env.production? then warm_cache(post_type,home,menu,comment_type) end
    end
  end

  private

  def self.menu_purge(type,id,comment_type=nil)
      puts 'in menu'
      exists = $redis.exists("#{type}_menu_ids") ? true : false
      menu = exists && JSON.parse($redis.get("#{type}_menu_ids")).include?(id) || comment_type === 'upload' || comment_type === 'purge' ? true : false
      if menu
          if $redis.exists("#{type}_menu_keys")
            $redis.lrange("#{type}_menu_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("#{type}_menu_keys")
        end
      end
      menu
  end

  def self.home_purge(type,id,comment_type=nil)
    exists = $redis.exists("home_#{type}_ids") ? true : false
    home = exists && JSON.parse($redis.get("home_#{type}_ids")).include?(id) || comment_type === 'upload' || comment_type === 'purge' ? true : false
    if home
        if $redis.exists("home_type_keys")
            $redis.lrange("home_type_keys",0,-1).each do |key|
                $redis.del(key)
            end
            $redis.del("home_type_keys")
            $redis.del("home_posts")
        end
    end
    home
  end

  def self.get_urls(type,home,menu,comment_type=nil)
    case (type)
    when "news"
        routes =  [
                    ["/api/news/", 0],
                    ["/api/news/all",0],
                    ["/api/news/rest",0],
                    ["/api/news/category","business"],
                    ["/api/news/category","science"],
                    ["/api/news/category","technology"],
                    ["/api/news/category","sports"],
                    ["/api/news/category","politics"]
                  ]   
        if menu then routes << ['/api/menus/boards',0] end
    when 'music'
        routes = [
                    ["/api/music", 0],
                    ["/api/music/all", 0],
                    ["/api/music/rest", 0],
                    ["/api/music/genre","electronic"],
                    ["/api/music/genre","trap"],
                    ["/api/music/genre","rap"],
                    ["/api/music/genre","hip-hop"]
                 ]
        if menu then routes << ['/api/menus/music',0] end
    when 'videos'
        routes = [
                    ["/api/videos",0],
                    ["/api/videos/all",0],
                    ["/api/videos/rest",0],
                    ["/api/videos/category","funny"],
                    ["/api/videos/category","feel-good"],
                    ["/api/videos/category","real"],
                    ["/api/videos/category","oh-shit"]
                ]
        if menu then routes << ['/api/menus/videos',0] end
    when 'apparel'
        routes = [
                    ["/api/apparel", 0],
                    ["/api/apparel/category", "all"],
                    ["/api/apparel/category", "hot"],
                    ["/api/apparel/category", "featured"]
                 ]
         if menu then routes << ['/api/menus/apparel',0] end
    when 'technology'
        routes = [
                    ["/api/technology", 0],
                    ["/api/technology/category", "all"],
                    ["/api/technology/category", "hot"],
                    ["/api/technology/category", "featured"]
                ]
        if menu then routes << ['/api/menus/technology',0] end
    when 'comments'
        routes = [
                    ["/api/comments",comment_type]
                ]
    end  
    if home then routes << ["/api/home",0] end
    routes
  end


  def self.warm_cache(type,home,menu,comment_type=nil)
    urls = App.get_urls(type,home,menu,comment_type)
    urls.each_with_index do |url,index|
        thread = []
        thread << Thread.new do 
            begin 
                Timeout::timeout(10) do
                    puts "#{Rails.application.secrets.hostname}#{url[0]}"
                    uri = URI.parse("#{Rails.application.secrets.hostname}#{url[0]}")
                    http = Net::HTTP.new(uri.host, uri.port)
                    request = Net::HTTP::Get.new(uri.to_s)
                    if url[1] != 0
                        if type === 'news' || type === 'videos'
                            request["category"] = url[1] 
                        elsif type === 'music'
                            request["genre"] = url[1]
                        elsif type === 'comment'
                            request["type"] = url[1]
                        else
                            request["category"] = url[1]
                            if url.length > 2 then request["subcategory"] = url[2] end
                        end
                    end
                    response = http.request(request)
                    puts response
                end
            rescue => e
                Rails.logger.info "Error in warming of cache... #{e}"
            end
        end
        thread.each do |t|
            t.join
        end
    end
  end  
end
