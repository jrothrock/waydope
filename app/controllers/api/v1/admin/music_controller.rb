class Api::V1::Admin::MusicController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {status: 200, success: true, songs: Song.all.order('created_at DESC')}
			else
				render json: {status: 403, success:false}
			end
		else
			render json: {status: 403, success:false}
		end
	end

	def read #get individual user
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {status: 403, success:false}
				return
			end

			song = Song.find(request.headers["id"])
			if song
				render json: {status: 200, success: true, song: song}
			else
				render json: {status: 404, success: false}
			end
		else
			render json: {status:403, success: false}
		end
	end

	def update

		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {status: 403, success:false}
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
					render json: {status: 200, success:true}
				else
					render json: {status: 500, success:false}
				end
			else
				render json: {status: 404, success:false}
			end

		else 
			render json: {status: 403, success:false}
		end
	end

end
