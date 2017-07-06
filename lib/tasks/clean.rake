namespace :clean do
desc "clean out all temps if they've failed to delete'"
	task :generate => :environment do
        begin

            where_debugging = "database"
            songs = Song.where('updated = true')
            videos = Video.where('updated = true')
            posts = Post.where('updated = true')
            products = Product.where('updated = true')

            where_debugging = "songs"
            songs.each do |song|
                if song.photos
                    song.photos.each do |photo|
                        #only neccessary in development.
                        fd = File.dirname(photo.url)
                        directory = "public" + fd
                        FileUtils.rm_rf(directory)
                    end
                end
                song.delete
            end

            where_debugging = "videos"
            videos.each do |video|
            if video.photos
                    video.photos.each do |photo|
                        #only neccessary in development.
                        fd = File.dirname(photo.url)
                        directory = "public" + fd
                        FileUtils.rm_rf(directory)
                    end
                end
                video.delete
            end

            where_debugging = "posts"
            posts.each do |post|
                if post.photos
                    post.photos.each do |photo|
                        #only neccessary in development.
                        fd = File.dirname(photo.url)
                        directory = "public" + fd
                        FileUtils.rm_rf(directory)
                    end
                end
                post.delete
            end

            where_debugging = "products"
            products.each do |product|
                if product.photos
                    product.photos.each do |photo|
                        #only neccessary in development.
                        fd = File.dirname(photo.url)
                        directory = "public" + fd
                        FileUtils.rm_rf(directory)
                    end
                end
                product.delete
            end
        rescue => e
            puts "---BEGIN---"
            puts "Error in clean rake for #{where_debugging}"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
	end
end