class ApplicationController < ActionController::API
  # protect_from_forgery with: :null_session
  after_action :watch_user

  def watch_user
    # puts 'authorization in watch user'
    # puts request.headers["Authorization"]
    # puts "user : #{request.headers['user']}"
    # puts "user-agent: #{request.headers['User-Agent']}"
    # puts request.parameters['controller']
    # puts request.parameters['action']
    # puts request.headers["Signature"]
    # puts request.method
    # puts request.referer
    # puts request.origin
    url = request.original_url.split('/')[3..-1].join('/')
    signature = request.headers["Signature"]
    TrackuserWorker.perform_async(signature, request.headers["Authorization"], url, request.remote_ip, request.referer)
    ImpressionWorker.perform_async(signature, request.headers["Authorization"], url, request.remote_ip, request.referer,request.user_agent)
  end
end