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
            post '/', to: 'sessions_admin#new', as: 'login_admin'
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
          scope '/:user' do 
            get '/', to: 'user#read', as: 'get_user_info'
            get '/info', to: 'info#read', as: 'get_info'
            post '/info', to: 'info#update', as: 'update_info'
            get '/settings', to:'settings#read', as: 'get_settings'
            post '/settings', to:'settings#update', as: 'update_settings'
            get '/notifications', to:'notifications#read', as:'get_notification'
            post '/notifications', to:'notifications#update', as:'update_notifications'
            get '/notifications/all', to:'notifications#index', as:'get_notifications'
            get '/preferences', to:'preferences#read', as: 'get_user_preferences'
            get '/messages', to:'messages#read', as:'get_message'
            get '/messages/all', to:'messages#index', as:'get_messages'

            namespace :orders do
              scope '/:order' do
                get '/', to: 'order#read', as: 'get_user_order'
              end
              get '/', to: 'orders#read', as: 'get_user_orders' 
            end

            namespace :seller do 
              get '/paypal', to: 'paypal#read', as: 'get_user_paypal_info'
              post '/info', to:'info#update', as:'update_seller_info'
              post '/verify', to:'verification#update', as:'user_verify_seller'
              post '/paypal', to: 'paypal#update', as: 'update_user_paypal'
              post '/stripe', to: 'stripe#update', as: 'update_user_stripe'
              post '/ssn', to: 'ssn#update', as:'update_user_ssn'
            end

            namespace :actions do
              post '/verify', to:'verify#update', as: 'verify_email'
              post '/reset', to:'reset#create', as: 'reset_email'
              post '/reset/password', to:'reset#update', as: 'reset_password'
            end
            
            namespace :music do
              get '/', to: 'music#index', as: 'get_user_music'
            end

            namespace :comments do
              get '/', to: 'comments#index', as: 'get_user_comments'
            end

            namespace :boards do
              get '/', to: 'boards#index', as: 'get_user_boards'
            end
          
            namespace :apparel do
              get '/', to: 'apparel#index', as: 'get_user_apparel'
            end

            namespace :technology do 
              get '/', to: 'technology#index', as: 'get_user_technology'
            end

            namespace :videos do
              get '/', to: 'videos#index', as: 'get_user_videos'
            end
          end
        end

        namespace :sellers do
          get '/', to: 'sellers#index', as:'get_seller'
          get '/sale', to: 'sellers#read', as:'get_sale'
          put '/sale', to: 'sellers#update', as:'update_sale'
        end

        namespace :track do
          post '/', to: 'tracker#create', as: 'create_tracker'
          put '/', to:'tracker#update', as:'update_tracker'
        end

        namespace :comments do
          get '/', to: 'comments#index', as: 'get_comments'
          post '/', to: 'comments#create', as: 'new_comments'
          scope '/:comment' do
            get '/', to: 'comments#read', as:'get_comment'
            put '/', to: 'comments#edit', as: 'edit_comment'
            delete '/', to: 'comments#delete', as: 'delete_comment'
            post '/reply', to: 'replies#create', as: 'new_reply'
            put '/reply', to: 'replies#edit', as: 'edit_reply'
            delete '/reply', to: 'replies#delete', as: 'delete_reply'
          end
        end

        namespace :photos do
          post '/', to: 'photos#create', as: 'create_photo'
          scope '/:photo' do
            delete '/', to: 'photos#delete', as: 'delete_photo'
          end
        end

        namespace :music do
          get '/', to: 'music#index', as: 'all_music'
          post '/', to: 'music#create', as: 'new_song'
          get '/rest', to: 'all#index', as: 'get_rest_of_all_songs'
          scope '/:genre' do
            get '/', to: 'genre#index', as: 'get_music_genre'
            scope '/:song' do
              get '/', to: 'music#read', as: 'get_song'
              put '/', to:'music#update', as: 'update_song'
              delete '/', to:'music#update', as: 'delete_song'
              post '/play', to:'play#create', as: 'play_song'
              post '/download', to: 'download#create', as: "download_song"
            end
          end
        end

        namespace :news do
          get '/', to: 'news#index', as: 'get_posts'
          post '/', to: 'news#create', as: 'new_post'
          get '/rest', to: 'all#index', as: 'get_rest_of_all_news'
          scope '/:category' do
            get '/', to: 'category#index', as: 'get_news_category'
            scope '/:post' do
               get '/', to: 'news#read', as: 'get_post'
               put '/', to:'news#update', as: 'update_post'
               delete '/', to: 'news#delete', as: 'delete_post'
            end
          end
        end

        namespace :videos do
          get '/', to: 'videos#index', as: 'get_videos'
          post '/', to: 'videos#create', as: 'new_video'
          get '/rest', to: 'all#index', as: 'get_rest_of_all_videos'
          scope '/:category' do
            get '/', to: 'category#index', as: 'get_video_category'
            scope '/:video' do
              get '/', to: 'videos#read', as: 'get_video'
              put '/', to: 'videos#update', as: 'update_video'
              delete '/', to: 'videos#delete', as: 'delete_video'
              post '/post', to:'play#create', as: 'play_video'
            end
          end
        end
        

        namespace :cart do
          get '/', to:'cart#read', as: 'get_cart'
          post '/', to:'cart#create', as: 'new_cart'
          put '/', to:'cart#update', as: 'update_cart'
          delete '/', to:'cart#delete', as: 'delete_cart'
          post '/payment', to: 'order#update', as: 'cart_payment'
          post '/paypal', to:'paypal#create', as: 'created_paypal'
        end

        namespace :apparel do
          get '/', to: 'all#index', as: 'get_all_apparel'
          post '/', to:'apparel#create', as: 'new_apparel'
          scope '/:category/' do 
            get '/', to:'category#index', as: 'get_apparel_category'
            scope '/:subcategory' do
            get '/', to:'category#index', as: 'get_apparel_subcategory'
              scope '/:post' do 
                get '/', to: 'apparel#read', as: 'get_apparel'
                put '/', to:'apparel#update', as: 'update_apparel'
                delete '/', to:'apparel#delete', as: 'delete_apparel'
              end
            end
          end
        end

        namespace :technology do
          get '/', to: 'all#index', as: 'get_all_technology'
          post '/', to:'technology#create', as: 'new_technology'
          scope '/:category' do
            get '/', to:'category#index', as: 'get_technology_category'
            scope '/:subcategory' do
              get '/', to:'category#index', as: 'get_technology_subcategory'
              scope '/:post' do 
                get '/', to: 'technology#read', as: 'get_technology'
                put '/', to:'technology#update', as: 'update_technology'
                delete '/', to:'technology#delete', as: 'delete_technology'
              end
            end
          end
        end

        namespace :messages do
          get '/', to:'messages#read', as: 'get_conversation'
          post '/', to: 'messages#create', as: 'create_messages'
          namespace :conversation do 
            get '/', to: 'messages#read', as: 'get_messages'
          end
          scope '/inbox' do
            get '/', to: 'inbox#read', as: 'get_inbox'
          end
          scope '/outbox' do
            get '/', to: 'outbox#read', as: 'get_outbox'
          end
        end

        namespace :contact do
          post '/', to: 'messages#create', as: 'new_contact_message'
        end

        namespace :likes do
          post '/', to: 'likes#create', as: 'new_like'
        end

        namespace :report do
          post '/', to: 'report#create', as: 'new_flag'
        end

        namespace :ratings do 
          post '/', to: 'ratings#create', as: 'new_rating'
        end

        namespace :partners do
          post '/application', to: 'application#create', as: 'new_parter_application'
        end

        namespace :votes do
          post '/', to: 'votes#create', as: 'new_vote'
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
