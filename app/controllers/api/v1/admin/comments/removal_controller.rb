class Api::V1::Admin::Comments::RemovalController < ApplicationController
	def update #all songs
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            comment = Comment.where("uuid = ?", params[:id]).first
            reason = Comment.removal_reason(params[:reason])
            comment.removed = true
            comment.body = reason
            comment.marked = reason
            comment.stripped = reason
            if comment.save
                PurgecacheWorker.perform_async('comment',comment.commentable_id,comment.post_type)
                render json: {status: 200, success: true, reason:reason}
            else
                render json: {status:500, success:false}
            end
        else
            render json: {status: 403, success:false}
        end
	end
end
