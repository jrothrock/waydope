class Api::V1::Admin::New::FlagsController < ApplicationController
	def index #all songs
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) :nil
        if user && user.admin
            # need to create a first flagged time stamp
            offset = request.headers["offset"] ? request.headers["offset"].to_i : 0
            sanitized_query = Comment.escape_sql(["SELECT count(*) OVER () AS count, * FROM comments p WHERE flagged = true GROUP BY p.id ORDER BY flag_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            flagged_comments = Comment.find_by_sql(sanitized_query).as_json

            sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS count, * FROM news_posts p WHERE flagged = true GROUP BY p.id ORDER BY flag_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            flagged_news = NewsPost.find_by_sql(sanitized_query).as_json

            sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS count, * FROM songs p WHERE flagged = true GROUP BY p.id ORDER BY flag_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            flagged_songs = Song.find_by_sql(sanitized_query).as_json

            sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS count, * FROM videos p WHERE flagged = true GROUP BY p.id ORDER BY flag_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            flagged_videos = Video.find_by_sql(sanitized_query).as_json

            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, * FROM products p WHERE post_type = 'apparel' AND flagged = true GROUP BY p.id ORDER BY flag_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            flagged_apparel = Product.find_by_sql(sanitized_query).as_json
        
            sanitized_query = Product.escape_sql(["SELECT count(*) OVER () AS count, * FROM products p WHERE post_type = 'technology' AND flagged = true GROUP BY  p.id ORDER BY flag_created DESC, created_at DESC OFFSET ? LIMIT 20", offset])
            flagged_technology = Product.find_by_sql(sanitized_query).as_json

            [flagged_comments,flagged_news,flagged_songs,flagged_videos,flagged_apparel,flagged_technology].each do |type|
                type.each do |post|
                    post["time_ago"] = time_ago_in_words(post["created_at"])
                end
            end

            render json: {status: 200, success: true, flags: [flagged_comments,flagged_news,flagged_songs,flagged_videos,flagged_apparel,flagged_technology]}
        else
            render json: {status: 403, success:false}
        end
	end

	def read #get individual user
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
			if request.headers["type"] && request.headers["offset"]
                puts request.headers["type"]
                type = App.classGet(request.headers[:type])
                puts type
                offset = request.headers["offset"] ? request.headers["offset"].to_i : 0
                posts = Object.const_get(type).where("#{type === 'products' ? 'post_type = ' + request.headers["type"] + ' AND' : ''}").order('flag_created DESC,created_at DESC').offset(offset).limit(20)
                render json:{status:200, success:true, posts:posts, offset:offset+20}
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
