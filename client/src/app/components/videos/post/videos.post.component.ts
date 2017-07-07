import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AdminGuard} from '../../../services/admin.guard.service';
import {SystemPostsModalComponent} from '../../system/posts/modal.component'
import {VoteService} from '../../../services/vote.service';
import {AdminPostsModalComponent} from '../../system/admin/admin.posts.modal.component'
import {CommentsComponent} from '../../comments/comments.component';

declare var $;
declare var videojs;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'videos_post',
  templateUrl: 'videos.post.component.html',
  providers: [FormBuilder,ModalComponent,SystemMessagesComponent],
  entryComponents:[CommentsComponent]
})

export class VideosPostComponent implements OnInit {
	advancedRating:FormGroup;
	simpleRating:FormGroup;
	reportForm:FormGroup;
	subscription:any;
	likeSubscription:any;
	ratingSubscription:any;
	routeSubscription:any;
	reportSubscription:any;
	voteSubscription:any;
	deleteSubscription:any;
	lockSubscription:any;
	routerSubscription:any;
	watchVoteSubscription:any;
	removeSubscription:any;
	playSubscription:any;
	id:any;
	isLoggedIn:boolean=false;
	post:any;
	category:string;
	title:string;
	created_at:string;
	submitted_by:string;
	link:any;
	link_type:number;
	description:string;
	marked:string;
	likes_count:number;
	user_liked:boolean;
	user_voted:number;
	average_vote:number;
	post_type:string;
	loaded:boolean;
	average_rating:number;
	average_rating_count:number;
	advancedStatisticsShow:boolean=false;
	rateOpen:boolean=false;
	advancedForm:boolean=false;
	has_rated:boolean;
	ratingError:boolean=false;
	upvotes:number;
	average_vote_width:number;
	downvotes:number;
	votes_count:number;
	showReportForm:boolean=false;
	has_reported:boolean=false;
	username:string;
	showDeleteForm:boolean=false;
	videoId:number;
	form:number;
	videoJSplayer:any;
	hidden:boolean;
	categories:any;
	passedParams:boolean=false;
	math:any=Math;
	isAdmin:boolean;
	locked:boolean;
	archived:boolean;
	datanotify:any;
	window:any=window;
	specific:string; // uid of comment that is being viewed.
	dataadmin:any;
	worked:boolean=false;
	routed:boolean=false;
	route_time:any;
	flagged:boolean=false;
	nsfw:boolean=false;
	nsfw_ok:boolean=false;
	playedVideo:boolean=false;
	showSocialsFlag:boolean=false;
	constructor(private _auth: AuthService, private _voteService :VoteService, private _backend: BackendService, private _admin: AdminGuard, private _fb:FormBuilder, private _route: ActivatedRoute, private _http: Http, private _modal: ModalComponent, private _sysMessages:SystemMessagesComponent, private _router:Router){
		this.routerSubscription = _router.events.subscribe(s => {
			if(s && s["state"] && this.loaded){
				let url_bits = s["url"].split('/');
				if(url_bits.length === 4 && url_bits[3] != this.id){
					this.category = decodeURI(url_bits[2]);
					this.id = url_bits[3];
					$("#videos-post-container").removeClass('active-post');
					try {
						if(this.loaded && this.form && this.worked && this.videoJSplayer) this.videoJSplayer.dispose()
					}
					catch(err) {
						console.warn(`videoJs failed to dispose, this error has been caught`);
						console.error(`error: ${err}`);
					}
					this.worked = false;
					this.form = 0;
					this.routed = true;
					this.route_time = new Date();
					this.getVideoPost();
				}
			}
		})
	};
	ngOnInit(){
		// this.advancedRating = this._fb.group({
		//   'production': [null, Validators.required],
	 //      'originality': [null, Validators.required],
	 //      'message': [null, this.hasLyricsCheck()],
	 //      'completeness': [null, Validators.required],
	 //      'whinyness': [null,this.hasWhineCheck()]
	 //    })
	 	this.username = localStorage.getItem('username') || '';
	    this.simpleRating = this._fb.group({
		  'rating': [null, Validators.required],
	    })
	    this.reportForm = this._fb.group({
	      'foul': [null, Validators.required]
	    })
		this.isAdmin = this._admin.isAdmin();
		this.routeSubscription = this._route.params.subscribe(params => {this.category = params['category']});
		this.routeSubscription = this._route.params.subscribe(params => {this.id = params['post']});
		this.routeSubscription = this._route.params.subscribe(params => {this.specific = params['comment']});
		this.getVideoPost();
		this.voteCheck();
		if(window.outerWidth < 451) $("#share-button-videos-post").removeClass("horizontal btn-large").addClass("btn-medium");
	};
	voteCheck(){
      this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
        if(value.length){
         this.voteChange(value[0],value[1],value[2]);
        }
      });
    }
   voteChange(id,vote,user_voted){
      if(id === this.videoId){
        this.average_vote = vote;
        this.user_voted = user_voted;
      }
    }
	getVideoPost(){
		var headersInit = new Headers();
		headersInit.append('id', this.id);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('Category', this.category)
		let spinner, spinnerTimeout;
		spinnerTimeout = setTimeout(()=>{
			spinner = true;
			$("#loading-spinner-videos-post").fadeIn();
		},300)
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/${this.category}/${this.post}`,{headers: headersInit}).subscribe(data => {
			this.title = data.json().video.title;
			this.created_at = data.json().video.created_at;
			this.videoId = data.json().video.uuid;
			this.form = data.json().video.form;
			this.submitted_by = data.json().video.submitted_by;
			this.link = this.form ? data.json().video.upload_url : data.json().video.post_link;
			this.description = data.json().video.description;
			this.marked = data.json().video.marked;
			this.likes_count = data.json().video.likes_count;
			this.link_type = data.json().video.link_type;
			this.user_liked = data.json().video.user_liked;
			this.category = data.json().video.main_category;
			this.user_voted = data.json().video.user_voted;
			this.average_vote = data.json().video.average_vote;
			this.post_type = data.json().video.post_type;
			this.average_rating = data.json().video.average_rating;
			this.average_rating_count = data.json().video.ratings_count;
			this.upvotes = data.json().video.upvotes;
			this.downvotes = data.json().video.downvotes;
			this.votes_count = data.json().video.votes_count;
			this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
			this.has_reported = data.json().video.user_flagged;
			this.hidden = data.json().video.hidden;
			this.categories = data.json().video.categories;
			this.loaded = true;
			this.locked = data.json().video.locked;
			this.archived = data.json().video.archived;
			this.worked = data.json().video.worked;
			this.nsfw = data.json().video.nsfw;
			this.has_rated = data.json().video.user_rated;
			let newTime;
			if(this.routed) this.post = ['reset'];
			if(this.routed) this.passedParams = false;
			if(this.routed) newTime = new Date();
			let time = this.routed && this.route_time && newTime && (newTime - this.route_time < 250)  ? (250 - (newTime - this.route_time)) : 50; 
			this.routed = false;
			this.flagged = data.json().video.flagged;
			//this settimeout is required to find the div that is initially not there - due to being changed in this.form above.
			//changing the above so that when there is form will do ajax to do this may be better than unhides.
			if(spinnerTimeout) clearTimeout(spinnerTimeout);
			setTimeout(()=>{  
				if(spinner) $("#loading-spinner-videos-post").css({'display':'none'}); $("#videos-post-container").addClass('active-post');
				$("#videos-post-container").addClass('active-post');
				if(this.form && this.worked){
					this.videoJSplayer = videojs('post_video_1', {}, function() {
					// This is functionally the same as the previous example.
					});
				}
				this.checkDescription();
				if(this.specific) {
					this.post = ['videos',this.videoId,this.category,this.specific]; //this is passed to the comments component;
					this.passedParams = true;
					setTimeout(()=>{
					$(".view-all-comments").get(0).scrollIntoView(true);
					},5)
				}
				else this.watchScroll();
				_setMeta.setPost(data.json().video.title,`${data.json().video.description ? data.json().video.description.substring(0,30) : data.json().video.title}...`,'videos',data.json().video.main_category, null)
				this.videoPlay();
			},time)
		},error=>{
			if(error.status === 404) {
				this._sysMessages.setMessages('noVideo');
				this._router.navigateByUrl('/videos',{ replaceUrl: true });
			} else if(error.status=== 410){
				this._sysMessages.setMessages('removedPost');
				this._router.navigateByUrl('/videos',{ replaceUrl: true });
			} else {
				// this.error = true;
			}
		});
	}
    watchScroll(){
	  let component = this;
      $(window).scroll(function(){
	     if(!component.passedParams){
			if ($('.comments') && $(this).scrollTop() > ($('.comments').offset().top - 500)) {
				if(!component.passedParams){component.post = ['videos',component.videoId,component.category,null,component.specific]; }//this is passed to the comments component;
				component.passedParams = true;
			}
	     }
	  });
	}
	lockInit(){
      this.datanotify=[this.videoId,'videos','check','lock'];
    }
	removeInit(){
		this.datanotify=[this.videoId,'videos','check','remove'];
	}
	adminInit(comment,admin){
		this.dataadmin=[this.videoId,this.post_type,this.category,null];
	}
    lockPost(event){
       let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.videoId,"type":'videos'}
	    this.lockSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/lock`, body, {headers: headers}).subscribe(data => {
			this.locked = true;
			Materialize.toast("<i class='fa fa-lock'></i> Post Successfully Locked", 3000, 'rounded-success')
      });
    }
	removePost(event){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.videoId,"type":'videos'}
		this.removeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/remove`, body, {headers: headers}).subscribe(data => {
            this.locked = true;
			Materialize.toast("<i class='fa fa-close'></i> Post Successfully Removed", 3000, 'rounded-success')
      });
	}
	setVote(vote){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":this.videoId, "type":"videos", "vote":vote}
		  this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
				this.voteChange(this.videoId,data.json().vote,data.json().user_vote)
			  	this._voteService.change('videos',this.videoId,data.json().vote,data.json().user_vote);
	          	this.upvotes = data.json().upvotes;
				this.downvotes = data.json().downvotes;
				this.votes_count = data.json().votes_count;
				this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
	      }, error =>{
			if(error.status === 401){
	            this._modal.setModal();
	        }  else if (error.locked){
				this.datanotify=[this.videoId,'videos','locked'];
			} else if(error.archived){
				this.datanotify=[this.videoId,'videos','archived'];
			} else if(error.flagged){
				this.datanotify=[this.videoId,'videos','flagged'];
			}
		  });
	      // upVoteSubscription.unsubscribe();
	}
	videoPlay(){
		$(".vjs-big-play-button").on('click', ()=>{
			if(!this.playedVideo){
				this.playedVideo = true;
				let headers = new Headers({
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
				});
				let body = {}
				this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/${this.category}/${this.id}/play`, body, {headers: headers}).subscribe(data => {
				});
			}
		})
	}
	showSocials(){
		if(this.showSocialsFlag){
			$(".hidden-socials").fadeOut(175,()=>{
				$("#show-socials-icon").css({'transform':'rotate(0deg)'})
				$(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '-96px' : '9px'} !important`)
			});
		} else {
			$("#show-socials-icon").css({'transform':'rotate(180deg)'})
			$(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '65px' : '9px'} !important`)
			$(".hidden-socials").fadeIn();

		}
		this.showSocialsFlag = !this.showSocialsFlag;
	}
	submitRating(value,type){
		let body;
		if(value.rating === null){
			Materialize.toast("Rating value is required", 3000, 'rounded-failure')
			return false;
		}
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    body = {"id":this.videoId, "simpleRating" : parseInt(value.rating), "type" : type, "advancedRating":null}
	    this.ratingSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/ratings`, body, {headers: headers}).subscribe(data => {
			this.rateOpen = false;
			this.has_rated = true;
			this.average_rating = data.json().average_rating;
			this.average_rating_count = data.json().average_rating_count;
		}, error =>{
			if(error.status === 401){
         		 this._modal.setModal();
       		}  else if (error.locked){
				this.datanotify=[this.videoId,'videos','locked'];
			} else if(error.archived){
				this.datanotify=[this.videoId,'videos','archived'];
			} else if(error.poor_rating){
				Materialize.toast("<i class='fa fa-lock'></i> It can't be that bad...", 3000, 'rounded-failure')
			} else if(error.flagged){
				this.datanotify=[this.videoId,'videos','flagged'];
			}
		})
	}
	editVideo(){
		this._router.navigateByUrl(`/videos/edit?type=${this.form}&title=${this.title}&category=${this.category}&id=${this.id}`);
	}
	toggleDeleteForm(){
		this.showDeleteForm = !this.showDeleteForm;
	}
	deleteVideo(){
		var headers = new Headers();
		var creds = {"video": this.videoId, "upload":true}
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/delete`, creds, {headers: headers}).subscribe(data => {
			this._sysMessages.setMessages('deleteVideo');
			this._router.navigateByUrl(`/videos`);
		},error =>{
			if(error.status === 401){
	            this._modal.setModal();
	        }
		});
  	}
	like(id,value,category,type){
	    let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.videoId, "type" : this.post_type} //'type' for some reason is null for the like, but works for the rating.
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
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
	    },error=>{
			if(error.status === 401){
	          this._modal.setModal();
			}  else if (error.json().locked){
				this.datanotify=[this.videoId,'videos','locked'];
			} else if(error.json().archived){
				this.datanotify=[this.videoId,'videos','archived'];
			} else if(error.json().flagged){
				this.datanotify=[this.videoId,'videos','flagged'];
			}
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
	toggleReportForm(){
		this.advancedStatisticsShow = false;
		this.rateOpen = false;
		this.showReportForm = !this.showReportForm;
	}
	submitReport(values){
		 var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":this.id, "type":"videos", "foul":values.foul}
	    this.reportSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/report`, body, {headers: headers}).subscribe(data => {
	    	this.has_reported = true;
	    })
	}
	encode(string){
		return encodeURIComponent(string);
	}
	toggleRateForm(){
		this.advancedStatisticsShow = false;
		this.showReportForm = false;
		this.rateOpen =!this.rateOpen;
	}
	toggleAdvancedForm(){
		this.advancedForm = !this.advancedForm;
	}
	showAdvancedStatistics(){
		this.rateOpen = false;
		this.showReportForm = false;
		this.advancedStatisticsShow = !this.advancedStatisticsShow;
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	ngOnDestroy(){
		this.passedParams = true;
		try {
			if(this.loaded && this.form && this.worked && this.videoJSplayer) this.videoJSplayer.dispose()
		}
		catch(err) {
    		console.warn(`videoJs failed to dispose, this error has been caught`);
			console.error(`error: ${err}`);
		}
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.ratingSubscription) this.ratingSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.reportSubscription) this.reportSubscription.unsubscribe();
		if(this.lockSubscription) this.lockSubscription.unsubscribe();
		if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
		if(this.routerSubscription) this.routerSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.removeSubscription) this.removeSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
	}
}
