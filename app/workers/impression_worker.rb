class ImpressionWorker
	include Sidekiq::Worker
	def perform(id,auth,controller,remote_ip,referer,user_agent)
        puts Tracker.trackURL(controller)

		if Tracker.trackURL(controller)
            user = auth ? User.find_by_token(auth.split(' ').last) : nil
            tracker = Tracker.where("uuid = ?",id).first
            impression = Impression.where('date = ?', Time.now.strftime("%Y%m%d")).first_or_create
            impression.pageviews = impression.pageviews ? impression.pageviews + 1 : 1
            impression.date = impression.date ? impression.date : Time.now.strftime("%Y%m%d")

            if !tracker
                # this tracker is just for easy implementation below. It does not save
                tracker = Tracker.new
                geo = Geokit::Geocoders::MultiGeocoder.geocode(remote_ip)
                if geo && geo.success
                    tracker.last_country = geo.country_code
                    tracker.countries = {geo.country_code => 1}
                    tracker.last_state = geo.state
                    tracker.states = {geo.state => 1}
                    tracker.last_city = geo.city
                    tracker.cities = {geo.city => 1}
                    tracker.last_ip_address = remote_ip
                    tracker.uuid = 'temp'
                end

            end

            is_mobile = App.is_mobile(user_agent)
            if is_mobile
                impression.mobile = impression.mobile ? impression.mobile + 1 : 1
            else
                impression.non_mobile = impression.non_mobile ? impression.non_mobile + 1 : 1
            end
            trackers = impression.trackers && impression.trackers != '{}' ? impression.trackers : nil

            if impression.countries_unique && impression.countries_unique != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                countries = impression.countries_unique
                if countries.key?(tracker.last_country)
                    value = countries[tracker.last_country].to_i
                    countries[tracker.last_country] = value + 1
                else
                    countries[tracker.last_country] = 1
                end
            elsif (!trackers || !trackers.key?(tracker.uuid))
                countries = {tracker.last_country => 1}
            end
            impression.countries_unique = countries ? countries : impression.countries_unique

            if impression.cities_unique && impression.cities_unique != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                cities = impression.cities_unique
                if cities.key?("#{tracker.last_city}, #{tracker.last_state}, #{tracker.last_country}")
                    value = cities["#{tracker.last_city}, #{tracker.last_state}, #{tracker.last_country}"].to_i
                    cities["#{tracker.last_city}, #{tracker.last_state}, #{tracker.last_country}"] = value + 1
                else
                    cities["#{tracker.last_city}, #{tracker.last_state}, #{tracker.last_country}"] = 1
                end
            elsif (!trackers || !trackers.key?(tracker.uuid))
                cities = {"#{tracker.last_city}, #{tracker.last_state}, #{tracker.last_country}" => 1}
            end
            impression.cities_unique = cities ? cities : impression.cities_unique

            if impression.states_unique && impression.states_unique != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                states = impression.states_unique
                if states.key?("#{tracker.last_state}, #{tracker.last_country}")
                    value = states["#{tracker.last_state}, #{tracker.last_country}"].to_i
                    states["#{tracker.last_state}, #{tracker.last_country}"] = value + 1
                else
                    states["#{tracker.last_state}, #{tracker.last_country}"] = 1
                end
            elsif (!trackers || !trackers.key?(tracker.uuid))
                states = {"#{tracker.last_state}, #{tracker.last_country}" => 1}
            end
            impression.states_unique = states ? states : impression.states_unique
            
            if is_mobile
                if impression.countries_mobile && impression.countries_mobile != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                    countries = impression.countries_mobile
                    if countries.key?(tracker.last_country)
                        value = countries[tracker.last_country].to_i
                        countries[tracker.last_country] = value + 1
                    else
                        countries[tracker.last_country] = 1
                    end
                elsif (!trackers || !trackers.key?(tracker.uuid))
                    countries = {tracker.last_country => 1}
                end
                impression.countries_mobile = countries ? countries : impression.countries_mobile
            else
                if impression.countries_non_mobile && impression.countries_non_mobile != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                    countries = impression.countries_non_mobile
                    if countries.key?(tracker.last_country)
                        value = countries[tracker.last_country].to_i
                        countries[tracker.last_country] = value + 1
                    else
                        countries[tracker.last_country] = 1
                    end
                elsif (!trackers || !trackers.key?(tracker.uuid))
                    countries = {tracker.last_country => 1}
                end
                impression.countries_non_mobile = countries ? countries : impression.countries_non_mobile
            end

            if impression.countries_pageviews && impression.countries_pageviews != '{}'
                countries = impression.countries_pageviews
                if countries.key?(tracker.last_country)
                    value = countries[tracker.last_country].to_i
                    countries[tracker.last_country] = value + 1
                else
                    countries[tracker.last_country] = 1
                end
                impression.countries_pageviews = countries
            else
                countries = {tracker.last_country => 1}
            end
            impression.countries_pageviews = countries ? countries : impression.countries_pageviews

            if impression.user_agents && impression.user_agents != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                impressions = impression.user_agents
                if impressions.key?(tracker.last_user_agent)
                    value = impressions[tracker.last_user_agent].to_i
                    impressions[tracker.last_user_agent] = value + 1
                else
                    impressions[tracker.last_user_agent] = 1
                end
                impression.user_agents = impressions
            elsif (!trackers || !trackers.key?(tracker.uuid))
                impression.user_agents = {tracker.last_user_agent => 1}
            end

            if impression.ips && impression.ips != '{}' && (!tracker || !trackers || !trackers.key?(tracker.uuid))
                    ips = impression.ips
                if ips.key?(tracker.last_ip_address)
                    value = ips[tracker.last_ip_address].to_i
                    ips[tracker.last_ip_address] = value + 1
                else
                    ips[tracker.last_ip_address] = 1
                end
                impression.ips = ips
            elsif (!trackers || !trackers.key?(tracker.uuid))
                impression.ips = {tracker.last_ip_address => 1}
            end

            if tracker && tracker.uuid != 'temp'
                if impression.trackers && impression.trackers != '{}'
                    if trackers.key?(tracker.uuid)
                        value = trackers[tracker.uuid]
                        trackers[tracker.uuid] = value + 1
                    else
                        impression.visitors += 1
                        trackers[tracker.uuid] = 1
                    end
                    impression.trackers = trackers
                else
                    impression.visitors =1
                    impression.trackers = {tracker.uuid=>1}
                end
            end
            # impression.duration = 0
            if impression.save
            else
                puts '---BEGIN---'
                puts 'failure in the impression worker'
                puts Time.now
                Rails.logger.info(song.errors.inspect) 
                puts '---END---'
            end
        end
    end
end