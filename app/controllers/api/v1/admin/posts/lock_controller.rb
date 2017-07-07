class Api::V1::Admin::Posts::LockController < ApplicationController
	def update #all songs
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            case params[:type]
            # I'm not sure how I feel about this styling technique - with the then, render, return.
            when 'news'
                if NewsPost.where("uuid = ?", params[:id]).update(locked:true) && Comment.where("post_type = 'news' AND post_id = ? ",params[:id].to_s).update_all(locked:true)
                    render json:{}, status: :ok
                    return 
                end
            when 'music'
                if Song.where("uuid = ?", params[:id]).update(locked:true) && Comment.where("post_type = 'music' AND post_id = ? ",params[:id].to_s).update_all(locked:true)
                    render json:{}, status: :ok
                    return 
                end
            when 'videos'
                if Video.where("uuid = ?", params[:id]).update(locked:true) && Comment.where("post_type = 'videos' AND post_id = ? ",params[:id].to_s).update_all(locked:true)
                    render json:{}, status: :ok
                    return
                end
            when 'apparel'
                if Product.where("uuid = ?", params[:id]).update(locked:true) && Comment.where("post_type = 'apparel' AND post_id = ? ",params[:id].to_s).update_all(locked:true)
                    render json:{}, status: :ok
                    return
                end
            when 'technology'
                if Product.where("uuid = ?", params[:id]).update(locked:true) && Comment.where("post_type = 'technology' AND post_id = ? ",params[:id].to_s).update_all(locked:true)
                    render json:{}, status: :ok
                    return
                end
            else
                render json:{}, status: :not_found
                return false
            end
            
            render json:{}, status: :internal_server_error
        else
            render json: {}, status: :forbidden
        end
	end
end
