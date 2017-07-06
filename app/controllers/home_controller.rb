class HomeController < ApplicationController
    def index
        render json:{message:"Oh hey, what's up? Way Dope's API will be released shortly! Find more news and information here: https://waydope.com/developers."}
    end
end