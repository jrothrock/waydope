class Api::V1::Admin::UsersController < ApplicationController
	def index #all users
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if user && user.admin
				offset = request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0
				sanitized_query = User.escape_sql(["SELECT count(*) OVER () AS total_count, u.id,u.username,u.firstname,u.lastname,email,u.good_standing,u.admin,u.locked FROM users u GROUP BY u.id ORDER BY created_at DESC OFFSET ? LIMIT 100", offset]) 
				users = User.find_by_sql(sanitized_query)
				current_page = offset / 100
				total = users.length ? users.first.total_count : 0
				pages = total / 100
				render json: {users:users,total:total,current:current_page,pages:pages,offset:(offset+100)}, status: :ok
			else
				render json: {}, status: :forbidden
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def read #get individual user
		puts "user id =" + request.headers["id"]
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end
			user = User.select('id,username,firstname,lastname,email,good_standing,admin,bio').find(request.headers["id"])
			if user
				render json: {user: user}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def update

		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			user = User.find(params[:id])
			if user
				user.admin = params[:admin]
				if user.save
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

	def ban #doesn't really delete the user, just bans them.
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			user = User.ban(params[:user_id])
			if user
				if user.save
					render json: {status: 200, success: true}
				else 
					render json: {status: 500, success: false}
				end
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def lock
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			user = User.find(params[:user_id])
			user.locked = !user.locked
			if user
				if user.save
					render json: {status: 200, success: true}
				else 
					render json: {status: 500, success: false}
				end
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def unban
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			user = User.unban(params[:user_id])
			if user
				if user.save
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
