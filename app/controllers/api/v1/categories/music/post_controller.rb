class Api::V1::Categories::Music::PostController < ApplicationController
    def read
        results = Song.where('title LIKE ? OR url LIKE ? AND main_genre = ?', "%#{request.headers[:search]}%","%#{request.headers[:search]}%", "%#{request.headers[:category]}%")
        if results
            render json:{results: results}, status: :ok
        else
            render json:{}, status: :not_found
        end
    end
end
