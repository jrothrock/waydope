import { Component, OnInit, OnDestroy,ViewChild ,Compiler, ComponentRef, ComponentFactory, ViewChildren, QueryList, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http,Headers } from '@angular/http';
import {ModalComponent} from '../../modal/modal.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {CommentsComponent} from '../../comments/comments.component';
import {AdminGuard} from '../../../services/admin.guard.service';
import {SystemPostsModalComponent} from '../../system/posts/modal.component'
import {VoteService} from '../../../services/vote.service';
import {AdminPostsModalComponent} from '../../system/admin/admin.posts.modal.component'

declare var $;
declare var WaveSurfer;
declare var Materialize;
declare var _setMeta;
declare var Grade;

@Component({
  selector: 'music_post',
  templateUrl: 'music.post.component.html',
  entryComponents:[CommentsComponent],
  providers:[FormBuilder, AuthService, ModalComponent,SystemMessagesComponent]
})

export class MusicPostComponent implements OnInit {
	@ViewChild('comments', {read: ViewContainerRef}) viewContainerRef;
	advancedRating: FormGroup;
	simpleRating: FormGroup;
	reportForm: FormGroup;
	routerSubscription:any;
	subscription:any;
	likeSubscription:any;
	ratingSubscription:any;
	routeSubscription:any;
	reportSubscription:any;
	deleteSubscription:any;
	lockSubscription:any;
	watchVoteSubscription:any;
	downloadSubscription:any;
	removeSubscription:any;
	playSubscription:any;
	private commentsFactory: ComponentFactory<any>;
	id:any;
	user_liked:boolean=false;
	likes_count:number;
	post_type:string;
	post:any;
	title:string;
	artist:string;
	genre:string;
	link:string;
	created_at:string;
	average_rating:number;
	average_rating_count:number;
	submitted_by:string;
	description:string;
	marked:string;
	error:boolean;
	liked:boolean;
	songId:number;
	loaded:boolean;
	has_rated:boolean=false;
	ratingError:boolean=false;
	hasLyrics:boolean=false;
	rateOpen:boolean=false;
	average_vote:number;
	user_voted:number;
	upvotes:number;
	average_vote_width:number;
	downvotes:number;
	votes_count:number;
	current_average_rating:number=100;
	current_rating:number=0;
	totalRateWeight:number=0;
	lyricsFormValue:any=[];
	productionFormValue:any=[];
	originalityFormValue:any=[];
	whinynessFormValue:any=[];
	deduction:number;
	advancedForm:boolean=false;
	advancedStatisticsShow:boolean=false;
	averageSimplifiedRating:number;
	averageSimplifiedRatingCount:number;
	averageAdvancedRating:number;
	averageAdvancedRatingCount:number;
	averageLyricsRating:number;
	averageLyricsRatingCount:number;
	averageProductionRating:number;
	averageProductionRatingCount:number;
	averageOriginalityRating:number;
	averageOriginalityRatingCount:number;
	voteSubscription:any;
	form:number;
	song:any;
	wavesurfer:any;
	waveSurferPlay:boolean;
	equalizerShow:boolean=false;
	showReportForm:boolean=false;
	has_reported:boolean=false;
	username:string;
	showDeleteForm:boolean=false;
	hidden:boolean=false;
	genres:any;
	passedParams:boolean=false;
	math:any=Math;
	isAdmin:boolean;
	archived:boolean;
	locked:boolean;
	datanotify:any;
	eq:any;
	photo:string;
	upload_artwork_url:string;
	upload_artwork_url_nsfw:string;
	window:any=window;
	specific:string;
	worked:boolean=false;
	dataadmin:any;
	routed:boolean=false;
	route_time:any;
	flagged:boolean;
	nsfw:boolean=false;
	nsfw_ok:boolean=false;
	repeat:boolean=false;
	download_text:string;
	download_url:string;
	download_type:number;
	elapsed_time:any;
	downloading:boolean=false;
	playedAudio:boolean=false;
	showSocialsFlag:boolean=false;
	constructor(private _fb: FormBuilder, private _voteService : VoteService, private _backend: BackendService, private _admin: AdminGuard, private _modal:ModalComponent, private _sysMessages: SystemMessagesComponent, private _http: Http, private _route: ActivatedRoute, private _router: Router, private _auth: AuthService,
	componentFactoryResolver: ComponentFactoryResolver, compiler: Compiler){
		this.commentsFactory = componentFactoryResolver.resolveComponentFactory(CommentsComponent);
		this.routerSubscription = _router.events.subscribe(s => {
			if(s && s["state"] && this.loaded){
				let url_bits = s["url"].split('/');
				if(url_bits.length === 4 && url_bits[3] != this.id){
					this.genre = decodeURI(url_bits[2]);
					this.id = url_bits[3];
					$("#music-post-container").removeClass('active-post');
					if(this.waveSurferPlay) this.wavesurfer.pause()
					$("wave").remove();
					this.routed = true;
					this.route_time = new Date();
					$("#song-playing-time").css({'display':'none'});
					this.getMusicPost();
				}
			}
		})
	};
	
	ngOnInit(){
		this.username = localStorage.getItem('username') || '';
		this.advancedRating = this._fb.group({
		  'production': [null, Validators.required],
	      'originality': [null, Validators.required],
	      'lyrics': [null, this.hasLyricsCheck()],
	      'completeness': [null, Validators.required]
	    })
	    this.simpleRating = this._fb.group({
		  'rating': [null, Validators.required]
	    })
	    this.reportForm = this._fb.group({
	      'foul': [null, Validators.required]
	    })
		this.isAdmin = this._admin.isAdmin();
		this.routeSubscription = this._route.params.subscribe(params => {this.genre = params['genre']});
		this.routeSubscription = this._route.params.subscribe(params => {this.id = params['post']});
		this.routeSubscription = this._route.params.subscribe(params => {this.specific = params['comment']});
		this.getMusicPost();
		this.voteCheck();
		if(window.outerWidth < 451) $("#share-button-music-post").removeClass("horizontal btn-large").addClass("btn-medium");
	};
   getMusicPost(){
		let headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		let spinner, spinnerTimeout;
		spinnerTimeout = setTimeout(()=>{
			spinner = true;
			$("#loading-spinner-music-post").fadeIn();
		},300)
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/music/${this.genre}/${this.id}`,{headers: headersInit}).subscribe(data => {
			this.user_liked = data.json().song.user_liked;
			this.likes_count = data.json().song.likes_count;
			this.genre = data.json().song.main_genre;
			this.genres = data.json().song.genres;
			this.form = data.json().song.form;
			this.nsfw = data.json().song.nsfw;
			this.song = this.form ? data.json().song.upload_url : null;
			this.post_type = data.json().song.post_type;
			this.upload_artwork_url = data.json().song.upload_artwork_url;
			this.upload_artwork_url_nsfw = data.json().song.upload_artwork_url_nsfw;
			this.photo = this.upload_artwork_url_nsfw ? this.upload_artwork_url_nsfw : this.upload_artwork_url;
			this.songId = data.json().song.uuid;
			this.title = data.json().song.title;
			this.artist = data.json().song.artist;
			this.link = data.json().song.link;
			this.created_at = data.json().song.time_ago;
			this.average_rating = data.json().song.average_rating;
			this.user_voted = data.json().song.user_voted;
			this.average_rating_count = data.json().song.ratings_count;
			this.submitted_by = data.json().song.submitted_by;
			this.description = data.json().song.description;
			this.marked = data.json().song.marked;
			this.has_rated = data.json().song.user_rated;
			this.upvotes = data.json().song.upvotes;
			this.downvotes = data.json().song.downvotes;
			this.votes_count = data.json().song.votes_count;
			this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0 ;
			this.average_vote = data.json().song.average_vote;
			this.averageAdvancedRating = data.json().song.average_advanced_rating;
			this.averageAdvancedRatingCount = data.json().song.average_advanced_rating_count;
			this.averageSimplifiedRating = data.json().song.average_simplified_rating;
			this.averageSimplifiedRatingCount  = data.json().song.average_simplified_rating_count;
			this.averageLyricsRating = data.json().song.average_lyrics_rating;
			this.averageLyricsRatingCount = data.json().song.average_lyrics_rating_count;
			this.averageProductionRating = data.json().song.average_production_rating;
			this.averageProductionRatingCount = data.json().song.average_production_rating_count;
			this.averageOriginalityRating = data.json().song.average_originality_rating;
			this.averageOriginalityRatingCount = data.json().song.average_originality_rating_count;
			this.has_reported = data.json().song.user_flagged;
			this.hidden = data.json().song.hidden;
			this.locked = data.json().song.locked;
			this.archived = data.json().song.archived;
			this.worked = data.json().song.worked;
			this.flagged = data.json().song.flagged;
			this.download_type = data.json().song.download;
			this.download_text = data.json().song.download_text;
			this.download_url = data.json().song.download_url;
			let newTime;
			if(this.routed) this.post = ['reset'];
			if(this.routed) this.passedParams = false;
			if(this.routed) newTime = new Date();
			let time = this.routed && this.route_time && newTime && (newTime - this.route_time < 250)  ? (250 - (newTime - this.route_time)) : 50; 
			this.routed = false;
			this.loaded = true;
			if(spinnerTimeout) clearTimeout(spinnerTimeout)
			setTimeout(()=>{
				if(data.json().song.colors && data.json().song.worked && data.json().song.form){
					$("#song-container").attr('style',`background:${data.json().song.colors[0]};background:linear-gradient(to right, ${data.json().song.colors[0]}, ${data.json().song.colors[1]}); -moz-linear-gradient(right, ${data.json().song.colors[0]}, ${data.json().song.colors[1]});-o-linear-gradient(right, ${data.json().song.colors[0]}, ${data.json().song.colors[1]});-webkit-linear-gradient(left, ${data.json().song.colors[0]} , ${data.json().song.colors[1]});`)
					if(window.outerWidth > 600){
						$("#song-playing-time").attr('style',`background:${data.json().song.colors[0]};background:linear-gradient(to right, ${data.json().song.colors[0]}, ${data.json().song.colors[1]}); -moz-linear-gradient(right, ${data.json().song.colors[0]}, ${data.json().song.colors[1]});-o-linear-gradient(right, ${data.json().song.colors[0]}, ${data.json().song.colors[1]});-webkit-linear-gradient(left, ${data.json().song.colors[0]} , ${data.json().song.colors[1]});width:${$("#song-container").width()}px;left:${$("#song-container").offset().left - $("#waveform").offset().left}px;position:absolute;font-size:0.9em;color:white;top:-20px;font-size:0.9em;display:none;clip:rect(0px,${$("#song-volumne-post").offset().left - $("#song-container").offset().left + 60}px,20px,0px)`)
						$("#time-container").attr('style',`position:relative;left:${$("#song-volumne-post").offset().left - $("#song-container").offset().left}px`)
					}
				}
				if(this.form && this.worked) this.createWave();
				if(spinner) $("#loading-spinner-music-post").css({'display':'none'}); $("#music-post-container").addClass('active-post'); 
				$("#music-post-container").addClass('active-post');
				this.checkDescription();
				if(this.specific) {
					this.post = ['music',this.songId,this.genre,this.specific];
					this.passedParams = true;
					setTimeout(()=>{
						$(".view-all-comments").get(0).scrollIntoView(true);
					},5)
				}
				else this.watchScroll();
				_setMeta.setPost(data.json().song.title,`${data.json().song.description.substring(0,30)}...`,'music',data.json().song.main_genre,null,data.json().song.artist)

				$("#cover-artwork").attr({'width':"100%",'height':"100%"})
				$("#loading-song-container").css({'display':'none'});
				$("#song-container").fadeIn();
				// uncommenting this bind will cause the the gradient to change colors
				// when comeone clicks the nsfw button. This may be a desired affect in the future
				$('#cover-artwork').unbind('load');
			},time)
		}, error=>{
			if(error.status === 404) {
				this._sysMessages.setMessages('noSong');
				this._router.navigateByUrl('/music',{ replaceUrl: true });
			} else if(error.status === 410){
				this._sysMessages.setMessages('removedPost');
				this._router.navigateByUrl('/music', { replaceUrl: true });
			} else {
				this.error = true;
			}
		})
   }
   voteCheck(){
      this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
        if(value.length){
         this.voteChange(value[0],value[1],value[2]);
        }
      });
    }
   voteChange(id,vote,user_voted){
      if(id === this.songId){
        this.average_vote = vote;
        this.user_voted = user_voted;
      }
    }
   watchScroll(){
	let component = this;
      $(window).scroll(function(){
	     if(!component.passedParams){
			if ($('.comments') && $(this).scrollTop() > ($('.comments').offset().top - 500)) {
				if(!component.passedParams){component.post = ['music',component.songId,component.genre,null,component.specific]; }//this is passed to the comments component;
				component.passedParams = true;
			}
	     }
	  });
	}
  checkVolume(type,click){
	if(type && !click){
		$(`#volume-range-post`).on("change mousemove", ()=> {
			this.wavesurfer.setVolume(parseInt($(`#volume-range-post`).val())/100)
		});
	 } else if(!click) {
		$(`#volume-range-post`).unbind("change mousemove");
	 } else {
		 this.wavesurfer.setVolume(parseInt($(`#volume-range-post`).val())/100)
	 }
   }
  	// download(category,id){	
    //   let link= $(`#song-download-link`)
    //   link.click();
	// }
	loop(id,category){
    let index = $(`#song-post`).data('place');
    let loop = $(`#song-repeat-post`).data('loop')
    if(!loop){
      this.wavesurfer.un('finish');
      this.wavesurfer.on('finish',()=>{
          this.wavesurfer.playPause()
		  this.waveSurferPlay = true;
		  setTimeout(()=>{
			$(`#play-icon`).removeClass('fa-play').addClass('fa-pause');
		  },1)
      });
      $(`#song-repeat-post`).addClass('active');
      let loop = $(`#song-repeat-post`).data('loop',1)
	  this.repeat = true;
    } else {
      this.wavesurfer.un('finish');
      $(`#song-repeat-post`).removeClass('active');
      let loop = $(`#song-repeat-post`).data('loop',0)
	  this.repeat = false;
      this.wavesurfer.on('finish', ()=>{
          $(`#song-post`).data('value',0);
          $(`#play-icon`).removeClass('fa-pause').addClass('fa-play');
          this.waveSurferPlay = false;
      });
    }
  }
	toggleNSFW(){
		this.nsfw_ok = !this.nsfw_ok;
		if(this.nsfw_ok) this.photo = this.upload_artwork_url;
		else this.photo = this.upload_artwork_url_nsfw;
	}
	createWave(){
		let height = window.outerWidth > 600 ? 110 : 45
		setTimeout(()=>{
			this.wavesurfer = WaveSurfer.create({
			container: `#waveform`,
			waveColor: '#eeeeee',
	        progressColor: '#ff6100',
			height:height,
			barWidth: 2,
			normalize:true,
		    });
			this.wavesurfer.load(`${this.song}`);
			this.wavesurfer.on('ready', ()=>{
				let time = this.wavesurfer.getDuration()
				let minutes = Math.floor(time / 60)
				let seconds = Math.floor(time % 60)
				$("#duration").text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
				$("#song-playing-time").css({'display':'block'})
			})
		},200)
	}
	playAudio(){
		if(!this.waveSurferPlay){
			$(`#play-icon`).removeClass('fa-play').addClass('fa-pause');
			this.waveSurferPlay = true;
			if(!this.playedAudio) this.songPlay();
		}
    	this.wavesurfer.playPause()
    	this.wavesurfer.on('pause', ()=> {
			$(`#play-icon`).removeClass('fa-pause').addClass('fa-play');
    		this.waveSurferPlay = false;
		});
		this.wavesurfer.on('play', ()=> {
			$(`#play-icon`).removeClass('fa-play').addClass('fa-pause');
    		this.waveSurferPlay = true;
		});
		this.wavesurfer.on('finish', ()=>{
			this.waveSurferPlay = false;
			if(!this.repeat) $(`#play-icon`).removeClass('fa-pause').addClass('fa-play');
		})
		this.wavesurfer.on('audioprocess', (data)=>{
			// this will help cut back on the cpu usage a little
			if(Math.floor(data) != this.elapsed_time){
				this.elapsed_time = Math.floor(data);
				let minutes = Math.floor(data / 60)
				let seconds = Math.floor(data % 60)
				$("#current-time").text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds }`);
			}
		})
 	}
	like(id,value,genre,type){
	    let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.songId, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      if(data.json().success){  
	      	this.likes_count = data.json().likes_count;    
	        if(!data.json().user_liked){
	        	$(`#icon-likes-${id}`).addClass(' liked-icon');
	        	$(`#likes-button-${id}`).addClass(' liked');
	        }
	        else if(data.json().user_liked){
	        	$(`#icon-likes-${id}`).removeClass('likes-icon');
	        	$(`#likes-button-${id}`).removeClass('liked');
	        }
	        this.user_liked = !this.user_liked;

	      }
	      else if(data.json().status === 401){
	          this._modal.setModal('music', this.genre, this.id);
	      } else if (data.json().locked){
				this.datanotify=[this.songId,'music','locked'];
		  } else if(data.json().archived){
				this.datanotify=[this.songId,'music','archived'];
		  } else if(data.json().flagged){
				this.datanotify=[this.songId,'music','flagged'];
			}
	    });
	}

	showSocials(){
		if(this.showSocialsFlag){
			$(".hidden-socials").fadeOut(175,()=>{
				$("#show-socials-icon").css({'transform':'rotate(0deg)'})
				$(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '-96px' : '9px'} !important`)
			});
		} else {
			$("#show-socials-icon").css({'transform':'rotate(180deg)'})
			$(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '86px' : '9px'} !important`)
			$(".hidden-socials").fadeIn();

		}
		this.showSocialsFlag = !this.showSocialsFlag;
	}
	download(){
		if(!this.downloading){
			let headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {"song":this.songId}
			this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${this.genre}/${this.id}/download`, body, {headers: headers}).subscribe(data => {	
				// (<any>window).location = data.json().url;
				if(this.download_type === 1){
					let tag = document.createElement('a');
					tag.setAttribute('href', data.json().url);
					tag.setAttribute('target', "_blank");
					tag.setAttribute('download', this.title);
					tag.click();
				}
				this.downloading = false;
			}, error =>{

			});
		}
	}
	submitRating(value,type,rate_type){
		let body;

		if(value.rating === null && rate_type === 'simple'){
			Materialize.toast("Rating value is required", 3000, 'rounded-failure')
			return false;
		} else if(rate_type === 'advanced' && (!value.production || !value.originality || !this.current_average_rating)){
			Materialize.toast("Production and originality values are required", 3000, 'rounded-failure')
			return false;
		}
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    if(!this.advancedForm){
	    	body = {"id":this.songId, "simpleRating" : parseInt(value.rating), "type" : type, "advancedRating":null}
	    } else {
	    	if(this.hasLyrics){
	    		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"lyrics":parseInt(value.lyrics),"production":parseInt(value.production),"originality":parseInt(value.originality)}
	    	} else if (this.hasLyrics) {
	    		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"lyrics":parseInt(value.lyrics),"production":parseInt(value.production),"originality":parseInt(value.originality)}
	    	} else if (!this.hasLyrics){
	    		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"lyrics":null,"production":parseInt(value.production),"originality":parseInt(value.originality)}
	    	} else {
	    		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"lyrics":null,"production":parseInt(value.production),"originality":parseInt(value.originality)}
	    	}
	    }
		this.ratingSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/ratings`, body, {headers: headers}).subscribe(data => {
	    		this.rateOpen = false;
	    		this.has_rated = true;
	    		this.average_rating = data.json().average_rating;
	    		this.average_rating_count = data.json().average_rating_count;
	    		this.averageSimplifiedRating = data.json().average_simplified_rating;
	    		this.averageSimplifiedRatingCount = data.json().average_simplified_rating_count;
	    		this.averageAdvancedRating = data.json().average_advanced_rating;
	    		this.averageAdvancedRatingCount = data.json().average_advanced_rating_count;
	    		this.averageLyricsRating = data.json().average_lyrics_rating;
	    		this.averageLyricsRatingCount = data.json().average_lyrics_rating_count;
	    		this.averageProductionRating = data.json().average_production_rating;
	    		this.averageProductionRatingCount = data.json().average_production_rating_count;
	    		this.averageOriginalityRating = data.json().average_originality_rating;
	    		this.averageOriginalityRatingCount = data.json().average_originality_rating_count;
	    }, error =>{
			if(error.status === 401){
         		 this._modal.setModal('music', this.genre, this.id);
       		} else if (error.json().locked){
				this.datanotify=[this.songId,'music','locked'];
			} else if(error.json().archived){
				this.datanotify=[this.songId,'music','archived'];
			}  else if(error.json().poor_rating){
				Materialize.toast("It can't be that bad...", 3000, 'rounded-failure')
			} else if(error.json().flagged){
				this.datanotify=[this.songId,'music','flagged'];
			}
		})
	}
	searchArtist(artist){
    	this._router.navigateByUrl(`/search?category=All&search=${artist}`);
  	}
	songPlay(){
		this.playedAudio = true;
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.songId}
	    this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/song/play`, body, {headers: headers}).subscribe(data => {
		});
	}
	watchDescription(){
		$('#show-full-description').click(()=>{
			let isOpen = $('#post-description').data('open');
			if(!isOpen){
				$('#post-description').css({'max-height':'none'});
				$('#show-full-description').text('Show Less');
				$('#show-full-description').addClass('active');
				$('#fadeout').css({'display':'none'});
				$('#post-description').data('open',true);
			} else {
				$('#post-description').css({'max-height':'125px'});
				$('#show-full-description').text('Show More');
				$('#show-full-description').removeClass('active');
				$('#fadeout').css({'display':'block'});
				$('#post-description').data('open',false);
			}
		})
	}
	checkDescription(){
		if($('#post-description').css('height') === '125px'){
			$('#fadeout').css({'display':'block'});
			$('.post-description-container').append(`<button class='btn description-btn' id='show-full-description'>Show More <i></i></button>`)
            this.watchDescription();
		}
	}
	editSong(){
		this._router.navigateByUrl(`/music/edit?type=${this.form}&title=${this.title}&artist=${this.artist}&genre=${this.genre}&id=${this.id}`);
	}
	toggleReportForm(){
		this.advancedStatisticsShow = false;
		this.equalizerShow = false;
		this.rateOpen = false;
		this.showReportForm = !this.showReportForm;
	}
	submitReport(values){
		 var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":this.songId, "type":"music", "foul":values.foul}
	    this.reportSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/report/`, body, {headers: headers}).subscribe(data => {
	    	this.has_reported = true;
	    })
	}
	setVote(vote){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":this.songId, "type":"music", "vote":vote}
	    this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			  let change;
			  if(vote === 1 && this.user_voted) change = this.user_voted === 1 ? -1 : 2;
			  else if(vote === 1 && !this.user_voted) change = 1;
			  else if(vote === -1 && this.user_voted) change = this.user_voted === -1 ? +1 : -2;
			  else if(vote === -1 && !this.user_voted) change = -1;
	          this.voteChange(this.songId,this.average_vote+change,data.json().user_vote)
			  this._voteService.change('music',this.songId,this.average_vote+change,data.json().user_vote);
	          this.upvotes = data.json().upvotes;
			  this.downvotes = data.json().downvotes;
		 	  this.votes_count = data.json().votes_count;
			  this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
		},error =>{
			if(error.status === 401){
	              this._modal.setModal('music', this.genre, this.id);
	        } else if (error.json().locked){
				this.datanotify=[this.songId,'music','locked'];
			} else if(error.json().archived){
				this.datanotify=[this.songId,'music','archived'];
			} else if(error.json().flagged){
				this.datanotify=[this.songId,'music','flagged'];
			}
		});
	}
	toggleDeleteForm(){
		this.showDeleteForm = !this.showDeleteForm;
	}
	lockInit(){
      this.datanotify=[this.songId,'music','check','lock'];
    }
	removeInit(){
		this.datanotify=[this.songId,'music','check','remove'];
	}
	adminInit(){
	  this.dataadmin=[this.songId,this.post_type,this.genre,null];
	}
	removePost(event){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.songId,"type":'music'}
		this.removeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/remove`, body, {headers: headers}).subscribe(data => {
            this.locked = true;
			Materialize.toast("<i class='fa fa-close'></i> Post Successfully Removed", 3000, 'rounded-success')
      });
	}
    lockPost(event){
       let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.songId,"type":'music'}
		this.lockSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/lock`, body, {headers: headers}).subscribe(data => {
			this.locked = true;
			Materialize.toast("<i class='fa fa-lock'></i> Post Successfully Locked", 3000, 'rounded-success')
      });
    }
	deleteSong(){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.deleteSubscription = this._http.delete(`${this._backend.SERVER_URL}/api/v1/music/${this.genre}/${this.id}`, {headers: headers}).subscribe(data => {
			this._sysMessages.setMessages('deleteSong');
			this._router.navigateByUrl(`/music`);
		}, error=>{
			if(error.status === 401){
	              this._modal.setModal('music', this.genre, this.id);
	        }
		});
  	}
	updateRating(val,weight,type){
		let value = val ? parseInt(val) : null;
		let check;

		switch(type){
	        case 'lyrics':
	        	check = this.lyricsFormValue;
	        	break;
	        case 'production':
	        	check = this.productionFormValue;
	        	break;
	        case 'originality':
	        	check = this.originalityFormValue;
	        	break;
	        case 'whinyness':
	        	check = this.whinynessFormValue;
	        	break;
        }
		if(value != null && !check.length){
			check.push(value);
			this.totalRateWeight += weight;
			this.current_rating += (value*weight)
			this.current_average_rating = Math.round(this.current_rating / this.totalRateWeight);
			if(this.current_average_rating < 0){
				this.current_average_rating = 0;
			}
		} else if (check.length && check[0] != value ){
			this.current_rating -= (check[0]*weight);
			check[0] = value;
			this.current_rating += (value*weight);
			this.current_average_rating = Math.round(this.current_rating / this.totalRateWeight);
			if(this.current_average_rating < 0){
				this.current_average_rating = 0;
			}
		} 
	}
	hasLyricsCheck(){

	}
	toggleRateForm(){
		this.equalizerShow = false;
		this.rateOpen =!this.rateOpen;
		this.showReportForm = false;
	}
	toggleAdvancedForm(){
		this.advancedForm = !this.advancedForm;
	}
	showAdvancedStatistics(){
		this.equalizerShow = false;
		this.advancedStatisticsShow = !this.advancedStatisticsShow;
		this.showReportForm = false;
	}
	checkLyrics(){
		if(this.hasLyrics){
			if(this.lyricsFormValue.length){
				this.totalRateWeight -= 2;
				this.current_rating -= (this.lyricsFormValue[0]*2)
				this.current_average_rating = Math.round(this.current_rating / this.totalRateWeight);
			}
		} else {
			if(this.lyricsFormValue.length){
				this.totalRateWeight += 2;
				this.current_rating += (this.lyricsFormValue[0]*2)
				this.current_average_rating = Math.round(this.current_rating / this.totalRateWeight);
			}
		}
	}
	equalizerToggle(){
		this.showReportForm = false;
		this.advancedStatisticsShow = false;
		this.rateOpen = false;
		this.equalizerShow = !this.equalizerShow;
		setTimeout(()=>{
			if(this.equalizerShow) this.addEqualizer();
		},200)
	}
	updateEqualizer(){

	}
	addEqualizer(){
		  this.eq = [
		    {
		      f: 32,
		      type: 'lowshelf'
		    }, {
		      f: 64,
		      type: 'peaking'
		    }, {
		      f: 125,
		      type: 'peaking'
		    }, {
		      f: 250,
		      type: 'peaking'
		    }, {
		      f: 500,
		      type: 'peaking'
		    }, {
		      f: 1000,
		      type: 'peaking'
		    }, {
		      f: 2000,
		      type: 'peaking'
		    }, {
		      f: 4000,
		      type: 'peaking'
		    }, {
		      f: 8000,
		      type: 'peaking'
		    }, {
		      f: 16000,
		      type: 'highshelf'
		    }
		  ];

		  // Create filters
		  var filters = this.eq.map((band)=> {
		    var filter = this.wavesurfer.backend.ac.createBiquadFilter();
		    filter.type = band.type;
		    filter.gain.value = 0;
		    filter.Q.value = 1;
		    filter.frequency.value = band.f;
		    return filter;
		  });

		  // Connect filters to wavesurfer
		  this.wavesurfer.backend.setFilters(filters);

		  // Bind filters to vertical range sliders
		  var container = document.querySelector('#equalizer');
		  filters.forEach((filter)=> {
		    var input = document.createElement('input');
		    this.wavesurfer.util.extend(input, {
		      type: 'range',
		      min: -40,
		      max: 40,
		      value: 0,
		      title: filter.frequency.value
		    });
		    input.style.marginLeft = '2%';
		    input.style.display = 'inline-block';
		    input.setAttribute('orient', 'vertical');
		    this.wavesurfer.drawer.style(input, {
		      'webkitAppearance': 'slider-vertical',
		      width: '50px',
		      height: '150px'
		    });
		    container.appendChild(input);

		    var onChange = function (e) {
		      filter.gain.value = ~~e.target.value;
		    };

		    input.addEventListener('input', onChange);
		    input.addEventListener('change', onChange);
		  });

		  // For debugging
		  this.wavesurfer.filters = filters;
	}
	eqButton(type){
		let event = new Event('change');
		if(type === 'bass'){
			$('#equalizer').find("input").each(function(index,input){
				if(index === 0){
					$(input).get(0).value = 16; $(input).get(0).dispatchEvent(event)
				} else if(index === 1) {
					$(input).get(0).value = 9; $(input).get(0).dispatchEvent(event)
				} else if(index === 2){
					$(input).get(0).value = 5; $(input).get(0).dispatchEvent(event)
				}
			})
		} else if(type === 'reset'){
			// headphone warning, you will probably die.
			$('#equalizer').find("input").each(function(index,input){$(input).get(0).value = 0; $(input).get(0).dispatchEvent(event)})
		}
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	encode(string){
		return encodeURIComponent(string);
	}
	ngOnDestroy() {
	    // prevent memory leak when component destroyed
		this.passedParams = true; // if this isn't done, the watchScroll will error as it won't be able to find the comment class in the view.
		$("#cover-artwork").unbind();
	    if(this.subscription) this.subscription.unsubscribe();
	    if(this.voteSubscription) this.voteSubscription.unsubscribe();
	    if(this.likeSubscription) this.likeSubscription.unsubscribe();
	    if(this.ratingSubscription) this.ratingSubscription.unsubscribe();
	    if(this.routeSubscription) this.routeSubscription.unsubscribe();
	    if(this.reportSubscription) this.reportSubscription.unsubscribe();
		if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
		if(this.lockSubscription) this.lockSubscription.unsubscribe();
		if(this.routerSubscription) this.routerSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
		if(this.removeSubscription) this.removeSubscription.unsubscribe();
	    if(this.waveSurferPlay) this.wavesurfer.pause()
		if(this.playSubscription) this.playSubscription.unsubscribe();
    }
}
