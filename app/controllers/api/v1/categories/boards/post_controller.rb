class Api::V1::Categories::Boards::PostController < ApplicationController
    def read
        results = NewsPost.where('title LIKE ? OR url LIKE ? AND main_category = ?', "%#{request.headers[:search]}%","%#{request.headers[:search]}%", "%#{request.headers[:category]}")
        if results
            render json:{results: results}, status: :ok
        else
            render json:{}, status: :not_found
        end
    end
end
