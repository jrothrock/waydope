import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {ModalComponent} from '../../modal/modal.component';
import {CommentsComponent} from '../../comments/comments.component';
import {BackendService} from '../../../services/backend.service';
import {SystemPostsModalComponent} from '../../system/posts/modal.component'
import {AdminPostsModalComponent} from '../../system/admin/admin.posts.modal.component'
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {AdminGuard} from '../../../services/admin.guard.service';
import {VoteService} from '../../../services/vote.service';

declare var $;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'boards_post',
  templateUrl: 'boards.post.component.html',
  providers: [ModalComponent,SystemMessagesComponent],
  entryComponents: [CommentsComponent],
})

export class BoardsPostComponent implements OnInit {
	simpleRating:FormGroup;
	reportForm:FormGroup;
	routerSubscription:any;
	id:any;
	isLoggedIn:boolean=false;
	subscription:any;
	voteSubscription:any;
	reportSubscription:any;
	routeSubscription:any;
	likeSubscription:any;
	ratingSubscription:any;
	deleteSubscription:any;
	lockSubscription:any;
	watchVoteSubscription:any;
	removeSubscription:any;
	post:any;
	link:string;
	title:string;
	post_type:string;
	submitted_by:string;
	created_at:string;
	average_vote:number;
	description:string;
	marked:string;
	user_voted:number;
	category:string;
	ratingError:boolean=false;
	rateOpen:boolean=false;
	user_liked:boolean=false;
	likes_count:number;
	has_rated:boolean=false;
	average_rating_count:number;
	average_rating:number;
	average_rating_width:number;
	advancedStatisticsShow:boolean=false;
	upvotes:number;
	average_vote_width:number;
	downvotes:number;
	votes_count:number;
	has_reported:boolean=false;
	showReportForm:boolean=false;
	username:string;
	showDeleteForm:boolean=false;
	postId:number;
	form:number;
	hidden:boolean;
	categories:any;
	passedParams:boolean=false;
	math:any=Math;
	isAdmin:boolean;
	datanotify:any;
	locked:boolean;
	archived:boolean;
	window:any=window;
	specific:string; //uid for a comment that's being viewed.
	hostname:string;
	loaded:boolean=false;
	dataadmin:any;
	flagged:boolean=false;
	routed:boolean=false;
	route_time:any;
	nsfw:boolean=false;
	showSocialsFlag:boolean=false;
	constructor(private _auth: AuthService,  private _voteService: VoteService, private _backend: BackendService, private _admin: AdminGuard, private _fb:FormBuilder, private _sysMessages: SystemMessagesComponent, private _route: ActivatedRoute, private _http: Http, private _modal: ModalComponent, private _router: Router){
	   this.routerSubscription = _router.events.subscribe(s => {
		   
        if(s && s["state"] && this.loaded){
          let url_bits = s["url"].split('/')
          if(url_bits.length === 4 && url_bits[3] != this.id){
            this.category = decodeURI(url_bits[2]);
            this.id = url_bits[3];
            $("#boards-post-container").removeClass('active-post');
			this.routed = true;
			this.route_time = new Date();
            this.getBoardPost();
          }
        }
	  })
	};
	ngOnInit(){
		$('.container').addClass('extended-container');
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
		this.getBoardPost();
		this.voteCheck();
		if(window.outerWidth < 451) $("#share-button-boards-post").removeClass("horizontal btn-large").addClass("btn-medium");
	};
	getBoardPost(){
		
		var headersInit = new Headers();
		headersInit.append('id', this.id);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('Category', this.category)
		let spinner, spinnerTimeout;
		spinnerTimeout = setTimeout(()=>{
			spinner = true;
			$("#loading-spinner-boards-post").fadeIn();
		},300)
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/news/${this.category}/${this.id}`,{headers: headersInit}).subscribe(data => {
				this.postId = data.json().post.uuid;
				this.title = data.json().post.title;
				this.link = data.json().post.link;
				this.post_type = data.json().post.post_type;
				this.submitted_by = data.json().post.submitted_by;
				this.created_at = data.json().post.created_at;		
				this.average_vote = data.json().post.average_vote;
				this.description = data.json().post.description;
				this.marked = data.json().post.marked;
				this.user_voted = data.json().post.user_voted;
				this.user_liked = data.json().post.user_liked;
				this.likes_count = data.json().post.likes_count;
				this.category = data.json().post.main_category;
				this.average_rating_count = data.json().post.ratings_count;
				this.average_rating = data.json().post.average_rating;
				this.upvotes = data.json().post.upvotes;
				this.downvotes = data.json().post.downvotes;
				this.votes_count = data.json().post.votes_count;
				this.average_vote_width = this.upvotes / this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
				this.has_reported = data.json().post.user_flagged;
				this.form = data.json().post.form;
				this.hidden = data.json().post.hidden;
				this.categories = data.json().post.categories;
				this.archived = data.json().post.archived;
				this.locked = data.json().post.locked;
				this.has_rated = data.json().post.user_rated;
				this.hostname = data.json().post.hostname;
				this.flagged = data.json().post.flagged;
				this.loaded = true;
				this.nsfw = data.json().post.nsfw;
				let newTime;
				if(this.routed) this.post = ['reset'];
				if(this.routed) this.passedParams = false;
				if(this.routed) newTime = new Date();
				let time = this.routed && this.route_time && newTime && (newTime - this.route_time < 275)  ? (275 - (newTime - this.route_time)) : 50; 
				this.routed = false;
				if(spinnerTimeout) clearTimeout(spinnerTimeout);
				setTimeout(()=>{
                  	if(spinner) $("#loading-spinner-boards-post").css({'display':'none'});
					$("#boards-post-container").addClass('active-post');
					let $post = $("#boards-like-post");
					let $hidden = $("#boards-like-post-hidden");
					let left = $hidden.position().left;
					let top = $post.position().top;
					let post_width = $post.width();
					let width = $hidden.width() / 2;
					let height = $post.height();
					if((post_width/4) < width) {
						let container_left = $("#boards-post-container").position().left;
						$("#boards-link-type").css({'top':`${top}px`,'left':`${container_left}px`});
						$("#boards-like-post").css({'text-align':'left'})
					}
					else{
						$("#boards-link-type").css({'top':`${top+ height}px`,'left':`${left+7+width}px`})
						$("#boards-like-post").css({'text-align':'center'});
					}
					$("#boards-link-type").css({'display':'initial'});
				},time)
				setTimeout(()=>{
					if(this.specific) {
						this.post = ['news',this.postId,this.category,this.specific];
						this.passedParams = true;
						setTimeout(()=>{
							$(".view-all-comments").get(0).scrollIntoView(true);
						},5)
					}
					else this.watchScroll();
					_setMeta.setPost(data.json().post.title,`${data.json().post.form === 1 ? data.json().post.teaser.substring(0,30) : data.json().post.description.substring(0,30) }...`,'news',data.json().post.main_category, null)
				},100)
		},error=>{
			if(error.status === 404) {
				this._sysMessages.setMessages('noPost');
				this._router.navigateByUrl('/boards', { replaceUrl: true });
			} else if(error.status === 410){
				this._sysMessages.setMessages('removedPost');
				this._router.navigateByUrl('/boards', { replaceUrl: true });
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
				if(!component.passedParams){component.post = ['news',component.postId,component.category,null,component.specific]; }//this is passed to the comments component;
				component.passedParams = true;
			}
	     }
	  });
	}
	voteCheck(){
      this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
        if(value.length){
         this.voteChange(value[0],value[1],value[2]);
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
        $(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '65px' : '9px'} !important`)
        $(".hidden-socials").fadeIn();

      }
      this.showSocialsFlag = !this.showSocialsFlag;
    }
	voteChange(id,vote,user_voted){
		if(id === this.postId){
			this.average_vote = vote;
			this.user_voted = user_voted;
		}
	}
	setVote(vote){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":this.postId, "type":"news", "vote":vote}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			let change;
			if(vote === 1 && this.user_voted) change = this.user_voted === 1 ? -1 : 2;
			else if(vote === 1 && !this.user_voted) change = 1;
			else if(vote === -1 && this.user_voted) change = this.user_voted === -1 ? +1 : -2;
			else if(vote === -1 && !this.user_voted) change = -1;
			this.voteChange(this.postId,this.user_voted+change,data.json().user_vote)
			this._voteService.change('boards',this.postId,this.user_voted+change,data.json().user_vote);
			this.upvotes = data.json().upvotes;
			this.downvotes = data.json().downvotes;
			this.votes_count = data.json().votes_count;
			this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
    	},error=>{
			if(error.status === 401){
    			this._modal.setModal('boards',this.category,this.id);
    		} else if (error.json().locked){
				this.datanotify=[this.postId,'news','locked'];
			} else if(error.json().archived){
				this.datanotify=[this.postId,'news','archived'];
			} else if(error.json().flagged){
				this.datanotify=[this.postId,'news','flagged'];
			}
		});
	}
	like(id,value,genre,type){
	    let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.postId, "type" : type}
		this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
	        if(!data.json().user_liked){
	            let elementIcon = document.getElementById("icon-likes-" + id);
	            elementIcon.className += ' liked-icon';
	            let elementButton = document.getElementById("likes-button-" + id);
	            elementButton.className += ' liked';
	            let elementText = document.getElementById("likes-" + id);
	            elementText.innerHTML = value + 1;
	            this.likes_count = this.likes_count + 1;
	        }
	        else if(data.json().user_liked){
	            let elementIcon = document.getElementById("icon-likes-" + id);
	            elementIcon.className = 'fa fa-heart';
	            let elementButton = document.getElementById("likes-button-" + id);
	            elementButton.className += 'btn btn-like';
	            let elementText = document.getElementById("likes-" + id);
	            let newvalue = value - 1;
	            elementText.innerHTML = newvalue.toString();
	            this.likes_count = this.likes_count - 1;
	        }
	        this.user_liked = !this.user_liked;
	    },error=>{
	      if(error.status === 401){
	          this._modal.setModal('boards',this.category,this.id);
	      } else if (error.json().locked){
				this.datanotify=[this.postId,'news','locked'];
		  } else if(error.json().archived){
			this.datanotify=[this.postId,'news','archived'];
		  } else if(error.json().flagged){
				this.datanotify=[this.postId,'news','flagged'];
		  }
		});
	}
	encode(string){
		return encodeURIComponent(string);
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
	    body = {"id":this.postId, "simpleRating" : parseInt(value.rating), "type" : type, "advancedRating":null}
	    // if(!this.advancedForm){
	    // 	body = {"id":this.songId, "simpleRating" : parseInt(value.rating), "type" : type, "advancedRating":null}
	    // } else {
	    // 	if(this.hasLyrics && this.hasWhine){
	    // 		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"message":parseInt(value.message),"production":parseInt(value.production),"originality":parseInt(value.originality),"whinyness":parseInt(value.whinyness)}
	    // 	} else if (this.hasLyrics && !this.hasWhine) {
	    // 		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"message":parseInt(value.message),"production":parseInt(value.production),"originality":parseInt(value.originality),"whinyness":null}
	    // 	} else if (!this.hasLyrics && this.hasWhine){
	    // 		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"message":null,"production":parseInt(value.production),"originality":parseInt(value.originality),"whinyness":parseInt(value.whinyness)}
	    // 	} else {
	    // 		body = {"id":this.songId,"type":type,"advancedRating":this.current_average_rating,"message":null,"production":parseInt(value.production),"originality":parseInt(value.originality),"whinyness":null}
	    // 	}
	    // }
	    this.ratingSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/ratings`, body, {headers: headers}).subscribe(data => {
	    		this.rateOpen = false;
	    		this.has_rated = true;
	    		this.average_rating = data.json().average_rating;
	    		this.average_rating_count = data.json().ratings_count;
		},error=>{
			if(error.status === 401){
         		 this._modal.setModal('boards',this.category,this.id);
       		} else if (error.json().locked){
				this.datanotify=[this.postId,'news','locked'];
			} else if(error.json().archived){
				this.datanotify=[this.postId,'news','archived'];
			} else if(error.json().poor_rating){
				Materialize.toast("It can't be that bad...", 3000, 'rounded-failure')
			} else if(error.json().flagged){
				this.datanotify=[this.postId,'news','flagged'];
			}
		})
	}
	lockInit(){
      this.datanotify=[this.postId,'news','check','lock'];
    }
	removeInit(){
		this.datanotify=[this.postId,'news','check','remove'];
	}
	adminInit(){
	  this.dataadmin=[this.postId,this.post_type,this.category,null];
	}
	removePost(event){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.postId,"type":'news'}
		this.removeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/remove`, body, {headers: headers}).subscribe(data => {
          if(data.json().success){
            // this.locked = true;
			Materialize.toast("<i class='fa fa-close'></i> Post Successfully Removed", 3000, 'rounded-success')
          }
      });
	}
    lockPost(event){
       let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.postId,"type":'news'}
	    this.lockSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/lock`, body, {headers: headers}).subscribe(data => {
          if(data.json().success){
            this.locked = true;
			Materialize.toast("<i class='fa fa-lock'></i> Post Successfully Locked", 3000, 'rounded-success')
          }
      });
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
	    var body = {"id":this.postId, "type":"news", "foul":values.foul}
		this.reportSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/report/new`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.has_reported = true;
	    	}
	    })
	}
	toggleDeleteForm(){
		this.showDeleteForm = !this.showDeleteForm;
	}
	deletePost(){
		var headers = new Headers();
		var creds = {"post": this.postId, "upload":true}
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.deleteSubscription = this._http.delete(`${this._backend.SERVER_URL}/api/v1/news/${this.category}/${this.id}`, {headers: headers}).subscribe(data => {
				this._sysMessages.setMessages('deletePost');
				this._router.navigateByUrl(`/boards`);
		},error=>{
			if(error.status === 401){
	        	this._modal.setModal('boards',this.category,this.id);
			} 
		});
  }
	toggleRateForm(){
		this.advancedStatisticsShow = false;
		this.showReportForm = false;
		this.rateOpen =!this.rateOpen;
	}
	showAdvancedStatistics(){
		this.rateOpen = false;
		this.showReportForm = false;
		this.advancedStatisticsShow = !this.advancedStatisticsShow;
	}
	editPost(){
		this._router.navigateByUrl(`/boards/edit?type=${this.form}&title=${this.title}&category=${this.category}&id=${this.id}`);
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	ngOnDestroy(){
		$('.container').addClass('extended-container');
		this.passedParams = true;
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.ratingSubscription) this.ratingSubscription.unsubscribe();
		if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
		if(this.lockSubscription) this.lockSubscription.unsubscribe();
		if(this.routerSubscription) this.routerSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.removeSubscription) this.removeSubscription.unsubscribe();
	}
}
