class Api::V1::Categories::Music::MusicController < ApplicationController
   def read
        results = MusicGenre.where('title LIKE ? OR url LIKE ?', "%#{params[:search]}%","%#{params[:search]}%")
        if results
            render json:{results: results}, status: :ok
        else
            render json:{}, status: :not_found
        end
    end
end
