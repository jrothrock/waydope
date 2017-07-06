class Photo < ApplicationRecord
    belongs_to :photoable, polymorphic: true
    mount_uploader :photo, ArtworkUploader
    #process_in_background :photo

    def self.setUUID
        begin 
        uuid = SecureRandom.hex(5)
        uuid[0] = '' # bring string down to 9 characters, 68B possibilitis
        if(Photo.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, order UUID has a duplicate!' end
        return uuid
        rescue
            retry
        end
    end
end
