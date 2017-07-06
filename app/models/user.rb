require 'jwt'
require 'bcrypt'
require 'securerandom'
require 'sendgrid-ruby'
class User < ActiveRecord::Base
  # Include default devise modules.
  include PgSearch
  attr_reader :password
  include BCrypt
  include SendGrid
 

  #has_many :songs, dependent: :destroy  --- don't know if I want this, yet
  #has_many :comments, dependent: :destroy --- again, not sure
  # has_many :comments
  # has_many :songs
  # has_many :videos
  # has_many :news_posts

  before_create :create_token
  belongs_to :searchable, polymorphic: true
  has_one :seller
  validates :password, length: {minimum: 6, allow_nil: true}
  validates :username, :login_username, presence: true
  validates :username, :login_username, length: {minimum: 3, maximum: 20}
  validates :username, :login_username, uniqueness: true

  pg_search_scope(
		:search,
		against: {
		username: 'A',
		},
		using: {
			tsearch: {
				dictionary: "english",
			}
		}
	)

  def self.find_by_credentials(username, password)
    puts username
  	puts password
    user = User.where("login_username = ?", username).first
    begin
      if !user.good_standing
        return "banned"
      elsif user.password == password
        begin 
          user.create_token
          user.save!
        rescue 
          retry
        end
        return user
      end
    rescue
      return nil
    end
  end

  def self.find_by_token(token)
    begin
      puts token
      if token && token != 'undefined'
        decoded_token = JWT.decode token, Rails.application.secrets.secret_key_base, true, { :algorithm => 'HS256' }
        random_string = decoded_token[0]['string']
        user = User.where("token_string = ?", random_string).first
        return user
      end
      return false
    rescue => e
      logger.info "---BEGIN---"
      logger.info "Error in find by token"
      logger.info "Time: #{Time.now}"
      logger.debug e
      logger.info "---END---"
      return false
    end
  end

  def password
    @password ||= Password.new(encrypted_password)
  end

  def password=(new_password)
    @password = Password.create(new_password)
    self.encrypted_password = @password
  end

  def self.setUUID
    begin 
      uuid = SecureRandom.hex(20)
      if(User.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, UUID has a duplicate!' end
      return uuid
      rescue
        retry
    end
  end

  def create_token
    begin
      random_string = SecureRandom.hex(20)
      if(User.unscoped.where("token_string = ?", random_string).any?) then raise "Go buy some lotto tickets, the token_string has a duplicate!" end
      rescue
        retry
    end
      self.token_string = random_string
      puts self.email
      payload = {:string => self.token_string}
      token = JWT.encode payload, Rails.application.secrets.secret_key_base, 'HS256'
      self.token = token
      
  end

  def self.unban(user_id)
    begin
      user = User.where("id = ?", user_id).first
      user.encrypted_password = user.old_password
      user.good_standing = true;
      user.old_password = nil;
      return user
    rescue
      return false
    end
  end

  def self.ban(user_id)
      begin
        user = User.where("id = ?", user_id).first
        old_password = user.encrypted_password #store the password in an old_password, just in case we want to remove the ban.
        user.old_password = old_password
        user.encrypted_password = Password.create(SecureRandom.hex)
        new_token = SecureRandom.hex
        user.token_string = new_token
        payload = {:string => new_token}
        user.token = JWT.encode payload, Rails.application.secrets.secret_key_base, 'HS256'
        user.good_standing = false;
        return user
      rescue
        return false
      end
  end

  def self.logout(token)
    begin
      puts token
    	decoded_token = JWT.decode token, Rails.application.secrets.secret_key_base, true, { :algorithm => 'HS256' }
    	puts decoded_token
      random_string = decoded_token[0]['string']
    	user = User.where("token_string = ?", random_string).first
    	puts user.username
    	if user.username
        puts user.token
    		user.token = nil
        user.token_string = nil
        user.logged_in = false
    		user.save!
        purge_cache(user.uuid)
    		return true
    	end
    rescue 
    	return false
    end
  end

  def self.verifyEmail(user)
    begin
      random_string = SecureRandom.hex(20)
      if(User.unscoped.where("email_token = ?", random_string).any?) then raise "Go buy some lotto tickets, the email_token has a duplicate!" end
      rescue
        retry
    end
    user.email_token = random_string
    user.email_time_stamp = Time.now
    user.save!
    UserMailer.verify_email(user).deliver
  end

  def self.resetPassword(user)
    begin
      random_string = SecureRandom.hex(20)
      if(User.unscoped.where("reset_password_token = ?", random_string).any?) then raise "Go buy some lotto tickets, the email_token has a duplicate!" end
      rescue
        retry
    end
    user.reset_password_token = random_string
    user.reset_password_sent_at = Time.now
    user.save!
    UserMailer.reset_email(user).deliver
  end
  

   def self.isAdminRoute(request)
    if !Rails.env.production?
      return true
    end
    admins = User.where('admin = true AND logged_in = true AND last_sign_in_ip = ?', request.remote_ip)
    if admins.exists?
        puts '---BEGIN---'
        puts 'admins exist, allowing someone into workers'
        puts Time.now
        puts admins.as_json
        puts request.remote_ip
        puts request.user_agent
        puts request.origin
        puts request.referer
        puts '---END---'
        return true
    else
        return false
    end
  end
  private 
  def purge_cache(user)
		$redis = Redis::Namespace.new("way_dope", :redis => Redis.new)
		if $redis.exists("#{user}_keys")
			$redis.lrange("#{user}_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("#{user}_keys")
		end
	end
end
