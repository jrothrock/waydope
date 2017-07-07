class Api::V1::Categories::Comments::CommentController < ApplicationController
    def read
        results = Comment.where('category = ? AND post_id = ? AND body LIKE ? OR submitted_by LIKE ?', "#{request.headers[:category]}", "#{request.headers[:id]}", "%#{request.headers[:search]}%","%#{request.headers[:search]}%")
        if results
            render json:{results: results}, status: :ok
        else
            render json:{}, status: :not_found
        end
    end
end
