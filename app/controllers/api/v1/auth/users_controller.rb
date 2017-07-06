class Api::V1::Auth::UsersController < ApplicationController
	def new
		@user = User.new
	end

	def create
		puts params[:username]
		puts params[:email]
		puts params[:password]
		username = params[:username]
		if (username =~ /^[\w-]*$/) != 0
			render json:{status:400, success:false,characters:true, message:"non alphanumeric characters were used - (a-z,0-9,-,_ [case insensitive])"}
			return false
		end
		user = User.new
		
		user.username = params[:username].strip()
		user.login_username = params[:username].downcase.strip()
		if params[:email]
			user.email = params[:email].capitalize
		end
		user.password = params[:password].strip()
		user.uuid = User.setUUID
		user.logged_in = true
		user.last_visit = Time.now
		user.consecutive_days = {Time.now.strftime("%Y%m%d") => 1}
		user.last_consecutive_days = 1
		user.last_sign_in_ip = request.remote_ip
		user.logins = 1
		user.days_visited = 1
		user.ips = {request.remote_ip => 1}
		if request.headers["Session"]
			user.last_tracker = request.headers["Session"]
			user.trackers = {request.headers["Session"]=>1}
		end
		user.average_consecutive_days = 1
		### this code isn't dry, may want to move it into its own save method.

		if user.save
			render json: {status: 200, success:true, token: user.token, uuid:user.uuid, data:{
					username: user.username, email: user.email
				}}
			if request.headers["Cart"]
				cart = Order.where('uuid = ?', request.headers["Cart"]).first
				if cart
					cart.user_uuid = user.uuid
					cart.save
				end
			end	
			if user.email
				User.verifyEmail(user)
			end
		elsif user.errors['login_username'].length > 0 && user.errors['email'].length === 0 && user.errors['token_string'].length === 0
			Rails.logger.info(user.errors.inspect)
			checkuser = User.where('login_username = ?', user.login_username).first
			if checkuser && checkuser.locked
				render json: {success:false, errors: 'locked'}
			elsif !checkuser
				render json:{status:false, errors:'username-length', message:"username length is too long. Maximum is 20 characters"}
			else
				render json: {success:false, errors: 'username', message:"username has already been taken"}
			end
		elsif user.errors['email'].length > 0 && user.errors['login_username'].length == 0 && user.errors['token_string'].length === 0
			render json: {sucess:false, errors: 'email'}
		elsif (user.errors['email'].length && user.errors['login_username'].length) > 0 && user.errors['token_string'].length === 0
			render json: {success:false, errors:true, both:true}
		else
			render json: {sucess:false, errors: nil}
		end
	end

	def update

	end

	def destroy

	end

	private

	def user_params
		params.require(:user).permit(:username, :email, :password)
	end

end
