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

One needs to git clone this repository: https://github.com/StevenBlack/hosts.git, and move the alternatives/(gambline-fakenews-porn)/hosts into the lib/assets/ folder

This project also uses CloudZoom which is a paid for script - $40 - which zooms in on the photo. There is a free version, but I haven't found it to work. Not sure if it'll error without it.

One will need to fill in the secrets.yml

One will need to download all the vendor script files (not found on NPM) found in the client/assets/js/files.txt, and place them in client/assets/js/


Thoughts:
Overall, the stats were pretty good. The bounce rate was around 13%. Unfortunatly, it took me a lot longer to finish than I originally thought. Being the only one working on this, sleeping in my car, and being completely broke/digging into credit cards, burnout was inevitable. Plus, I wasn't having fun, and didn't enjoy it anymore, so that's the nail.

LICENSE:
