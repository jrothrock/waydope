import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {PhotosService} from '../../../services/photos.service';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {VoteService} from '../../../services/vote.service';
import {MessagesService} from '../../../services/messages.service';
import {AppComponent} from '../../app/app.component';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {VideoService} from '../../../services/video.service';
declare var videojs;
declare var $;
declare var WaveSurfer;
declare var CloudZoom;
declare var _setMeta;

@Component({
  selector: 'profile',
  templateUrl: 'profile.users.component.html',
  providers: [SystemMessagesComponent, AppComponent, ModalComponent]
})
export class ProfileComponentUsers implements OnInit {
	subscription:any;
	likeSubscription:any;
	bioSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
	watchVoteSubscription:any;
	routerSubscription:any;
	downloadSubscription:any;
	playSubscription:any;
	playVideoSubscription:any;
	user:string=null;
	iscurrentUser:boolean=false;
	bio:string;
	updatedBio:boolean=false;
	loaded:boolean=false;
	comments:any=[];
	music:any=[];
	videos:any=[];
	apparel:any=[];
	technology:any=[];
	hovering:boolean=false;
	hoveringCheck:boolean=false;
	hoveringType:number;
	hoveringID:string;
	wavesurfer:any=[];
	audioPlaying:boolean=false;
	currentlyPlaying:any;
	currentlyPlayingType:string;
	currentlyPlayingId:number;
	loadingPlayer:boolean=false;
	videoJSplayer:any=[];
	math:any=Math;
	zoomedPhoto:any;
	server_url:string;
	github:string;
	stackoverflow:string;
	tumblr:string;
	twitter:string;
	facebook:string;
	linkedin:string;
	reddit:string;
	pinterest:string;
	snapchat:string;
	instagram:string;
	foursquare:string;
	website:string;
	email:string;
	vine:string;
	soundcloud:string;
	youtube:string;
	links:any=[];
	music_ids:any=[];
	video_ids:any=[];
	apparel_ids:any=[];
	technology_ids:any=[];
	comment_karma:number=0;
	karma:number=0;
	noUser:boolean=false;
	downloading:boolean=false;
	elapsed_time:any;
	banned:boolean=false;
	constructor(private _fb: FormBuilder, private _vidService: VideoService, private _appComp:AppComponent, private _messageService:MessagesService, private _voteService: VoteService,private _backend:BackendService, private _http: Http, private _photoService: PhotosService, private _lb: LightBoxComponent, private _modal: ModalComponent, private _route: ActivatedRoute, private _router: Router, private _auth: AuthService, private _sysMessages: SystemMessagesComponent){
		this.routerSubscription = _router.events.subscribe(s => {
			
        if(s && s["state"] && this.loaded){
          if(window.location.pathname.split('/').pop() != this.user){
			this.user = window.location.pathname.split('/').pop()
			this.noUser = false;
			this.iscurrentUser = localStorage.getItem('username') === this.user ? true : false;
			_setMeta.setProfile(this.user);
			this.getPosts();
		  }
        }
	  })
	};
	ngOnInit(){
		$('.container').addClass('extended-container');
		this.server_url = this._backend.SERVER_URL;
		this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
		_setMeta.setProfile(this.user);
		this.iscurrentUser = localStorage.getItem('username') === this.user ? true : false;
		this.getPosts();
		this.voteCheck();
	};

	getPosts(){
		var headers = new Headers();
		headers.append('user', this.user);
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${this.user}`, {headers: headers}).subscribe(data => {
			this.karma = data.json().user.karma;
			this.comment_karma = data.json().user.comment_karma;
			this.music = data.json().user.songs;
			this.videos = data.json().user.videos;
			this.comments = data.json().user.comments;
			this.apparel = data.json().user.apparel;
			this.technology = data.json().user.technology;
			if(!data.json().user.good_standing){
				this.banned = true;
				$("#user-banned-message").css({'display':'block'}).data('showing',true)
			}
			this.setIds();
			setTimeout(()=>{
				// this.getImageWidth('apparel');
				// this.getImageWidth('technology');
				// this.getRestImageWidth('apparel');
				// this.getRestImageWidth('technology');
				
			},200)
			this.displayAll();
			this.loaded = true;
		}, error =>{
			let signedin = this._auth.checkSession();
			
			if(signedin){
				this._sysMessages.setMessages("noUser");
				this.noUser = true;
			}
		})
	}

	setVote(vote,id,type,average_vote,voted){
		var headers = new Headers({
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let index = type === 'comment' ? id : null;
		id = type === 'comment' ? this.comments[id].uuid : id;
		var body = {"id":id, "type":type, "vote":vote, "already_voted":voted}
		this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
				let change;
				if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				else if(vote === 1 && !voted) change = 1;
				else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				else if(vote === -1 && !voted) change = -1;
				if(type != 'comment') {
					this.voteChange(id,average_vote+change,data.json().user_vote,type)
				} else {
					this.comments[index].average_vote = (average_vote + change)
					this.comments[index].user_voted = data.json().user_vote
				}
			
		}, error=>{
			if(error.status === 401){
				this._modal.setModal('user',this.user);
			}
		});
	}
	// getImageWidth(type){
	// 	let post_type = type === 'apparel' ? this.apparel : this.technology;
	// 	let container_width = $(`#main-photo-${type}-container-0`).width()
	// 	let container_height = $(`#main-photo-${type}-container-0`).height()
	// 	if(post_type && post_type.length){
	// 	for(let id = 0; id < post_type.length; id++){
	// 		//     let image_object = new Image();
	// 		//     image_object.src = $(`#main-photo-${type}-${id}`).attr("src");

				
	// 				// 		let native_width = image_object.width;
	// 				// 		let native_height = image_object.height;

	// 		//   if(native_height > native_width && native_height > container_height){
	// 				// 	let multiplier = container_height / native_height
	// 				// 	let new_width = native_width * multiplier;
	// 				// 	$(`#main-photo-${type}-${id}`).height(container_height).width(new_width)
	// 				// } else if (native_height > native_width && native_height <= container_height) {
	// 				// 	$(`#main-photo-${type}-${id}`).height(native_height).width(native_width)
	// 				// } else if (native_width > native_height && native_width > container_width){
	// 				// 	let multiplier = container_width / native_width;
	// 				// 	let new_height = (native_height * multiplier);
	// 				// 	let width = new_height > container_height ? ((container_height/new_height)*container_width) : container_width;
	// 				// 	let height = new_height > container_height ? container_height : new_height;
	// 				// 	$(`#main-photo-${type}-${id}`).height(height).width(width);
	// 				// } else if(native_height === native_width && native_height > container_height) {
	// 				// 	$(`#main-photo-${type}-${id}`).height(container_width).width(container_height)
	// 				// } else {
	// 				// 	$(`#main-photo-${type}-${id}`).height('100%').width('100%')
	// 				// }
	// 				// $(`#main-photo-${type}-${id}`).css({'display':'block'});
	// 		}
	// 	}
	// }
	// getRestImageWidth(type){
	// 	let post_type = type === 'apparel' ? this.apparel : this.technology;
	// 	if(post_type && post_type.length){
	// 		for(let id = 0; id < post_type.length;id++){
	// 			if(post_type && post_type[id] && post_type[id].photos){
	// 				for(let ic = 0;ic < post_type[id].photos.length;ic++ ){
	// 					// let image_object = new Image();
	// 					// image_object.src = $(`#rest-photos-${type}-${id}-${ic}`).attr("src");
	// 					// let native_width = image_object.width;
	// 					// let native_height = image_object.height;
	// 					// if(native_height > native_width && native_height > 50){
	// 					// 	let multiplier = 50 / native_height
	// 					// 	let new_width = native_width * multiplier;
	// 					// 	$(`#rest-photos-${type}-${id}-${ic}`).height(50).width(new_width)
	// 					// } else if (native_height > native_width && native_height <= 50) {
	// 					// 	$(`#rest-photos-${type}-${id}-${ic}`).height(native_height).width(native_width)
	// 					// } else if (native_width > native_height && native_width > 75){
	// 					// 	let multiplier = 75 / native_width;
	// 					// 	let new_height = native_height * multiplier;
	// 					// 	$(`#rest-photos-${type}-${id}-${ic}`).height(new_height).width(75);
	// 					// 	$('')
	// 					// } else {
	// 					// 	$(`#rest-photos-${type}-${id}-${ic}`).height(native_height).width(native_width)
	// 					// }
	// 					$(`#rest-photos-${type}-${id}-${ic}`).css({'display':'initial'});
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	like(id,liked,value,index,type){
    var headers = new Headers({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"id":id, "liked" : liked, "type" : type}
    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
		let post, post_array, view_id, user_liked;
		user_liked = data.json().user_liked;
		switch(type){
			case 'music':
				post = this.music[index];
				if(!user_liked){
					post_array = this.music;
					view_id = $(`#profile-music-${id}`);
				}
				break;
			case 'videos':
				post = this.videos[index]
				if(!user_liked){
					post_array = this.videos;
					view_id = $(`#profile-video-${id}`);
				}
				break;
			case 'apparel':
				post = this.apparel[index]
				if(!user_liked){
					post_array = this.apparel;
					view_id = $(`#profile-apparel-${id}`);
				}
				break;
			case 'technology':
				post = this.technology[index]
				if(!user_liked){
					post_array = this.technology;
					view_id = $(`#profile-technology-${id}`);
				}
				break;
		}
       if(post) post.likes_count = data.json().likes_count;
       if(post) post.user_liked = user_liked;
        if(user_liked){
            $(`#icon-likes-${id}-${type}`).addClass(' liked-icon fa-heart');
            $(`#icon-likes-${id}-${type}`).removeClass('fa-heart-o');
            $(`#likes-button-${id}-${type}`).addClass(' liked');
            $(`#likes-${id}-${type}`).html(`${value + 1}`);
        } else if(!user_liked){
            $(`#icon-likes-${id}-${type}`).addClass(' fa-heart-o');
            $(`#icon-likes-${id}-${type}`).removeClass('liked-icon fa-heart');
            $(`#likes-button-${id}-${type}`).removeClass('liked');
            $(`#likes-${id}-${type}`).html(`${value-1}`);
			if(this.iscurrentUser){
				setTimeout(()=>{
					$(view_id).fadeOut(()=>{
						post_array.splice(index,1);
					})
				},150)
			}
        }

    }, error => {
		if(error.status === 401){
	    		this._modal.setModal('user',this.user);
	  	}
	});
	}
	searchArtist(artist){
    this._router.navigateByUrl(`/search?category=All&search=${artist}`);
  }
	marqueeToggle(type,name,index){
      let textwidth = $(`#profile-title-link-${name}-${index}`).width();
      let item = $(`#profile-title-link-${name}-${index}`).parent()
      let parentwidth = item.width();
      let scrolldistance = textwidth - parentwidth;
      item.stop();
      if(type === 1 && (textwidth > parentwidth)){
        item.animate({scrollLeft:scrolldistance},1500,'linear');
      } else if (type === 0) {
        item.animate({scrollLeft:0},'medium','swing');
      }
  };
  stopAudio(){
    if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].playPause();
    $(`#song-${this.currentlyPlayingId}`).data('value',0);
    $(`#play-icon-${this.currentlyPlayingId}`).removeClass('fa-pause').addClass('fa-play');
    this.audioPlaying = false;
  }

  startAudio(id,place){
    $(`#song-${id}`).data('value',1);
        $(`#play-icon-${id}`).removeClass('fa-play').addClass('fa-pause');
        this.audioPlaying = true;
        this.currentlyPlaying = place;
        this.currentlyPlayingId = id;
        this.wavesurfer[place].playPause()
        if(this.loadingPlayer) this.loadingPlayer = false;
  }
	checkVolume(type,id,click=false){
    if(type && !click){
      $(`#${id}-volume-range`).on("change mousemove", ()=> {
       	let index = $(`#song-${id}`).data('place');
       	if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${id}-volume-range`).val())/100)
      });
    } else if(!click) {
      $(`#${id}-volume-range`).unbind("change mousemove");
    } else {
		let index = $(`#song-${id}`).data('place');
       	if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${id}-volume-range`).val())/100)
	}
  }
  download(genre,url,title,type){
	if(!this.downloading){
		this.downloading = true;
		let headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let body ={}
		this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${genre}/${url}/download`, body, {headers: headers}).subscribe(data => {
			// (<any>window).location = data.json().url;
			if(type === 1){
				let tag = document.createElement('a');
				tag.setAttribute('href', data.json().url);
				tag.setAttribute('target', "_blank");
				tag.setAttribute('download', title);
				tag.click();
			}
			this.downloading = false;
		});
  	}
  }
  songPlay(genre,url){
		let headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let body = {}
		this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${genre}/${url}/play`, body, {headers: headers}).subscribe(data => {
		});
  }
  loop(id){
    let index = $(`#song-${id}`).data('place');
    let wavesurfer = this.wavesurfer[index];
    let loop = $(`#song-${id}-repeat`).data('loop')
    if(!loop){
      wavesurfer.un('finish');
      wavesurfer.on('finish',()=>{
				  let place = index ? index : $(`#song-${id}`).data('place');
          this.startAudio(id,place);
      });
      $(`#song-${id}-repeat`).addClass('active');
      let loop = $(`#song-${id}-repeat`).data('loop',1)
    } else {
      wavesurfer.un('finish');
      $(`#song-${id}-repeat`).removeClass('active');
      let loop = $(`#song-${id}-repeat`).data('loop',0)
      this.wavesurfer[index].on('finish', ()=>{
          $(`#song-${id}`).data('value',0);
          $(`#play-icon-${id}`).removeClass('fa-pause').addClass('fa-play');
          this.audioPlaying = false;
      });
    }
  }
  

  playAudio(id,url,index=null){
    if((!this.loadingPlayer && index === null) || (this.loadingPlayer && index != null)){
        let value = $(`#song-${id}`).data('value');
        let place = index ? index : $(`#song-${id}`).data('place');
        if((this.currentlyPlaying != null) && (this.currentlyPlaying != place)){
          this.stopAudio();
          this.startAudio(id,place);
        }  else if(value===0) {
         this.startAudio(id,place);
        } else {
         this.stopAudio();
        }
        this.wavesurfer[place].on('finish', ()=>{
          $(`#song-${id}`).data('value',0);
          $(`#play-icon-${id}`).removeClass('fa-pause').addClass('fa-play');
          this.audioPlaying = false;
        });
		this.wavesurfer[place].on('audioprocess', (data)=>{
			    // this will help cut back on the cpu usage a little
          if(Math.floor(data) != this.elapsed_time){
            this.elapsed_time = Math.floor(data);
            let minutes = Math.floor(data / 60)
            let seconds = Math.floor(data % 60)
            $(`#current-time-${id}`).text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds }`);
          }
        })
     }
   }

    waveSurferCreate(id,url){
	  let height;
	  if(window.outerWidth <= 500){
		height=60;
	  } else if(window.outerWidth > 500 && window.outerWidth < 768){
		height = 100;
	  } else if(window.outerWidth > 768 && window.outerWidth < 800){
		height=80;
	  } else if (window.outerWidth > 800 && window.outerWidth < 1000){
		height = 100;
	  } else if(window.outerWidth >= 1000){
		height = 110;
	  } 
      let surfer = WaveSurfer.create({
          container: `#song-waveform-${id}`,
          waveColor: '#ddd',
          progressColor: '#ff6100',
		  height:height,
          barWidth: 2,
          normalize:true,
      });
      this.wavesurfer.push(surfer);
      let newid = this.wavesurfer.length - 1;
      $(`#song-${id}`).data('place',newid);
      this.loadingPlayer = true;
      this.wavesurfer[newid].load(`${url}`);
      this.wavesurfer[newid].on('ready',()=>{
        this.playAudio(id,url,newid);
		let time = this.wavesurfer[newid].getDuration()
		let minutes = Math.floor(time / 60)
		let seconds = Math.floor(time % 60)
		$(`#duration-${id}`).text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
		$(`#song-playing-time-${id}`).css({'display':'block'})
      });
    }

	initVideo(index,id){
		setTimeout(()=>{  
			let video = videojs(`profile-video-${index}-${id}`, {}, function() {
			
							// This is functionally the same as the previous example.
							let container = $(`#profile-video-${index}-${id}`)
							$(container).css({"visibility":"visible"});
							let video_elem = $(container).find("video");
							$(video_elem).css({"visibility":"visible"});
			});
			video.requestFullscreen();
			this.videoJSplayer.push(video);
		},1)
	}
	displayAll(){
		// $("#loading-spinner-profile").css({'display':'none'});
		$("#profile-container").addClass('active-profile');
	}

	setIds(){
	  this.music_ids = [];
		for(let i = 0; i < this.music.length; i++){
			if(this.music[i]) this.music_ids.push(this.music[i].uuid);
		}

		this.video_ids = [];
		for(let i =0; i< this.videos.length; i++){
			if(this.videos[i]) this.video_ids.push(this.videos[i].uuid);
		}

		this.apparel_ids = [];
		for(let i = 0; i<this.apparel.length;i++){
			if(this.apparel[i]) this.apparel_ids.push(this.apparel[i].uuid);
		}

		this.technology_ids = [];
		for(let i =0; i< this.technology.length;i++){
			if(this.technology[i]) this.technology_ids.push(this.technology[i].uuid);
		}
	}
	messageUser(){
			if(!this.noUser && !this.banned) this._messageService.open(this.user);
	}
	voteChange(id,vote,user_voted,type){
		// this could honestly be thrown into an object and have it sorted that way.
				// - for reference look at the JSON object created in the edits for the apparel and tehcnology
						// - if they don't exist look in the waydope archives, probably somewhere in the low 20's.
		if(type === 'music') {
			let index = this.music_ids.indexOf(id);
			if(index > -1){
				this.music[index].average_vote = vote;
				this.music[index].user_voted = user_voted;
			}
		} else if(type === 'videos') {
			let index = this.video_ids.indexOf(id);
			if(index > -1){
				this.videos[index].average_vote = vote;
				this.videos[index].user_voted = user_voted;
			}
		} else if(type === 'apparel') { 
			let index = this.apparel_ids.indexOf(id);
			if(index > -1){
				this.apparel[index].average_vote = vote;
				this.apparel[index].user_voted = user_voted;
			}
		} else if(type === 'technology'){
				let index = this.technology_ids.indexOf(id);
				if(index > -1){
					this.technology[index].average_vote = vote;
					this.technology[index].user_voted = user_voted;
				}
		}
	}

	voteCheck(){
		this._voteService.isAll(true);
		this.watchVoteSubscription = this._voteService.componentAllVote.subscribe((value) => { 
			
			if(value.length){
				this.voteChange(value[0],value[1],value[2],value[3]);
			}
		});
	}

	photoClicked(index,id,type){
		if(type === 'music'){
			var url;
			let song = this.music[index]
			song.clicked = true;
			if(song.form===1) url = song.upload_url;
			setTimeout(()=>{
				if(url) this.waveSurferCreate(id,url);
				if(song.form===1) this.songPlay(song.genre,song.url);
			})
		}else if(type === 'videos'){
			if(this.videos[index].form){
				if(window.outerWidth > 700){
					this.videos[index].clicked = true;
					this._vidService.change([this.videos[index].upload_url,1])
				} else {
					this.initVideo(index,id);
				}
			} else {
				if(window.outerWidth > 700){
					this._vidService.change([this.videos[index].link,0,this.videos[index].link_type])
				} else {
					this.videos[index].clicked = true;
				}
			}
			this.videoPlay(this.videos[index].main_category,this.videos[index].url)
		}
	}
	videoPlay(category,url){
		let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let body = {}
		this.playVideoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/${category}/${url}/play`, body, {headers: headers}).subscribe(data => {
		});
	}
	photoHover(state,id,type){
		if(state){
			if((this.hovering && this.hoveringType === type && this.hoveringID === id) || (this.hovering && !this.hoveringCheck)){
				$(`#play-button-home-${this.hoveringType}-${this.hoveringID}`).attr("src","/assets/images/blackbutton.svg");
				$(`#${this.hoveringType}-artwork-home-${this.hoveringID}`).css({'opacity':0.6});
			}
			this.hovering = true;
			this.hoveringCheck = true;
			this.hoveringType = type;
			this.hoveringID = id;
			$(`#play-button-home-${type}-${id}`).attr("src","/assets/images/orangebutton.svg");
			$(`#${type}-artwork-home-${id}`).css({'opacity':0.9});
		}else{
			this.hoveringCheck=false;
			//allows cursor to move over play button without changing the image back
			setTimeout(()=>{
				if(!this.hoveringCheck){
				$(`#play-button-home-${type}-${id}`).attr("src","/assets/images/blackbutton.svg");
				$(`#${type}-artwork-home-${id}`).css({'opacity':0.6});
				this.hovering = false;
				}
			},100)
		}
	}
	changePhoto(category,parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-${category}-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-${category}-${parentIndex}-${photoIndex}`);
		let src = $(newactive).attr('src');
		$(`#main-photo-${category}-${parentIndex}`).attr('src', src);
		$(oldactive).removeClass('active-photo');
		$(newactive).addClass('active-photo');
	}
	transformRating(average_rating){
		return `translateX(${average_rating}%)`
	}
	photoZoom(type,id){
		if(this.zoomedPhoto) this.zoomedPhoto.destroy();
		let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'};  
		if(id + 1 % 4 === 0 && id != 0) options = {zoomPosition:13,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
		this.zoomedPhoto = new CloudZoom($(`#main-photo-${type}-${id}`),options);
		// $(this.zoomedPhoto).attr('height',200).attr('width',200)
	}
	ngOnDestroy() {
    	// prevent memory leak when component destroyed
		$('.container').removeClass('extended-container');
		this._voteService.isAll(false);
		if(this.subscription) this.subscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.bioSubscription) this.bioSubscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.routerSubscription) this.routerSubscription.unsubscribe();
		if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
		if(this.playVideoSubscription) this.playVideoSubscription.unsubscribe();
		if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();});
  	}
}
