class Api::V1::Track::TrackerController < ApplicationController
    def read

    end
    def create
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        tracker = Tracker.new
        tracker.uuid = Tracker.setUUID
        puts tracker.uuid
        is_mobile = App.is_mobile(request.user_agent)
        geo = Geokit::Geocoders::MultiGeocoder.geocode(request.remote_ip)
        if geo && geo.success
            tracker.last_country = geo.country_code
            tracker.countries = {geo.country_code => 1}
            tracker.last_state = geo.state 
            tracker.states = {geo.state => 1}
            tracker.last_city = geo.city
            tracker.cities = {geo.city => 1}
        end
        tracker.last_ip_address = request.remote_ip
        tracker.ip_addresses = {request.remote_ip => 1}
        tracker.last_visit = Time.now
        tracker.last_user_agent = request.user_agent
        tracker.user_agents = {request.user_agent => 1}
        tracker.last_referer = request.referer
        tracker.referers = {request.referer => 1}
        $redis.hmset("tracker_#{tracker.uuid}", :duration, Time.now.to_i, :pageviews,  1, :stale, Time.now.to_i)
        $redis.hset("tracker_#{tracker.uuid}_referers", request.referer, 1)
        $redis.sadd("tracker_#{Time.now.strftime("%Y%m%d")}","tracker_#{tracker.uuid}")
        $redis.sadd("tracker_#{Time.now.strftime("%Y%m%d")}","tracker_#{tracker.uuid}_referers")
        $redis.sadd("tracker_days","tracker_#{Time.now.strftime("%Y%m%d")}")
        tracker.visits = {Time.now => 1}
        if tracker.save
            render json:{session:tracker.uuid}, status: :ok
            if user && tracker
                if user.trackers && user.trackers != '{}' && user.trackers != "null" 
                    trackers = user.trackers
                    trackers[tracker.uuid] = 1
                    user.trackers = trackers
                else
                    user.trackers = {tracker.uuid => 1}
                end
                user.last_tracker = tracker.uuid
                user.save
            end
        else
            render json:{}, status: :internal_server_error
        end
    end
    def update
        UpdatetrackerWorker.perform_async(request.headers["Authorization"],request.headers["Signature"],request.user_agent)
    end
end
