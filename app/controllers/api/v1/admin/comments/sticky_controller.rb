class Api::V1::Admin::Comments::StickyController < ApplicationController
	def update #all songs
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            comment = Comment.where("uuid = ?", params[:id]).first
            comment.stickied = params[:stickied]
            if comment.save
                PurgecacheWorker.perform_async('comment',comment.commentable_uuid,comment.post_type)
                render json: {status: 200, success: true, stickied:comment.stickied}
            else
                render json: {status:500, success:false}
            end
        else
            render json: {status: 403, success:false}
        end
	end
end
