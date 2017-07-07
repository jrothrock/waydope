class Api::V1::Technology::CategoryController < ApplicationController
    include ActionView::Helpers::NumberHelper
	def index
		if params[:category]
			#posts = News_post.find_by_category(params[:category],10)
			# count = News_post.where('main_category = ?', params[:category]).count
			offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			if params[:category] != 'new'
             order = sanitizedOrder ? sanitizedOrder : "created_at DESC" 
            else
             order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"
            end
			#
			#for some weird reason you can't do the '?' in the order by and have to do #{} instead. throws some no constant error. No idea.
			#
            posts = $redis.get("technology_category_#{params[:category].parameterize}_#{params[:subcategory].parameterize}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
			if posts.nil?
                if params[:category] === 'hot'
                    sanitized_query =  Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
                elsif params[:category] === 'new'
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
                elsif params[:category] === 'featured'
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND featured = true GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
                elsif params[:subcategory] != '' && params[:subcategory] != nil
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND flagged = false AND sub_category = ? AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",params[:category], params[:subcategory] ,time.to_s,offset])
                else
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND flagged = false AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",params[:category], time.to_s,offset])
                end
                posts = Product.find_by_sql(sanitized_query).as_json.to_json
                $redis.set("technology_category_#{params[:category].parameterize}_#{params[:subcategory].parameterize}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts",posts)
                $redis.rpush("technology_all_keys","technology_category_#{params[:category].parameterize}_#{params[:subcategory].parameterize}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
            end
            posts = JSON.parse(posts)
            count = posts && posts.first ? posts.first["count"] : 0
			page = offset > 0 ? ((offset / 20)+1) : 1
			pages = (count / 20.0).ceil
            user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
            posts.each do |post|
                if user
                    post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                    post["user_voted"] = post["votes"].key?(user.uuid) ? post["votes"][user.uuid] : nil
                end
                post["price"] = number_to_currency(post["price"])
                post["sale_price"] = nil
                post["shipping"] = number_to_currency(post["shipping"])
                post["votes"] = nil
                post["likes"] = nil
                post["ratings"] = nil
                post["report_users"] = nil
            end
            if posts != []
                render json:{posts: posts, offset:offset,count:count,page:page, pages:pages}, status: :ok
            else
                render json:{}, status: :not_found
            end
        else
            render json:{message:'Category paramter required.'}, status: :bad_request
        end
    end
end
