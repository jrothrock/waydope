namespace :gravity do
desc "drop all old stuff to zero"
	task :generate => :environment do
        begin
            where_debugging = "database"
            songs = Song.where('freshness > 0 AND created_at >= ?', 2.hour.from_now)
            videos = Video.where('freshness > 0 AND created_at >= ?', 2.hour.from_now)
            posts = Post.where('freshness > 0 AND created_at >= ?', 2.hours.from_now)
            products = Product.where('freshness > 0 AND created_at >= ?', 2.hours.from_now)

            where_debugging = "songs"
            songs.each do |song|
                song.freshness = 0
                song.save
            end

            where_debugging = "videos"
            videos.each do |video|
                video.freshness = 0
                video.save
            end

            where_debugging = "posts"
            posts.each do |post|
                post.freshness = 0
                post.save
            end

            where_debugging = "products"
            products.each do |product|
                product.freshness = 0
                post.save
            end
        rescue => e
            puts "---BEGIN---"
            puts "Error in gravity rake for #{where_debugging}"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
	end
end