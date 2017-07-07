class Api::V1::Auth::SessionsController < ApplicationController

	def new
		Rails.logger.debug params.inspect
		puts params[:username]
		puts params[:password]
		user = User.find_by_credentials(
			params[:username].downcase,params[:password]
		)
		if user and user != 'banned'
			user.logged_in = true
			user.last_sign_in_ip = request.remote_ip
			user.logins += 1
			if user.consecutive_days && user.consecutive_days != '{}'
				consecutive = user.consecutive_days
				if (user.last_visit + 1.day ).strftime("%Y%m%d")  === Time.now.strftime("%Y%m%d")
					time = (Time.now - (user.last_consecutive_days - 1).days).strftime("%Y%m%d")
					if consecutive.key?(Time.now.strftime("%Y%m%d"))
						value = consecutive[time]
						consecutive[time] = value + 1
					else
						consecutive[Time.now.strftime("%Y%m%d")] = 1
					end
					user.last_consecutive_days += 1
				else
					consecutive[Time.now.strftime("%Y%m%d")] = 1
					user.last_consecutive_days = 1
				end
				user.average_consecutive_days = (consecutive.values.map(&:to_i).sum/consecutive.keys.length)
				user.consecutive_days = consecutive
			else
				user.consecutive_days = {Time.now.strftime("%Y%m%d") => 1}
				user.last_consecutive_days = 1
				user.average_consecutive_days = 1
			end
			user.since_last_visit = (Time.now - user.last_visit).to_i
			if user.last_visit.strftime("%Y%m%d") != Time.now.strftime("%Y%m%d") 
				user.days_visited += 1
			end
			if request.headers["Session"]
				user.last_tracker = request.headers["Session"]
				trackers = user.trackers
				if trackers.key?(request.headers["Session"])
					value = trackers[request.headers["Session"]].to_i
					trackers[request.headers["Session"]] = value + 1
				else
					trackers[request.headers["Session"]] = 1
				end
			end
			user.trackers = trackers ?  trackers : {}
			user.last_visit = Time.now
			ips = user.ips
			if ips.key?(request.remote_ip)
				value = ips[request.remote_ip].to_i
				ips[request.remote_ip] = value + 1
			else
				ips[request.remote_ip] = 1
			end
			user.ips = ips
		end
		if user && user === 'banned'
			render json: {banned:true},status: :ok
		elsif user && user != 'banned' && user.save
			if user.admin
				render json: {token: user.token, data:{
					username: user.username, seller: user.seller, admin: user.admin
				}}, status: :ok
			elsif user.seller
				render json: {token: user.token, data:{
					username: user.username, seller: user.seller, ssn_required:user.ssn_required
				}}, status: :ok
			else
				render json: {token: user.token, data:{
					username: user.username
				}}, status: :ok
			end
			if request.headers["Cart"]
				cart = Order.where('uuid = ?', request.headers["Cart"]).first
				if cart
					cart.user_uuid = user.uuid
					cart.save
				end
			end	
		else
			render json: {success:false}, status: :not_found
		end
	end

	def destroy
		if request.headers["Authorization"]
			loggedOut = User.logout(request.headers["Authorization"].split(' ').last)
			
			if loggedOut
				render json: {success:true}, status: :not
			else
				# not sure what this response code should be. (bad request/unauthorized?)
				render json: {success:false, destroy:true}, :status: :unauthorized
			end
		else
			render json: {success:false, destroy:true}, status: :bad_request
		end
	end
end
