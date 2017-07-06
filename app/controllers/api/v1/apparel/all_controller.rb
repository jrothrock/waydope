class Api::V1::Apparel::AllController < ApplicationController
    include ActionView::Helpers::NumberHelper
	def index
		offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
        order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC, created_at DESC"

        posts = $redis.get("apparel_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all")
        if posts.nil?
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
            posts = Product.find_by_sql(sanitized_query).to_json
            $redis.set("apparel_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all",posts)
            $redis.rpush("apparel_all_keys","apparel_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all")
        end
        posts = JSON.parse(posts)
        posts = posts
        count = posts && posts.first ? posts.first["count"] : 0
        page = offset > 0 ? ((offset / 20) + 1) : 1
        pages = count ? (count / 20.0).ceil : 0
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |post|
            if user
                post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                post_votes_hash = post["votes"]
                post["user_voted"] = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
            end
            post["price"] = post["price"] ? number_to_currency(post["price"]) : '$0.00'
            post["sale_price"] = nil
            post["shipping"] = post["shipping"] ? number_to_currency(post["shipping"]) : '$0.00'
            post["votes"] = nil
            post["likes"] = nil
            post["ratings"] = nil
            post["report_users"] = nil
        end
        if posts != []
            render json:{status:200, success:true, posts:posts, offset:offset,count:count,page:page, pages:pages}
        else
            render json:{status:404, success:false}
        end
    end
    def read
        if (!params[:options])
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC, created_at DESC"

        sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND flagged = false AND removed = false AND uploaded = true AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        posts = Product.find_by_sql(sanitized_query).as_json
        count = posts && posts.first ? posts.first["count"] : 0
        page = offset > 0 ? offset / 20 : 1
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
            render json:{status:200, success:true, posts:posts, offset:0, page:1}
        else
            render json:{status:404, success:false}
        end
    end
     def update
        if (!params[:offset])
			render json:{status:400, success:false, message:'Offset param is required.'}
			return false
		end
		offset = params[:offset].to_i ? params[:offset].to_i : 0
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC, created_at DESC"

        sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false AND created_at >= ? GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        posts = Product.find_by_sql(sanitized_query).as_json
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |post|
            if user
                post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                post["user_voted"] = post["votes"].key?(user.uuid) ? post["votes"][user.uuid] : nil
            end
            post["price"] = post["price"] ? number_to_currency(post["price"]) : '$0.00'
            post["sale_price"] = nil
            post["shipping"] =  post["shipping"] ? number_to_currency(post["shipping"]) : '$0.00'
            post["votes"] = nil
            post["likes"] = nil
            post["ratings"] = nil
            post["report_users"] = nil
        end
        if posts != []
            render json:{status:200, success:true, posts:posts, offset:offset}
        else
            render json:{status:404, success:false}
        end
    end
end
