import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import { Location } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {VoteService} from '../../../services/vote.service';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {VideoService} from '../../../services/video.service';
declare var $;
declare var videojs;
declare var WaveSurfer;

@Component({
  selector: 'profile_videos',
  templateUrl: 'profile.videos.component.html'
})

export class ProfileVideosComponent implements OnInit {
    sortVideos:FormGroup;
    videos:any=[];
	error:boolean=true;
	loaded:boolean=false;
    subscription:any;
	likeSubscription:any;
    sortSubscription:any;
    paginateSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
	watchVoteSubscription:any;
	playSubscription:any;
    user:string=null;
	iscurrentUser:boolean=false;
    totalCount:number;
	hovering:boolean=false;
 	hoveringCheck:boolean=false;
  	hoveringIndex:number;
  	hoveringCategory:string;
  	audioPlaying:boolean=false;
  	wavesurfer:any=[];
  	currentlyPlaying:any;
  	currentlyPlayingId:number;
  	loadingPlayer:boolean=false;
  	options:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typeValues:any=['Descending','Ascending'];
  	featureds:any=['Include', 'Exclude'];
  	featuredsValue:any=[0,1];
  	offset:number;
  	disabledTimeSelect:boolean=false;
  	disabledSelects:boolean=false;
  	optionValues:any;
  	timeValues:any;
  	typesValues:any;
  	currentPage:number;
  	pages:number;
  	total:number;
  	numbers:any;
    math:any=Math;
	server_url:string;
	videoJSplayer:any=[];
	ids:any=[];
	constructor(private _fb: FormBuilder, private _vidService: VideoService, private _voteService: VoteService, private _backend: BackendService, private _http: Http, private _location: Location, private _modal: ModalComponent, private _route: ActivatedRoute, private _router: Router, private _auth: AuthService, private _sysMessages: SystemMessagesComponent){};
	ngOnInit(){
		this.server_url = this._backend.SERVER_URL;
        $('.container').addClass('extended-container');
		let decoded = decodeURIComponent(window.location.search.substring(1))
		let params = decoded.split("&");
		for(let i = 0;i < params.length; i++){
			let key = params[i].split("=")[0]
			let value = params[i].split("=")[1]
			switch(key){
				case 'offset':
					this.offset = parseInt(value);
					break;
				case 'order':
					this.optionValues = value;
					break;
				case 'time':
					this.timeValues = value;
					break;
				case 'type':
					this.typesValues = value;
					break;
			}
		}
		this.currentPage = (this.offset / 20) + 1;
		this.sortVideos = this._fb.group({
	      'options': ['Votes', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required],
	      'featured': [1, Validators.required]
	    })
        this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
        this.iscurrentUser = localStorage.getItem('username') === this.user ? true : false;
        this.getVideos();
		this.voteCheck();
    };
    getVideos(){
		let headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
        headersInit.append('user', this.user);
		headersInit.append('offset', offset);
		headersInit.append('order', this.optionValues);
		headersInit.append('time', this.timeValues);
		headersInit.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/videos`,{headers: headersInit}).subscribe(data => {
			if(data.json().success){
				this.totalCount = data.json().posts.length;
				this.videos = data.json().posts;
				this.setIds();
				this.offset = this.offset ? this.offset : data.json().offset;
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				},150)
			} 
			else if(data.json().status === 404){
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				},150)
			} else {
				this.error = true;
			}
		});
	}
	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		if(index > -1){
			this.videos[index].average_vote = vote;
			this.videos[index].user_voted = user_voted;
		}
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	setIds(){
		this.ids = [];
		for(let i =0; i < this.videos.length; i++){
			this.ids.push(this.videos[i].uuid);
		}
	}
    onOptionsChange(value) {
    	if(value === 'Newest' || value === 'Oldest'){
    		this.disabledTimeSelect = false;
    		$('#time').val('');
    		$('#time').prop('disabled', 'disabled');
    		$('#type').val('');
    		$('#type').prop('disabled', 'disabled');
    		this.disabledSelects = true;
    	} else if(value === 'Alphabetically'){
    		if(this.disabledSelects){
    			$('#type').prop('disabled', false); 
    			this.disabledSelects = false;
    		}
    		this.disabledTimeSelect = true;
    		$('#time').val('');
    		$('#time').prop('disabled', 'disabled');
    		this.types=['A-Z','Z-A'];
    		this.typeValues=['Ascending','Descending'];
    		setTimeout(()=>{$('#type').val('Ascending'); this.sortVideos.patchValue({type:'Ascending'}) },1);
    	} else if(this.disabledTimeSelect){
    		this.types=['Highest To Lowest','Lowest To Highest'];
    		this.typeValues=['Descending','Ascending'];
    		$('#type').val('')
    		$('#time').val('All Time');
    		$('#time').prop('disabled', false);
    		this.disabledTimeSelect = false;
    	} else if(this.disabledSelects) {
    		this.types=['Highest To Lowest','Lowest To Highest'];
    		this.typeValues=['Descending','Ascending'];
    		$('#time').prop('disabled', false); 
    		$('#time').val('All Time');
    		$('#type').prop('disabled', false); 
    		setTimeout(()=>{$('#type').val('Descending'); this.sortVideos.patchValue({type:'Descending'})},1);
    		this.disabledSelects = false;
    	}
	}

  	like(id, liked, type, value, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      if(data.json().success){
	      	let video = this.videos[index];
			video.user_liked = data.json().user_liked;
			video.likes_count = data.json().likes_count;
	        if(video.user_liked){
	            $(`#icon-likes-video-${id}`).addClass(' liked-icon fa-heart');
	            $(`#icon-likes-video-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-video-${id}`).addClass(' liked');
	            $(`#likes-video-${id}`).html(video.likes_count);
	        }
	        if(!video.user_liked){
	            $(`#icon-likes-video-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-video-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-video-${id}`).removeClass('liked');
	            $(`#likes-video-${id}`).html(video.likes_count);
                if(this.iscurrentUser){
                    setTimeout(()=>{
						if(!this.videos[index].user_liked){
							$(`#${id}-videos`).fadeOut(()=>{
								this.videos.splice(index,1);
							})
						}
                    },1500)
                }
	        }

	      }
	      if(data.json().status === 401){
	          this._modal.setModal('user', this.user, 'videos');
	      }
	    });
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
  	setVote(vote,id,type,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":"videos", "vote":vote, "already_voted":voted}
		  this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
	          this.voteChange(id,data.json().vote,data.json().user_vote)
			  this._voteService.change('videos',id,data.json().vote,data.json().user_vote);
	        }
	        if(data.json().status === 401){
	              this._modal.setModal('user', this.user, 'videos');
	          }
	      });
	      // upVoteSubscription.unsubscribe();
	}
	getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'user':this.user,'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
	      this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/videos/sort`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
	     		this.videos = data.json().posts;	
				this.setIds(); 
	     		this.offset = data.json().offset;
	     		this.setState();
	        }
	      });
	}
	getOffset(type,page){
		let data = [];
		switch(type){
			case 'start':
				data.push(0);
				data.push(1)
				break;
			case 'back':
				data.push((this.currentPage-2) * 20);
				data.push(this.currentPage - 1);
				break;
			case 'next':
				data.push((this.currentPage) * 20);
				data.push(this.currentPage + 1);
				break;
			case 'end':
				data.push((this.pages - 1) * 20);
				data.push(this.pages);
				break;
			case 'page':
				data.push((page - 1) * 20);
				data.push(page)
				break;
		}
		return data;
	}
	videoPlay(id){
		let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let body = {"id":id}
		this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/post/play`, body, {headers: headers}).subscribe(data => {
		});
	}
	changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'user':this.user,'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
	    this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/videos/paginate`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.videos = data.json().posts;
				this.setIds();
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];
	    		this.setState();
	    	}
	    });
	}
    displayAll(){
            $(`#loading-spinner-user-videos`).css({'display':'none'});
            $(`#videos-profile-container`).fadeIn();
    }
	setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
	    this._location.replaceState(`/user/${this.user}/videos${offsetString}${orderString}${timeString}${typeString}`)
	}
	photoHover(state,category,index){
	    if(state){
	      if((this.hovering && this.hoveringIndex === index && this.hoveringCategory === category) || (this.hovering && !this.hoveringCheck)){
	        $(`#play-button-home-videos-${this.hoveringCategory}-${this.hoveringIndex}`).attr("src","/assets/images/blackbutton.svg");
	        $(`#videos-artwork-home-${this.hoveringCategory}-${this.hoveringIndex}`).css({'opacity':0.6});
	      }
	      this.hovering = true;
	      this.hoveringCheck = true;
	      this.hoveringIndex = index;
	      this.hoveringCategory = category;
	      $(`#play-button-home-videos-${category}-${index}`).attr("src","/assets/images/orangebutton.svg");
	      $(`#videos-artwork-home-${category}-${index}`).css({'opacity':0.9});
	    }else{
	      this.hoveringCheck=false;
	      //allows cursor to move over play button without changing the image back
	      setTimeout(()=>{
	        if(!this.hoveringCheck){
	          $(`#play-button-home-videos-${category}-${index}`).attr("src","/assets/images/blackbutton.svg");
	           $(`#videos-artwork-home-${category}-${index}`).css({'opacity':0.6});
	          this.hovering = false;
	        }
	      },100)
	    }
	}
	photoClicked(index,id){
		if(this.videos[index].form){
			if(window.outerWidth > 700){
				this._vidService.change([this.videos[index].upload_url,1])
			} else {
				this.videos[index].clicked = true;
				this.initVideo(index,id);
			}
		} else {
			if(window.outerWidth > 700){
				this._vidService.change([this.videos[index].link,0,this.videos[index].link_type])
			} else {
				this.videos[index].clicked = true;
			}
		}
		this.videoPlay(this.videos[index].uuid)
	}
	initVideo(index,id,autoplay=true){
		setTimeout(()=>{  
				// if(this.videoJSplayer) this.videoJSplayer.dispose();
          if(!autoplay) $(`#home_video_${index}_${id}`).data('setup', '{"fluid":true, "playbackRates":[0.5,1,1.5,2], "autoplay":false}')
					let video = videojs(`home_video_${index}_${id}`, {}, function() {
           			 // This is functionally the same as the previous example.
					
                  let container = $(`#home_video_${index}_${id}`)
                  $(container).css({"visibility":"visible"});
                  let video_elem = $(container).find("video");
                  $(video_elem).css({"visibility":"visible"});
        			});
					video.requestFullscreen();
					this.videoJSplayer.push(video);
		},1)
	}
	searchArtist(artist){
		this._router.navigateByUrl(`/search?category=All&search=${artist}`);
	}
	marqueeToggle(type,id){
    	let textwidth = $(`#video-title-link-${id}`).width();
    	let item = $(`#video-title-link-${id}`).parent()
    	let parentwidth = item.width();
    	let scrolldistance = textwidth - parentwidth;
		let time;
		if(scrolldistance < 50){
			time = 300;
		} else if(scrolldistance < 150){
			time = 1500;
		} else if (scrolldistance < 350){
			time = 2500;
		} else if (scrolldistance < 450){
			time = 3500;
		} else {
			time = 4500;
		}
    	item.stop();
    	if(type === 1 && (textwidth > parentwidth)){
    		item.animate({scrollLeft:scrolldistance},time,'linear');
    	} else if (type === 0) {
    		item.animate({scrollLeft:0},'medium','swing');
    	}
    };
	ngOnDestroy(){
		$('.container').removeClass('extended-container');
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
		if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();});
	}
}
