class Api::V1::Admin::MusicController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {songs: Song.all.order('created_at DESC')}, status: :ok
			else
				render json: {}, status: :forbidden
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def read #get individual user
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			song = Song.find(request.headers["id"])
			if song
				render json: {song: song}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :unauthorized
		end
	end

	def update

		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			song = Song.find(params[:id])
			if song

				song.title = params[:title]
				song.artist = params[:artist]
				song.genre = params[:genre]
				song.link = params[:link]
				song.url = params[:title].parameterize
				song.description = params[:description]
				
				if song.save
					render json: {}, status: :ok
				else
					render json: {}, status: :internal_server_error
				end
			else
				render json: {}, status: :not_found
			end

		else 
			render json: {}, status: :forbidden
		end
	end

end
