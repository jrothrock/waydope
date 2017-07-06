class Api::V1::Admin::Posts::RemoveController < ApplicationController
	def update 
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            case params[:type]
            # I'm not sure how I feel about this styling technique - with the then, render, return.
            when 'news'
                if NewsPost.where("uuid = ?", params[:id]).update(removed:true) && Comment.where("post_type = 'news' AND post_id = ? ",params[:id].to_s).update_all(removed:true)
                    App.removePost(params[:id], params[:type])
                    render json:{status:200, success:true} 
                    PurgecacheWorker.perform_async(params[:type], params[:id])
                    return 
                end
            when 'music'
                if Song.where("uuid = ?", params[:id]).update(removed:true) && Comment.where("post_type = 'music' AND post_id = ? ",params[:id].to_s).update_all(removed:true)
                    App.removePost(params[:id], params[:type])
                    render json:{status:200, success:true} 
                    PurgecacheWorker.perform_async(params[:type], params[:id])
                    return 
                end
            when 'videos'
                if Video.where("uuid = ?", params[:id]).update(removed:true) && Comment.where("post_type = 'videos' AND post_id = ? ",params[:id].to_s).update_all(removed:true)
                    App.removePost(params[:id], params[:type])
                    render json:{status:200, success:true} 
                    PurgecacheWorker.perform_async(params[:type], params[:id])
                    return
                end
            when 'apparel'
                if Product.where("uuid = ?", params[:id]).update(removed:true) && Comment.where("post_type = 'apparel' AND post_id = ? ",params[:id].to_s).update_all(removed:true)
                    App.removePost(params[:id], params[:type])
                    render json:{status:200, success:true} 
                    PurgecacheWorker.perform_async(params[:type], params[:id])
                    return
                end
            when 'technology'
                if Product.where("uuid = ?", params[:id]).update(removed:true) && Comment.where("post_type = 'technology' AND post_id = ? ",params[:id].to_s).update_all(removed:true)
                    App.removePost(params[:id], params[:type])
                    render json:{status:200, success:true} 
                    PurgecacheWorker.perform_async(params[:type], params[:id])
                    return
                end
            else
                render json:{status:404, success:false}
                return false
            end
            
            render json:{status:500, success:false}
        else
            render json: {status: 403, success:false}
        end
	end
end
