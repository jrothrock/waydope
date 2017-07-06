class Api::V1::Music::PlayController < ApplicationController
    def create
        song = Song.where("uuid = ?", params[:id]).first
		if song
            PlaycountWorker.perform_async(song.uuid,request.headers["Authorization"],'music',request.remote_ip, request.headers["Signature"])
        else
            render json:{status:404, success:false}
        end
    end
end