class Api::V1::Categories::Boards::PostController < ApplicationController
    def read
        results = NewsPost.where('title LIKE ? OR url LIKE ? AND main_category = ?', "%#{request.headers[:search]}%","%#{request.headers[:search]}%", "%#{request.headers[:category]}")
        if results
            render json:{status:200, success:true, results: results}
        else
            render json:{status:404, success:false}
        end
    end
end
