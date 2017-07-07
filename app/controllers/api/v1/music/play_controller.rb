class Api::V1::Music::PlayController < ApplicationController
    def create
        song = Song.where("genre = ?, AND url = ?", params[:genre], params[:id]).first
		if song
            PlaycountWorker.perform_async(song.uuid,request.headers["Authorization"],'music',request.remote_ip, request.headers["Signature"])
        else
            render json:{}, status: :not_found
        end
    end
end