class Tracker < ApplicationRecord

    def self.setUUID
        begin 
        uuid = SecureRandom.hex(10)
        if(Tracker.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, order UUID has a duplicate!' end
        return uuid
        rescue => e
            puts e
            retry
        end
    end

    def self.trackURL url
        urls = {
            "api/v1/search"=>true,
            "api/v1/home"=>true,

            "api/v1/users/comments"=>true,
            "api/v1/users/comments/sort"=>true,
            "api/v1/users/comments/paginate"=>true,
            "api/v1/users/music"=>true,
            "api/v1/users/music/sort"=>true,
            "api/v1/users/music/paginate"=>true,
            "api/v1/users/boards"=>true,
            "api/v1/users/boards/sort"=>true,
            "api/v1/users/boards/paginate"=>true,
            "api/v1/users/apparel"=>true,
            "api/v1/users/apparel/sort"=>true,
            "api/v1/users/apparel/paginate"=>true,
            "api/v1/users/technology"=>true,
            "api/v1/users/technology/sort"=>true,
            "api/v1/users/technology/paginate"=>true,
            "api/v1/users/videos"=>true,
            "api/v1/users/videos/sort"=>true,
            "api/v1/users/videos/paginate"=>true,

            "api/v1/music/song"=>true,
            "api/v1/music/sort"=>true,
            "api/v1/music/paginate"=>true,
            "api/v1/music/genre"=>true,
            "api/v1/music/genre/sort"=>true,
            "api/v1/music/genre/paginate"=>true,

            "api/v1/news"=>true,
            "api/v1/news/sort"=>true,
            "api/v1/news/paginate"=>true,
            "api/v1/news/all"=>true,
            "api/v1/news/category"=>true,
            "api/v1/news/category/sort"=>true,
            "api/v1/news/category/paginate" => true,

            "api/v1/videos"=>true,
            "api/v1/videos/post"=>true,
            "api/v1/videos/sort"=>true,
            "api/v1/videos/paginate"=>true,
            "api/v1/videos/category"=>true,
            "api/v1/videos/category/sort"=>true,
            "api/v1/videos/category/paginate"=>true,

            "api/v1/apparel"=>true,
            "api/v1/apparel/sort"=>true,
            "api/v1/apparel/post"=>true,
            "api/v1/apparel/paginate"=>true,
            "api/v1/apparel/category"=>true,
            "api/v1/apparel/category/sort"=>true,
            "api/v1/apparel/category/paginate"=>true,

            "api/v1/technology"=>true,
            "api/v1/technology/sort"=>true,
            "api/v1/technology/paginate"=>true,
            "api/v1/technology/post"=>true,
            "api/v1/technology/category"=>true,
            "api/v1/technology/category/sort"=>true,
            "api/v1/technology/category/paginate"=>true
        }.as_json
        if urls.key?(url)
            return true
        else
            return false
        end
    end
end