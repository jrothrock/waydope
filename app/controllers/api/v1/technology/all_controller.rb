class Api::V1::Technology::AllController < ApplicationController
    include ActionView::Helpers::NumberHelper
	def index
		offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
        order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"

        posts = $redis.get("technology_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all")
        if posts.nil?
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
            posts = Product.find_by_sql(sanitized_query).to_json
            $redis.set("technology_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all",posts)
            $redis.rpush("technology_all_keys","technology_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all")
        end
        posts = JSON.parse(posts)
        count = posts && posts.first ? posts.first["count"] : 0
        page = offset > 0 ? ((offset / 20) + 1) : 1
        pages = count ? (count / 20.0).ceil : 0
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
        order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"

        sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false approved = true AND uploaded = true AND worked = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
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
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i  : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"

        sanitized_query = Product.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND approved = true AND sold_out = false AND worked = true AND uploaded = true AND created_at >= ? AND flagged = false AND removed = false GROUP BY p.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
        posts = Product.find_by_sql(sanitized_query).as_json
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
            render json:{status:200, success:true, posts:posts, offset:offset}
        else
            render json:{status:404, success:false}
        end
    end
end
