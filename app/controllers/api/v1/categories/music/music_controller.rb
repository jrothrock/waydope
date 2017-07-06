class Api::V1::Categories::Music::MusicController < ApplicationController
   def read
        results = MusicGenre.where('title LIKE ? OR url LIKE ?', "%#{params[:search]}%","%#{params[:search]}%")
        if results
            render json:{status:200, success:true, results: results}
        else
            render json:{status:404, success:false}
        end
    end
end
