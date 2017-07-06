class Api::V1::Categories::Comments::CommentController < ApplicationController
    def read
        results = Comment.where('category = ? AND post_id = ? AND body LIKE ? OR submitted_by LIKE ?', "#{request.headers[:category]}", "#{request.headers[:id]}", "%#{request.headers[:search]}%","%#{request.headers[:search]}%")
        if results
            render json:{status:200, success:true, results: results}
        else
            render json:{status:404, success:false}
        end
    end
end
