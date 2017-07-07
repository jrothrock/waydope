# README

This site allows people to link to news, upload videos and music, as well as sell apparel and technology.

Project Can Be Found At:
https://waydope.com

### To Run

Rails (Port 3000):
```sh
$ bundle install
$ rake db:setup 
$ rails s
```
Angular (Port 4200):
```sh
$ cd client
$ npm install
$ npm start
```

### Stack

* Angular 2/4
* Rails 5
* Materialize
* jQuery
* PostgreSQL
* Redis


This project requires taglib in order to pull the album from id3 tags. Here's the documentation on how to install it:

https://robinst.github.io/taglib-ruby/

This project requires FFMPEG for transcoding and other various applications. Here's the documentation on how to install it and use it with streamio (FFMPEG ruby wrapper):

https://github.com/streamio/streamio-ffmpeg

On Mac you need to run `brew install ffmpeg --with-libvpx --with-libvorbis --with-theora --with-x264` or `brew reinstall ffmpeg --with-libvpx --with-libvorbis --with-theora --with-x264`

This project requires docker to run the open_nsfw
    - the open_nsfw folder needs to be in the root of the waydope folder - waydope/open_nsfw/*

Open NSFW: https://github.com/yahoo/open_nsfw

One needs to git clone this repository: https://github.com/StevenBlack/hosts.git, and move the alternatives/(gambling-fakenews-porn)/hosts into the lib/assets/ folder

This project also uses CloudZoom which is a paid for script - $40 - which zooms in on the photo. There is a free version, but I haven't found it to work.

One will need to fill in the secrets.yml

One will need to download all the vendor script files (not found on NPM) found in the client/assets/js/files.txt, and place them in client/assets/js/

The secrets file has been removed from git repository. It contains these:
```
  secret_key_base: <%= ENV["SECRET_KEY_BASE"] %>
  aws_access_key_id: xxxxxxxxxxxxxxxx
  aws_secret_access_key:  xxxxxxxxxxxxxxxx
  aws_region:  your-region-here
  sendgrid_api_key:  xxxxxxxxxxxxxxxx
  cdn: cdn
  aws_bucket: 'xxxxxxxxxxxxxxxx'
  hostname: https://api.yourdomain.com
  paypal_id:  xxxxxxxxxxxxxxxx
  paypal_secret:  xxxxxxxxxxxxxxxx
  stripe: sk_test_xxxxxxxxxxxxxxxx
```


LICENSE:
This code is released under CC BY-SA 4.0. See license for more details.