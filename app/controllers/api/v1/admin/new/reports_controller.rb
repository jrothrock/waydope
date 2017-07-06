class Api::V1::Admin::New::ReportsController < ApplicationController
	def index #all songs
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) :nil
        if user && user.admin
            # need to create a first flagged time stamp
            offset = request.headers["offset"] ? request.headers["offset"].to_i : 0
            sanitized_query = Comment.escape_sql(["SELECT count(*) OVER () AS count, * FROM comments p WHERE reported = true GROUP BY p.id ORDER BY report_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            reported_comments = Comment.find_by_sql(sanitized_query)

            sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS count, * FROM news_posts p WHERE reported = true GROUP BY p.id ORDER BY report_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            reported_news = NewsPost.find_by_sql(sanitized_query)

            sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS count, * FROM songs p WHERE reported = true GROUP BY p.id ORDER BY report_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            reported_songs = Song.find_by_sql(sanitized_query)

            sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS count, * FROM videos p WHERE reported = true GROUP BY p.id ORDER BY report_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            reported_videos = Video.find_by_sql(sanitized_query)

            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, * FROM products p WHERE post_type = 'apparel' AND reported = true GROUP BY p.id ORDER BY report_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            reported_apparel = Product.find_by_sql(sanitized_query)
        
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, * FROM products p WHERE post_type = 'technology' AND reported = true GROUP BY p.id ORDER BY report_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            reported_technology = Product.find_by_sql(sanitized_query)

            [reported_comments,reported_news,reported_songs,reported_videos,reported_apparel,reported_technology].each do |type|
                type.each do |post|
                    post["time_ago"] = time_ago_in_words(post["created_at"])
                end
            end

            render json: {status: 200, success: true, reports: [reported_comments,reported_news,reported_songs,reported_videos,reported_apparel,reported_technology]}
        else
            render json: {status: 403, success:false}
        end
	end

	def read #get individual user
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
			if request.headers["type"] && request.headers["offset"]
                type = App.classGet(request.headers[:type])
                offset = request.headers["offset"] ? request.headers["offset"].to_i : 0
                posts = Object.const_get(type).where("#{type === 'products' ? 'post_type = ' + request.headers["type"] + ' AND' : ''} reported = true").order('report_created DESC, created_at DESC').offset(offset).limit(20)
                render json:{status:200, success:true, posts:posts,offset:offset+20}
            else
                render json:{status:400, success:false, message:"type and offset request headers are required"}
            end
		else
			render json: {status:403, success: false}
		end
	end

	def update
		user =  request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            if params[:type]
                type = App.classGet(params[:type])
                post = Object.const_get(type).where("uuid = ?", params[:id]).first
                if post                
                    post.read = true
                    post.save
                    render json:{status:200, success:true}
                else
                    render json:{status:404, success:false}
                end
            else
                render json:{status:400, success:false, message:"type parameter is required." }
            end
		else 
			render json: {status: 403, success:false}
		end
	end

end
