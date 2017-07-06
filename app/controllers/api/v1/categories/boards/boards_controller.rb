class Api::V1::Categories::Boards::BoardsController < ApplicationController
    def read
        results = BoardCategory.where('title LIKE ? OR url LIKE ?', "%#{request.headers[:search]}%","%#{request.headers[:search]}%")
        if results
            render json:{status:200, success:true, results: results}
        else
            render json:{status:404, success:false}
        end
    end
end
