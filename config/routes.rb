require 'sidekiq/web'
class Isadmin
  def self.matches?(request)
    User.isAdminRoute(request)
  end
end

Rails.application.routes.draw do

  root 'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  # constraints Isadmin do
    mount Sidekiq::Web => '/workers'
  # end

  get '/', to: 'home#index', as:'show_home'


  namespace :api do

    namespace :v1 do
      # constraints(:origin => 'https://waydope.com') do
        namespace :auth do

          post '/signup', to: 'users#create', as: 'add_user'
          post '/login', to: 'sessions#new', as: 'login'
          post '/logout', to: 'sessions#destroy', as: 'logout'

          namespace :admin do
            post '/check', to: 'sessions_admin#new', as: 'login_admin'
          end

        end

        namespace :search do
          get '/', to:'search#index', as: 'get_search'
        end 

        namespace :home do
          get '/', to: 'home#index', as: 'get_home'
          get '/paginate', to:'home#read', as: 'paginate_home'
        end

        namespace :categories do
          namespace :music do
            get '/search', to:'music#read', as:'get_music_genres'
            get '/search/post', to:'post#read', as:'get_music_post'
          end
          namespace :videos do
            get '/search', to:'videos#read', as:'get_video_categories'
            get '/search/post', to:'post#read', as:'get_video_post'
          end
          namespace :boards do
            get '/search', to:'boards#read', as:'get_board_categories'
            get '/search/post', to:'post#read', as:'get_news_post'
          end
          namespace :apparel do
            get '/search/post', to:'post#read', as:'get_apparel_post'
          end
          namespace :technology do
            get '/search/post', to:'post#read', as:'get_technology_post'
          end
          namespace :comments do
            get '/search', to:'comment#read', as:'get_comment_admin'
          end
        end

        namespace :users do
          get '/user', to: 'user#read', as: 'get_user_info'
          get '/info', to: 'info#read', as: 'get_info'
          get '/settings', to:'settings#read', as: 'get_settings'
          get '/notifications', to:'notifications#read', as:'get_notification'
          get '/notifications/all', to:'notifications#index', as:'get_notifications'
          post '/notifications/update', to:'notifications#update', as:'update_notifications'
          get '/messages', to:'messages#read', as:'get_message'
          get '/messages/all', to:'messages#index', as:'get_messages'
          post '/messages/update', to:'messages#update', as:'update_messages'
          post '/settings/update', to:'settings#update', as: 'update_settings'
          get '/preferences', to:'preferences#read', as: 'get_user_preferences'
          post '/info/update', to: 'info#update', as: 'update_info'

          namespace :seller do 
            get '/paypal', to: 'paypal#read', as: 'get_user_paypal_info'
            post '/info/update', to:'info#update', as:'update_seller_info'
            post '/verify', to:'verification#update', as:'user_verify_seller'
            post '/paypal/update', to: 'paypal#update', as: 'update_user_paypal'
            post '/stripe/update', to: 'stripe#update', as: 'update_user_stripe'
            post '/ssn/update', to: 'ssn#update', as:'update_user_ssn'
          end

          namespace :actions do
            post '/verify', to:'verify#update', as: 'verify_email'
            post '/reset', to:'reset#create', as: 'reset_email'
            post '/reset/password', to:'reset#update', as: 'reset_password'
          end

          namespace :orders do
            get '/order', to: 'order#read', as: 'get_user_order'
            get '/', to: 'orders#read', as: 'get_user_orders' 
          end
          
          namespace :music do
            get '/', to: 'music#index', as: 'get_user_music'
            post '/sort', to: 'music#read', as: 'sort_user_music'
            post '/paginate', to: 'music#update', as: 'paginate_user_music'
          end

          namespace :comments do
            get '/', to: 'comments#index', as: 'get_user_comments'
            post '/sort', to: 'comments#read', as: 'sort_user_comments'
            post '/paginate', to: 'comments#update', as: 'paginate_user_comments'
          end

          namespace :boards do
            get '/', to: 'boards#index', as: 'get_user_boards'
            post '/sort', to: 'boards#read', as: 'sort_user_boards'
            post '/paginate', to: 'boards#update', as: 'paginate_user_boards'
          end
        
          namespace :apparel do
            get '/', to: 'apparel#index', as: 'get_user_apparel'
            post '/sort', to: 'apparel#read', as: 'sort_user_apparel'
            post '/paginate', to: 'apparel#update', as: 'paginate_user_apparel'
          end

          namespace :technology do 
            get '/', to: 'technology#index', as: 'get_user_technology'
            post '/sort', to: 'technology#read', as: 'sort_user_technology'
            post '/paginate', to: 'technology#update', as: 'paginate_user_technology'
          end

          namespace :videos do
            get '/', to: 'videos#index', as: 'get_user_videos'
            post '/sort', to: 'videos#read', as: 'sort_user_videos'
            post '/paginate', to: 'videos#update', as: 'paginate_user_videos'
          end

        end

        namespace :sellers do
          get '/', to: 'sellers#index', as:'get_seller'
          get '/sale', to: 'sellers#read', as:'get_sale'
          post '/sale/update', to: 'sellers#update', as:'update_sale'
        end

        namespace :track do
          post '/', to: 'tracker#create', as: 'create_tracker'
          post '/update', to:'tracker#update', as:'update_tracker'
        end

        namespace :comments do
          get '/', to: 'comments#index', as: 'get_comments'
          get '/comment', to: 'comments#read', as:'get_comment'
          post '/new', to: 'comments#create', as: 'new_comments'
          post '/reply/new', to: 'replies#create', as: 'new_reply'
          post '/reply/edit', to: 'replies#edit', as: 'edit_reply'
          post '/reply/delete', to: 'replies#delete', as: 'delete_reply'
          post '/edit', to: 'comments#edit', as: 'edit_comment'
          post '/delete', to: 'comments#delete', as: 'delete_comment'
        end

        namespace :photos do
          post '/delete', to: 'photos#delete', as: 'delete_photo'
          post '/create', to: 'photos#create', as: 'create_photo'
        end

        namespace :music do
          namespace :s3 do
            get '/new', to: 'music#create', as:'create_s3_song'
          end
          get '/all', to: 'music#index', as: 'all_music'
          get '/song', to: 'music#read', as: 'get_song'
          post '/song/play', to:'play#create', as: 'play_song'
          get '/rest', to: 'all#index', as: 'get_rest_of_all_songs'
          post '/download', to: 'download#create', as: "create_download"
          post '/new', to: 'music#create', as: 'new_song'
          post '/delete', to: 'music#delete', as: 'delete_song'
          post '/update', to:'music#update', as: 'update_song'
          post '/sort', to: 'all#read', as:'sort_genres'
          post '/paginate', to:'all#update', as: 'paginate_genres'

          get '/genre', to: 'genre#index', as: 'get_music_genre'
          post '/genre/sort', to: 'genre#read', as: 'sort_music_genre'
          post '/genre/paginate', to: 'genre#update', as: 'paginate_songs'

        end

        namespace :news do
          get '/', to: 'news#index', as: 'get_posts'
          get '/post', to: 'news#read', as: 'get_post'
          get '/rest', to: 'all#index', as: 'get_rest_of_all_news'
          post '/new', to: 'news#create', as: 'new_post'
          post '/sort', to: 'all#read', as: 'sort_categories'
          post '/update', to:'news#update', as: 'update_post'
          post '/delete', to: 'news#delete', as: 'delete_post'
          post '/paginate', to:'all#update', as: 'paginate_categories'
          ###ALL NEWS###
          get '/all', to: 'all#index', as: 'all_posts'
          get '/category', to: 'category#index', as: 'get_news_category'
          post '/category/sort', to: 'category#read', as: 'sort_news_posts'
          post '/category/paginate', to: 'category#update', as:'page_news_posts'
        end

        namespace :videos do
          get '/', to: 'videos#index', as: 'get_videos'
          get '/post', to: 'videos#read', as: 'get_video'
          post '/post/play', to:'play#create', as: 'play_video'
          get '/rest', to: 'all#index', as: 'get_rest_of_all_videos'
          post '/new', to: 'videos#create', as: 'new_video'
          post '/update', to: 'videos#update', as: 'update_video'
          post '/delete', to: 'videos#delete', as: 'delete_video'
          post '/sort', to: 'all#read', as: 'sort_videos_categories'
          post '/paginate', to:'all#update', as: 'paginate_videos_categories'

          get '/category', to: 'category#index', as: 'get_video_category'
          post '/category/sort', to: 'category#read', as: 'sort_video_category'
          post '/category/paginate', to: 'category#update', as: 'paginate_videos'
        end
        

        namespace :cart do
          get '/', to:'cart#read', as: 'get_cart'
          post '/new', to:'cart#create', as: 'new_cart'
          post '/update', to:'cart#update', as: 'update_cart'
          post '/delete', to:'cart#delete', as: 'delete_cart'
          post '/payment', to: 'order#update', as: 'cart_payment'
          post '/paypal', to:'paypal#create', as: 'created_paypal'
        end

        namespace :apparel do
          get '/', to: 'all#index', as: 'get_apparel'
          get '/post', to: 'apparel#read', as: 'get_video'
          post '/new', to:'apparel#create', as: 'new_apparel'
          post '/update', to:'apparel#update', as: 'update_apparel'
          post '/delete', to:'apparel#delete', as: 'delete_apparel'
          post '/sort', to: 'all#read', as: 'sort_videos_categories'
          post '/paginate', to:'all#update', as: 'paginate_videos_categories'

          get '/category', to:'category#index', as: 'get_apparel_category'
          post '/category/sort', to:'category#read', as: 'sort_apparel_category'
          post '/category/paginate', to:'category#update', as: 'paginate_apparel'
        end

        namespace :technology do
          get '/', to: 'all#index', as: 'get_technologies'
          get '/post', to: 'technology#read', as: 'get_technology'
          post '/new', to:'technology#create', as: 'new_technology'
          post '/update', to:'technology#update', as: 'update_technology'
          post '/delete', to:'technology#delete', as: 'delete_technology'
          post '/sort', to: 'all#read', as: 'sort_technology'
          post '/paginate', to:'all#update', as: 'paginate_technology'

          get '/category', to:'category#index', as: 'get_technology_category'
          post '/category/sort', to:'category#read', as: 'sort_technology_category'
          post '/category/paginate', to:'category#update', as: 'paginate_technology_category'
        end

        namespace :messages do
          get '/inbox', to: 'inbox#read', as: 'get_inbox'
          get '/outbox', to: 'outbox#read', as: 'get_outbox'
          get '/read', to:'messages#read', as: 'get_conversation'
          post '/new', to: 'messages#create', as: 'create_messages'
          namespace :conversation do 
            get '/', to: 'messages#read', as: 'get_messages'
          end
        end

        namespace :contact do
          post '/new', to: 'messages#create', as: 'new_contact_message'
        end

        namespace :likes do
          post '/new', to: 'likes#create', as: 'new_like'
        end

        namespace :report do
          post '/new', to: 'report#create', as: 'new_flag'
        end

        namespace :ratings do 
          post '/new', to: 'ratings#create', as: 'new_rating'
        end

        namespace :partners do
          post '/application/new', to: 'application#create', as: 'new_parter_application'
        end

        namespace :votes do
          post '/vote', to: 'votes#create', as: 'new_vote'
          # post '/comments/vote', to: 'comments#create', as: 'new_comments_vote'
        end

        namespace :menus do
          get '/boards', to:'boards#index', as:'get_menu_boards'
          get '/music', to: 'music#index', as:'get_menu_music'
          get '/videos', to: 'videos#index', as:'get_menu_videos'
          get '/apparel', to: 'apparel#index', as:'get_menu_apparel'
          get '/technology', to: 'technology#index', as:'get_menu_technology'
        end

        namespace :admin do
          
          ### MAIN ###
          get '/main', to: 'main#index', as: 'get_main_admin'

          ### USERS ###

          get '/users', to: 'users#index', as: 'get_users_admin'
          get '/user', to: 'users#read', as: 'get_user_admin'
          post '/user/update', to: 'users#update', as: 'update_user_admin'
          post '/user/ban', to: 'users#ban', as: 'ban_user_admin'
          post '/user/unban', to: 'users#unban', as: 'unban_user_admin'
          post '/user/lock', to: 'users#lock', as: 'lock_user_admin'

          ### NEWS ###

          get '/news', to: 'news#index', as: 'get_news_admin'
          get '/article', to: 'news#read', as: 'get_article_admin'
          post 'article/update', to:'news#update', as: 'update_article_admin'

          ### MUSIC ###

          get '/music', to: 'music#index', as: 'get_music_admin'
          get '/song', to: 'music#read', as: 'get_song_admin'
          post '/song/update', to: 'music#update', as: 'update_song_admin'

          ### VIDEOS ###

          get '/videos', to: 'videos#index', as: 'get_videos_admin'
          get '/video', to: 'videos#read', as: 'get_video_admin'
          post '/video/update', to: 'videos#update', as: 'update_video_admin'

          ### MESSAGES ###

          get '/messages', to: 'messages#index', as: 'get_messages_admin'
          get '/message', to: 'messages#read', as: 'get_message_admin'

          ### APPLICATIONS ###

          get 'applications', to: 'applications#index', as: 'get_applications_admin'
          get 'application', to: 'applications#read', as: 'get_application_admin'
          post 'application/accept', to: 'applications#update', as: 'accept_application_admin'

          ### PARTNERS ###
          get 'partners', to: 'partners#index', as: 'get_partners_admin'
          get 'partner', to: 'partners#read', as: 'get_partner_admin'
          post 'partner/revoke', to:'partners#update', as: 'revoke_partner_admin'

          namespace :bots do
            post '/comments', to: 'comments#create', as:'submit_mass_comments'
            post '/comment', to: 'comment#create', as:'submit_comments'
            post '/likes', to: 'likes#create', as: 'submit_mass_likes'
            post '/votes', to: 'votes#create', as: 'submit_mass_votes'
            post '/ratings', to: 'ratings#create', as: 'submit_mass_ratings'
            post '/users', to: 'users#create', as:'create_users'
            post '/users/update', to: 'users#update', as:'update_users'
          end

          namespace :new do
            get '/posts', to: 'posts#index', as:"get_new_admin_posts"
            get '/posts/paginate', to: 'posts#read', as:'get_admin_posts_paginate'
            post '/posts/update', to: 'posts#update', as:'update_posts_admin'

            get '/flags', to: 'flags#index', as:"get_admin_flags"
            get '/flags/paginate', to: 'flags#read', as:'get_admin_flags_paginate'
            post '/flags/update', to: 'flags#update', as:'update_flags_admin'

            get '/reports', to: 'reports#index', as:"get_admin_reports"
            get '/reports/paginate', to: 'reports#paginate', as:'get_admin_reports_paginate'
            post '/reports/update', to: 'reports#update', as:'update_reports_admin'
          end

          namespace :posts do
            post '/lock', to: 'lock#update', as: 'lock_post'
            post '/remove', to: 'remove#update', as: 'remove_post'
          end

          namespace :comments do
            post '/sticky', to: 'sticky#update', as: 'sticky_comment'
            post '/remove', to: 'removal#update', as: 'remove_comment'
          end
        end

      # end
    end
  end

end
