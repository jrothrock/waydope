class Api::V1::Users::Music::MusicController < ApplicationController
     def index
        user = User.select('songs').where('username = ?', request.headers["user"]).first
        if user 
            offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
            sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
            time = sanitizedTime ? sanitizedTime : 10.years.ago
            sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
            order = sanitizedOrder ? sanitizedOrder : nil

            sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE hidden = false AND deleted = false AND uuid IN (?) AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.songs.keys, time.to_s,offset])
            posts = Song.find_by_sql(sanitized_query)
            count = posts && posts.first ? posts.first["count"] : 0
            page = offset > 0 ? ((offset / 20) + 1) : 1
            pages = (count / 20.0).ceil
            currentUser = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
            posts.each do |song|
                if currentUser
                    song.user_liked = song.likes.key?(currentUser.uuid) ? true : false
                    song_votes_hash = song.votes
                    song.user_voted = song_votes_hash.key?(currentUser.uuid) ? song_votes_hash[currentUser.uuid] : nil
                end
                song.likes = nil
                song.ratings = nil
                song.votes = nil
                song.report_users = nil
            end
            if posts != []
                render json:{status:200, success:true, posts:posts,total:count,pages:pages,offset:0,page:1}
            else
                render json:{status:404, success:false}
            end
        else
            render json:{status:400, success:false, message: "no username was provided"}
        end
    end
    def read
        user = User.select('songs').where('username = ?', params[:user]).first
        if (!params[:options] || !user)
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : nil

        sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE hidden = false AND deleted = false AND uuid IN (?) AND created_at >= ? AND flagged = false AND removed = false GROUP BY s.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.songs.keys, time.to_s,offset])
        posts = Song.find_by_sql(sanitized_query)
        count = posts && posts.first ? posts.first["count"] : 0
        page = offset > 0 ? offset / 20 : 1
        pages = (count / 20.0).ceil
        currentUser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |song|
            if currentUser
                song.user_liked = song.likes.key?(currentUser.uuid) ? true : false
                song_votes_hash = song.votes
                song.user_voted = song_votes_hash.key?(currentUser.uuid) ? song_votes_hash[currentUser.uuid] : nil
            end
            song.votes = nil
            song.likes = nil
            song.ratings = nil
            song.report_users = nil
        end
        if posts != []
            render json:{status:200, success:true, posts:posts, offset:0, page:1}
        else
            render json:{status:404, success:false}
        end
    end
    def update
        user = User.select('songs').where('username = ?', params[:user]).first
        if (!params[:offset] || !user)
			render json:{status:400, success:false, message:'Offset param is required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i  : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : nil

        sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE hidden = false AND deleted = false AND uuid IN (?) AND created_at >= ? AND flagged = false AND removed = false GROUP BY s.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.songs.keys, time.to_s,offset])
        posts = Song.find_by_sql(sanitized_query)
        currentUser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        posts.each do |song|
            if currentUser
                song.user_liked = song.likes.key?(currentUser.uuid) ? true : false
                song_votes_hash = song.votes
                song.user_voted = song_votes_hash.key?(currentUser.uuid) ? song_votes_hash[currentUser.uuid] : nil
            end
            song.likes = nil
            song.votes = nil
            song.ratings = nil
            song.report_users = nil
        end
        if posts != []
            render json:{status:200, success:true, posts:posts, offset:offset}
        else
            render json:{status:404, success:false}
        end
    end
end
