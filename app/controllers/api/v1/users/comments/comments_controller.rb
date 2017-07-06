class Api::V1::Users::Comments::CommentsController < ApplicationController
    def index
        user = User.select('username').where('username = ?', request.headers["user"]).first
        if user 
            offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
            sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
            time = sanitizedTime ? sanitizedTime : 10.years.ago
            sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
            order = sanitizedOrder ? sanitizedOrder : nil

            sanitized_query = Comment.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE hidden = false AND deleted = false AND submitted_by = ? AND created_at >= ? AND flagged = false AND removed = false GROUP BY c.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.username, time.to_s,offset])
            comments = Comment.find_by_sql(sanitized_query)
            count = comments && comments.first ? comments.first["count"] : 0
            page = offset > 0 ? ((offset / 20) + 1) : 1
            pages = (count / 20.0).ceil
            currentUser = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
            comments.each do |comment|
                if currentUser
                    comment.as_json.merge!(user_voted: 1)
                    ## not sure why the above isn't appying - it will return null. This needs to be looked into.
                    comment["user_voted"] = Comment.user_voted(comment,currentUser.uuid)
                end
                comment["votes"] = nil
                comment["report_users"] = nil
            end
            if comments != []
                render json:{status:200, success:true, comments:comments,total:count,pages:pages,offset:0,page:1}
            else
                render json:{status:404, success:false}
            end
        else
            render json:{status:400, success:false, message: "no username was provided"}
        end
    end
    def read
        user = User.select('username').where('username = ?', params[:user]).first
        if (!params[:options] || !user)
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : nil

        sanitized_query = Comment.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE hidden = false AND deleted = false AND submitted_by = ? AND created_at >= ? AND flagged = false AND removed = false GROUP BY c.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.username, time.to_s,offset])
        comments = Comment.find_by_sql(sanitized_query)
        count = comments && comments.first ? comments.first["count"] : 0
        page = offset > 0 ? offset / 20 : 1
        pages = (count / 20.0).ceil
        currentUser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if currentUser
            comments.each do |comment|
                comment.as_json.merge!(user_voted: 1)
                ## not sure why the above isn't appying - it will return null. This needs to be looked into.
                comment["user_voted"] = Comment.user_voted(comment,currentUser.uuid)
            end
        end
        if comments != []
            render json:{status:200, success:true, comments:comments, offset:0, page:1}
        else
            render json:{status:404, success:false}
        end
    end
    def update
        user = User.select('username').where('username = ?', params[:user]).first
        if (!params[:offset] || !user)
			render json:{status:400, success:false, message:'Offset param is required.'}
			return false
		end
		offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i  : 0 # not a terrible sanitation honestly.
        sanitizedTime = Song.sanitizeTime(params[:time].to_s)
        time = sanitizedTime ? sanitizedTime : 10.years.ago
        sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
        order = sanitizedOrder ? sanitizedOrder : nil

        sanitized_query = Comment.escape_sql(["SELECT count(*) OVER () AS count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE hidden = false AND deleted = false AND submitted_by = ? AND created_at >= ? AND flagged = false AND removed = false GROUP BY c.id #{order ? 'ORDER BY ' + order : nil} OFFSET ? LIMIT 20", user.username, time.to_s,offset])
        comments = Comment.find_by_sql(sanitized_query)
        currentUser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if currentUser
            comments.each do |comment|
                comment.as_json.merge!(user_voted: 1)
                ## not sure why the above isn't appying - it will return null. This needs to be looked into.
                comment["user_voted"] = Comment.user_voted(comment,currentUser.uuid)
            end
        end
        if comments != []
            render json:{status:200, success:true, comments:comments, offset:offset}
        else
            render json:{status:404, success:false}
        end
    end

end
