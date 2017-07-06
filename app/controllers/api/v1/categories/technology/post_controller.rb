class Api::V1::Categories::Technology::PostController < ApplicationController
    def read
         results = Product.where('type="technology" AND title LIKE ? OR url LIKE ? AND main_category = ? AND sub_category = ?', "%#{request.headers[:search]}%","%#{request.headers[:search]}%", "%#{request.headers[:category]}", "%#{request.headers[:subcategory]}")
        if results
            render json:{status:200, success:true, results: results}
        else
            render json:{status:404, success:false}
        end
    end
end
