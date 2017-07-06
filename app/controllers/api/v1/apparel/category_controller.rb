class Api::V1::Apparel::CategoryController < ApplicationController
    include ActionView::Helpers::NumberHelper
	def index
		if request.headers["Category"]
            user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
			#posts = News_post.find_by_category(request.headers["Category"],10)
			# count = News_post.where('main_category = ?', request.headers["Category"]).count
			offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			if request.headers["Category"] != 'new'
             order = sanitizedOrder ? sanitizedOrder : "created_at DESC" 
            else
             order = sanitizedOrder ? sanitizedOrder : "average_vote DESC, comment_count DESC, created_at DESC"
            end
			#
			#for some weird reason you can't do the '?' in the order by and have to do #{} instead. throws some no constant error. No idea.
			#
            posts = $redis.get("apparel_category_#{request.headers["Category"].parameterize}_#{request.headers["Subcategory"].parameterize}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
			if posts.nil?
                if request.headers["Category"] === 'hot'
                    sanitized_query =  Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
                elsif request.headers["Category"] === 'new'
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
                elsif request.headers["Category"] === 'featured'
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false AND featured = true GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
                elsif request.headers["Subcategory"] != '' && request.headers["Subcategory"] != nil
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND flagged = false AND removed = false AND sub_category = ? AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",request.headers["Category"], request.headers["Subcategory"] ,time.to_s,offset])
                else
                    sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND flagged = false AND removed = false AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",request.headers["Category"], time.to_s,offset])
                end
                posts = Product.find_by_sql(sanitized_query).as_json(include: :photos).to_json
                $redis.set("apparel_category_#{request.headers["Category"].parameterize}_#{request.headers["Subcategory"].parameterize}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts",posts)
                $redis.rpush("apparel_all_keys","apparel_category_#{request.headers["Category"].parameterize}_#{request.headers["Subcategory"].parameterize}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
            end
            posts = JSON.parse(posts)
            count = posts && posts.first ? posts.first["count"] : 0
			page = offset > 0 ? ((offset / 20)+1) : 1
			pages = (count / 20.0).ceil
            posts.each do |post|
                if user
                    post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                    post["user_voted"] = post["votes"].key?(user.uuid) ? post["votes"][user.uuid] : nil
                end
                post["price"] = number_to_currency(post["price"])
                post["sale_price"] = nil
                post["shipping"] = number_to_currency(post["shipping"])
                post["ratings"] = '{}'
                post["votes"] = '{}'
                post["likes"] = '{}'
            end
            if posts != []
                render json:{status: 200, success:true, posts: posts, offset:offset,count:count,page:page, pages:pages}
            else
                render json:{status: 404, success:false}
            end
        else
            render json:{status: 400, success:false, message:'Category paramter required.'}
        end
    end
    def read
        if (!params[:options])
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
        offset = params[:offset].to_i % 15 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : "average_vote DESC, comment_count DESC, created_at DESC"

		if (!order || !time)
			render json:{status:400, success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}
			return false
		end
		 if params[:category] === 'hot'
            sanitized_query =  Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        elsif params[:category] === 'new'
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        elsif params[:category] === 'featured'
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND featured = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        elsif params[:subcategory] != '' && params[:subcategory] != nil
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND sub_category = ? AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",params[:category], params[:subcategory], time.to_s,offset])
        else
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",params[:category], time.to_s,offset])
        end
		posts = Product.find_by_sql(sanitized_query).as_json(include: :photos)
        count = posts && posts.first ? posts.first["count"] : 0
        page = offset > 0 ? ((offset / 20)+1) : 1
        pages = (count / 20.0).ceil
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |post|
            if user
                post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                post["user_voted"] = apparel["votes"].key?(user.uuid) ? apparel["votes"][user.uuid] : nil
            end
            post["price"] = number_to_currency(post["price"])
            post["sale_price"] = nil
            post["shipping"] = number_to_currency(post["shipping"])
            post["ratings"] = nil
            post["votes"] = nil
            post["likes"] = nil
            post["report_users"] = nil
        end
		if posts != []
			render json: {status:200, success:true, posts:posts, offset:0, page:1}
		else
			render json: {status:404, success:false}
		end
    end
    def update
        if (!params[:category] || !params[:offset])
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : "average_vote DESC, comment_count DESC, created_at DESC"
        
        if params[:category] != 'new'
            order = sanitizedOrder ? sanitizedOrder : "created_at DESC" 
        else
            order = sanitizedOrder ? sanitizedOrder : "average_vote DESC, comment_count DESC, created_at DESC"
        end
        #
        #for some weird reason you can't do the '?' in the order by and have to do #{} instead. throws some no constant error. No idea.
        #
        if params[:category] === 'hot'
            sanitized_query =  Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        elsif params[:category] === 'new'
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        elsif params[:category] === 'featured'
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false AND featured = true GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        elsif params[:subcategory] != '' && params[:subcategory] != nil
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND sub_category = ? AND flagged = false AND removed = false AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",params[:category], params[:subcategory], time.to_s,offset])
        else
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND main_category = ? AND flagged = false AND removed = false AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20",params[:category], time.to_s,offset])
        end
        posts = Product.find_by_sql(sanitized_query).as_json(include: :photos)
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |post|
            if user
                post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                post["user_voted"] = apparel["votes"].key?(user.uuid) ? apparel["votes"][user.uuid] : nil
            end
            post["price"] = number_to_currency(post["price"])
            post["sale_price"] = nil
            post["shipping"] = number_to_currency(post["shipping"])
            post["ratings"] = nil
            post["votes"] = nil
            post["likes"] = nil
            post["report_users"] = nil
        end
        if posts != []
            render json:{status: 200, success:true, posts: posts, offset:offset}
        else   
            render json:{status:404, success:false}
        end
    end
end
