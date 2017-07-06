class Api::V1::Admin::New::PostsController < ApplicationController
	def index #all songs
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) :nil
        if user && user.admin
            # need to create a first flagged time stamp
            offset = request.headers["offset"] ? request.headers["offset"].to_i : 0
            sanitized_query = Comment.escape_sql(["SELECT count(*) OVER () AS count, p.*, (SELECT count(*) FROM comments WHERE checked = false) checked_count FROM comments p GROUP BY p.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
            comments = Comment.find_by_sql(sanitized_query)

            sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS count, p.*, (SELECT count(*) FROM news_posts WHERE checked = false) checked_count FROM news_posts p GROUP BY p.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
            news = NewsPost.find_by_sql(sanitized_query)

            sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS count, p.*, (SELECT count(*) FROM songs WHERE checked = false)  checked_count FROM songs p GROUP BY p.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
            songs = Song.find_by_sql(sanitized_query)

            sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS count, p.*, (SELECT count(*) from videos WHERE checked = false) checked_count FROM videos p GROUP BY p.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
            videos = Video.find_by_sql(sanitized_query)

            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, p.*, (SELECT count(*) from products WHERE checked = false AND post_type = 'apparel') checked_count FROM products p WHERE post_type = 'apparel' GROUP BY p.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
            apparel = Product.find_by_sql(sanitized_query)
        
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, p.*, (SELECT count(*) from products WHERE checked = false AND post_type = 'technology') checked_count FROM products p WHERE post_type = 'technology' GROUP BY p.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
            technology = Product.find_by_sql(sanitized_query)

            [comments,news,songs,videos,apparel,technology].each do |type|
                type.each do |post|
                    post["time_ago"] = time_ago_in_words(post["created_at"]).gsub('about','') + ' ago'
                end
            end

            render json: {status: 200, success: true, posts: [comments,news,songs,videos,apparel,technology]}
        else
            render json: {status: 403, success:false}
        end
	end

	def read
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
			if request.headers["type"] && request.headers["offset"]
                type = App.classGet(request.headers[:type])
                offset = request.headers["offset"] ? request.headers["offset"].to_i : 0
                posts = Object.const_get(type).where("#{type === 'products' ? 'post_type = ' + request.headers["type"] : ''}").order('created_at DESC').offset(offset).limit(20).as_json
                posts.each do |post|
                    post["time_ago"] = time_ago_in_words(post["created_at"]).gsub('about','') + ' ago'
                end
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
