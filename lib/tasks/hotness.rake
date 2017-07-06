#
# https://www.desmos.com/calculator/auubsajefh
# http://computing.dcu.ie/~humphrys/Notes/Neural/sigmoid.html
#
# Y = 1 / (1 + e^(14 * (x - 0.65)))
#
# this is for 6 hours out.
# x = (Time.now - post.created_at) / (post.created_at * 60 * 60 * 6)
#

namespace :hotness do
    desc "loop through queue"
	task :generate => :environment do
        begin
            where_debugging = "database"
            posts = NewsPost.where('created_at >= ?', 48.hour.ago)
            songs = Song.where('created_at >= ?', 48.hour.ago)
            videos = Video.where('created_at >= ?', 48.hour.ago)
            products = Product.where('created_at >= ?', 48.hour.ago)

            where_debugging = "posts"
            posts.each do |post|
                time_difference = (Time.now - post.created_at) / (60 * 60 * 8)
                post.freshness = 1/(1+Math::E**(14*(time_difference - 0.65)))
                if post.freshness < 0.2
                    post.freshness = 0
                end
                post.hotness = post.average_vote * post.freshness
                post.save
            end

            where_debugging = "songs"
            songs.each do |song|
                time_difference = (Time.now - song.created_at) / (60 * 60 * 8)
                song.freshness = 1/(1+Math::E**(14*(time_difference - 0.65)))
                if song.freshness < 0.2
                    song.freshness = 0
                end
                song.hotness = song.average_vote * song.freshness
                song.save
            end

            where_debugging = "videos"
            videos.each do |video|
                time_difference = (Time.now - video.created_at) / (60 * 60 * 8)
                video.freshness = 1/(1+Math::E**(14*(time_difference - 0.65)))
                if video.freshness < 0.2
                    video.freshness = 0
                end
                video.hotness = video.average_vote * video.freshness
                video.save
            end

            where_debugging = "products"
            products.each do |product|
                time_difference = (Time.now - product.created_at) / (60 * 60 * 8)
                product.freshness = 1/(1+Math::E**(14*(time_difference - 0.65)))
                if product.freshness < 0.2
                    product.freshness = 0
                end
                product.hotness = product.freshness * product.average_vote
                product.save
            end

            where_debugging = "board categories"
            BoardCategory.where("new_posts = true AND count > 3").each do |category|
                category.top_day = NewsPost.where("main_category = ? AND removed = false AND flagged = false ", category.url).order("hotness DESC, created_at DESC").limit(5).map(&:uuid)
                category.save
            end

            where_debugging = "music genre"
            MusicGenre.where("new_posts = true AND count > 3").each do |genre|
                genre.top_day = Song.where("main_genre = ? AND removed = false AND flagged = false", genre.url).order("hotness DESC, created_at DESC").limit(4).map(&:uuid)
                genre.save
            end

            where_debugging = "video category"
            VideoCategory.where("new_posts = true AND count > 3").each do |category|
                category.top_day = Video.where("main_category = ? AND removed = false AND flagged = false", category.url).order("hotness DESC, created_at DESC").limit(4).map(&:uuid)
                category.save
            end

            App.purge_cache('news',0,'purge')
            App.purge_cache('music',0,'purge')
            App.purge_cache('videos',0,'purge')
            App.purge_cache('apparel',0,'purge')
            App.purge_cache('technology',0,'purge')
        rescue => e
            puts "---BEGIN---"
            puts "Error in hotness rake for music genre"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end

	end
end

