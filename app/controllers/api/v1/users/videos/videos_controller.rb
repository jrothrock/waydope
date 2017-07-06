class Api::V1::Users::Videos::VideosController < ApplicationController
    def index
        user = User.select('videos').where('username = ?', request.headers["user"]).first
        if user 
            offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
            sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
            time = sanitizedTime ? sanitizedTime : 10.years.ago
            sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
            order = sanitizedOrder ? sanitizedOrder : ""

            sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE hidden = false AND deleted = false AND uuid IN (?) AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id #{order != "" ? 'ORDER BY ' + order : ''} OFFSET ? LIMIT 20", user.videos.keys, time.to_s,offset])
            posts = Video.find_by_sql(sanitized_query)
            count = posts && posts.first ? posts.first["count"] : 0
            page = offset > 0 ? ((offset / 20) + 1) : 1
            pages = (count / 20.0).ceil
            currentUser = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
            posts.each do |video|
                if currentUser
                    video.user_liked = video.likes.key?(currentUser.uuid) ? true : false
                    video_votes_hash = video.votes
                    video.user_voted = video_votes_hash.key?(currentUser.uuid) ? video_votes_hash[currentUser.uuid] : nil
                end
                video.votes = nil
                video.likes = nil
                video.ratings = nil
                video.report_users = nil
            end
            if posts != []
                render json:{status:200, success:true, posts:posts}
            else
                render json:{status:404, success:false}
            end
        else
            render json:{status:400, success:false, message: "no username was provided"}
        end
    end
    def read
        user = User.select('videos').where('username = ?', params[:user]).first
        if (!params[:options] || !user)
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = video.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = video.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : ""

        sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE hidden = false AND deleted = false AND id uuIN (?) AND created_at >= ? AND flagged = false AND removed = false GROUP BY v.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.videos.keys, time.to_s,offset])
        posts = Video.find_by_sql(sanitized_query).as_json(include: :photos)
        count = posts && posts.first ? posts.first["count"] : 0
        page = offset > 0 ? offset / 20 : 1
        pages = (count / 20.0).ceil
        currentUser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |video|
            if currentUser
                video.user_liked = video.likes.key?(currentUser.uuid) ? true : false
                video_votes_hash = video.votes
                video.user_voted = video_votes_hash.key?(currentUser.uuid) ? video_votes_hash[currentUser.uuid] : nil
            end
            video.likes = nil
            video.votes = nil
            video.ratings = nil
            video.report_users = nil
        end
        if posts != []
            render json:{status:200, success:true, posts:posts, offset:0, page:1}
        else
            render json:{status:404, success:false}
        end
    end
    def update
        user = User.select('videos').where('username = ?', params[:user]).first
        if (!params[:offset] || !user)
			render json:{status:400, success:false, message:'Offset param is required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i  : 0 # not a terrible sanitation honestly.
        sanitizedTime = video.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = video.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : ""

        sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE hidden = false AND deleted = false AND uuid IN (?) AND created_at >= ? AND flagged = false AND removed = false GROUP BY v.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.videos.keys, time.to_s,offset])
        posts = Video.find_by_sql(sanitized_query).as_json(include: :photos)
        currentUser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |video|
            if currentUser
                video.user_liked = video.likes.key?(currentUser.uuid) ? true : false
                video_votes_hash = video.votes
                video.user_voted = video_votes_hash.key?(currentUser.uuid) ? video_votes_hash[currentUser.uuid] : nil
            end
            video.likes = nil
            video.votes = nil
            video.ratings = nil
            video.report_users = nil
        end
        if posts != []
            render json:{status:200, success:true, posts:posts, offset:offset}
        else
            render json:{status:404, success:false}
        end
    end
end
