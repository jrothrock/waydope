class Api::V1::Categories::Boards::BoardsController < ApplicationController
    def read
        results = BoardCategory.where('title LIKE ? OR url LIKE ?', "%#{request.headers[:search]}%","%#{request.headers[:search]}%")
        if results
            render json:{results: results}, status: :ok
        else
            render json:{}, status: :not_found
        end
    end
end
