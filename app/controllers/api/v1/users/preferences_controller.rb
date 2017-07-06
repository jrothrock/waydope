class Api::V1::Users::PreferencesController < ApplicationController
	def read
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
		if user
			render json:{success:true, subs:{news:user.news_subs, music:user.music_subs, videos:user.video_subs}}, status: :ok
		else
			render json:{sucess:false}, status: :unauthorized
		end
	end
end
