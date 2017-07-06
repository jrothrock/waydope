require 'rubygems'
require 'active_support/core_ext/numeric/time'
require 'action_view'
require 'action_view/helpers'
include ActionView::Helpers::DateHelper
module Time_ago
    #single array
    class Time
        def self.single(items)
            items.each do |item|
                item.time_ago = time_ago_in_words(item.created_at).gsub('about','') + ' ago'
            end
            return items
        end
        #multiple arrays
        def self.batch(arrays)
            arrays.each do |array|
                array.each do |item|
                    item.time_ago = time_ago_in_words(item.created_at).gsub('about','') + ' ago'
                end
            end
            return arrays
        end
    end
end
