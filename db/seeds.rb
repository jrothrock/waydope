# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
genres = MusicGenre.create([
	{url:'electronic',title:'Electronic'},
	{url:'hip-hop',title:'Hip-Hop'},
	{url:'futurebass',title:'Future Bass'},
	{url:'rap',title:'Rap'},
	{url:'indie',title:'Indie'},
	{url:'dance', title:'Dance'},
	{url:'edm',title:'EDM'},
	{url:'drum-and-bass',title:'Drum and Bass'},
	{url:'Moombahton',title:'Moombahton'},
	{url:'rnb',title:'RnB'},
	{url:'reggae',title:'Reggae'},
	{url:'glitch-hop',title:'Glitch Hop'},
	{url:'future-house',title:'Future House'},
	{url:'future-rock',title:'Future Rock'},
	{url:'alternative',title:'Alternative'},
	{url:'pop',title:'Pop'},
	{url:'rock',title:'Rock'},
	{url:'metal',title:'Metal'},
	{url:'country',title:'Country'},
	{url:'trap',title:'Trap'}
	])

video_categories = VideoCategory.create([
	{url:'funny',title:'Funny'},
	{url:'ahshit',title:'Ah Shit'},
	{url:'unexpected', title:'Unexpected'},
	{url:'crazy',title:'Crazy'},
	{url:'hold-my-beer',title:'Hold My Beer'},
	{url:'stuff',title:'Stuff'},
	{url:'feel-good',title:'Feel Good'},
	{url:'aww',title:'Aww'},
	{url:'idiot',title:'Idiot.'},
	{url:'dumb-ass',title:'Dumb Ass'},
	{url:'crazy',title:'Crazy'},
	{url:'fools',title:'Fools'},
	{url:'movies',title:'Movies'}
])
boards_categories = BoardCategory.create([
	{url:'business',title:'Business'},
	{url:'science',title:'Science'},
	{url:'technology',title:'Technology'},
	{url:'sports',title:'Sports'},
	{url:'politics',title:'Politics'},
	{url:'celebrities',title:'Celebrities'},
	{url:'world-news',title:'World News'},
	{url:'news',title:'News'},
	{url:'entertainment', title:'Entertainment'},
	{url:'cars', title:'Cars'},
	{url:'movies', title:'Movies'}
])
users = User.create([
	{password:'password', reset_password_token: nil, reset_password_sent_at: nil, remember_created_at: nil, sign_in_count: 0, current_sign_in_at: nil, last_sign_in_at: nil, current_sign_in_ip: nil, last_sign_in_ip: "38.142.8.210", created_at: "2017-05-15 05:30:53", updated_at: "2017-05-15 05:35:24", username: "Jack", firstname: nil, lastname: nil, email: nil, token_string: nil, admin: true, token: nil, good_standing: true, old_password: nil, login_username: "jack", uuid: "5b8fc9a4b9e0b2ec7fe4ff844149be5dd0ea9293", ratings: [], ratings_count: 0, ratings_songs: [], ratings_songs_ids: [], ratings_songs_count: 0, average_rating: 100, average_rating_songs: 100, logged_in: false, locked: false, votes_count: 0, average_vote: 0, karma: 0, news_subs: ["business", "science", "technology", "sports"], music_subs: ["electronic", "hip-hop", "house", "trap"], video_subs: ["funny", "feel-good", "real", "oh-shit"], address: "", phone_number: "", city: "", state: "", zip: 0, tsv_body: nil, songs: {}, videos: {}, news_posts: {}, moderator: false, seller: false, artist: false, creator: false, reporter: false, comments: [], human: true, address_two: nil, approved_seller: true, selled_id: nil, logins: 1, comment_karma: 0, news_karma: 0, music_karma: 0, videos_karma: 0, products_karma: 0, gender: nil, verified_email: false, email_token: nil, email_time_stamp: nil, apparel: {}, technology: {}, post_karma: 0, hide_nsfw: false, show_nsfw: false, report_types: [], reports: [], user_reported: false, report_count: 0, report_fouls: [], song_downloads: {}, ips: {}, news_posts_viewed: {}, songs_viewed: {}, videos_viewed: {}, apparel_viewed: {}, technology_viewed: {}, durations: {}, average_duration: 0, songs_played: {}, videos_played: {}, trackers: {}, news_posts_duration: {}, songs_duration: {}, videos_duration: {}, products_duration: {}, news_post_average_duration: 0, songs_average_duration: 0, videos_average_duration: 0, products_average_duration: 0, consecutive_days: {}, average_consecutive_days: 1, days_visited: 1, mobile_vists: 0, non_mobile_visits: 0, last_visit: Time.now, last_consecutive_days: 0, since_last_visit: nil, last_tracker: "", last_duration: 0, news_votes: {}, music_votes: {}, videos_votes: {}, apparel_votes: {}, technology_votes: {}, pageviews: {}, average_pageviews: 0, last_pageviews: 0}
])
