namespace :dkarma do
    desc "generate karma for all posts in last 6 months"
	task :generate => :environment do
        begin
            where_debugging = "database"
            posts = Post.where(:created_at => 12.hours.ago..6.months.ago, voted => true)
            songs = Song.where(:created_at => 12.hours.ago..6.months.ago, voted => true)
            videos = Video.where(:created_at => 12.hours.ago..6.months.ago, voted => true)
            products = Product.where(:created_at => 12.hours.ago..6.months.ago, voted => true)
            comments = Comment.where(:created_at => 12.hours.ago..6.months.ago, voted => true)

            where_debugging = "posts"
            posts.each do |post|
                karma = ((post.average_vote - post.karma_update) * 0.6).ceil
                post.karma_update = post.average_vote
                user = User.where("username = ?", post.submitted_by).first
                user.link_karma += karma
                user.news_karma += karma
                post.voted = false
                post.save && user.save
            end

            where_debugging = "songs"
            songs.each do |song|
                karma = ((song.average_vote - song.karma_update) * 0.6).ceil
                song.karma_update = song.average_vote
                user = User.where("username = ?", song.submitted_by).first
                user.linK_karma += karma
                user.music_karma += karma
                song.voted = false
                song.save && user.save
            end

            where_debugging = "videos"
            videos.each do |video|
                karma = ((video.average_vote - video.karma_update) * 0.6).ceil
                video.karma_update = video.average_vote
                user = User.where("username = ?", video.submitted_by).first
                user.link_karma += karma
                user.videos_karma += karma
                video.voted = false
                video.save && user.save
            end

            where_debugging = "products"
            products.each do |product|
                karma = ((product.average_vote - product.karma_update) * 0.6).ceil
                product.karma_update = product.average_vote
                user = User.where("username = ?", product.submitted_by).first
                user.karma += karma
                user.products_karma += karma
                product.voted = false
                product.save && user.save
            end

            where_debugging = "commments"
            comments.each do |comment|
                karma = ((comment.average_vote - comment.karma_update) * 0.6).ceil
                comment.karma_update = comment.average_vote
                user = User.where("username = ?", comment.submitted_by).first
                user.karma += karma
                user.comment_karma += karma
                comment.voted = false
                comment.save && user.save
            end
        rescue => e
            puts "---BEGIN---"
            puts "Error in day karma rake for #{where_debugging}"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
	end
end