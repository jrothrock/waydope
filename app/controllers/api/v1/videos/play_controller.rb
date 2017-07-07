class Api::V1::Videos::PlayController < ApplicationController
    def create
        video = Video.where("category = ? AND url = ?", params[:category],params[:id]).first
		if video
            PlaycountWorker.perform_async(video.uuid,request.headers["Authorization"],'videos',request.remote_ip,request.headers["Signature"])
        else
            render json:{}, status: :not_found
        end
    end
end
