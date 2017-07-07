import { Component, OnInit,EventEmitter, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import { Router } from '@angular/router';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {VoteService} from '../../../services/vote.service';
import {VideoService} from '../../../services/video.service';
import 'angular2-materialize';

declare var $;
declare var videojs;
declare var Materialize;

@Component({
  selector: 'videos_menu',
  templateUrl: 'videos.menu.component.html',
  providers:[ModalComponent]
})

export class VideosMenuComponent implements OnInit {
	close = new EventEmitter();
	open = new EventEmitter();
	offset:number=0;
	names:any=['hot','new','featured'];
	posts:any=[];
	loaded:boolean=false;
	error:boolean=false;
	initiated:boolean=false;
	subscription:any;
	voteSubscription:any;
	watchVoteSubscription:any;
	playSubscription:any;
	videoJSplayer:any=[];
	math:any=Math;
	server_url:string;
	marqueeing:boolean=false;
	item:any; // this is the marquee object.
	ids:any=[];
	currentTab:string='hot';
	vidOpen:boolean=false;
	constructor(private _http:Http, private _vidService: VideoService, private _voteService: VoteService, private _backend: BackendService, private _auth: AuthService,private _router: Router,private _modal: ModalComponent){};
	ngOnInit(){
		this.getPosts();
		this.voteCheck();
	};
	getPosts(){
		this.server_url = this._backend.SERVER_URL;
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/menus/videos/`, {headers:headers}).subscribe(data => {
				this.posts = data.json().posts;
				for(let i = 0; i < this.posts.length; i++){
					this.ids.push([])
					for(let ic = 0; ic < this.posts[i].length; ic++){
						this.ids[i].push(this.posts[i][ic].uuid);
					}
				}
				this.loaded = true;
				setTimeout(()=>{
					this.initiated=true;
					setTimeout(()=>{
						$(`.menu-videos-container`).addClass('active-menu')
					},5)
				},20)
				if(this.subscription) this.subscription.unsubscribe();
		});
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.videoVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	mouseLeft(){
		if(!this.vidOpen){
			this.close.emit('message');
			setTimeout(()=>{
				$(`#menu-tab-videos-${this.currentTab}, #menu-tab-name-videos-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
				$(`#menu-tab-videos-hot, #menu-tab-name-videos-hot`).addClass("active-tab").find('a').addClass('active');
				$(`#menu-${this.currentTab}-videos`).css({'display':'none'});
				$(`#menu-hot-videos`).css({'display':'block'});
				this.currentTab = 'hot';
			},20)
		}
	}
	mouseEnter(){
		this.open.emit('meesage');
	}
	hoveringItem(name){
		console.log(name);
		console.log(this.currentTab);
		if(name != this.currentTab){
			$(`#menu-tab-videos-${this.currentTab}, #menu-tab-name-videos-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-videos-${name}, #menu-tab-name-videos-${name}`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-videos`).css({'display':'none'});
			$(`#menu-${name}-videos`).css({'display':'block'});
			this.currentTab = name;
		}
	}
	clickedLink(type,category=null,url=null){
		//basically, check to see if it is already on the component, if so, move to the dummy component - which reroutes back - in order to reload the component.
		if(type === 'header'){
			this._router.navigateByUrl(`/videos`);
		} else if(type === 'category'){
			this._router.navigateByUrl(`/videos/${category}`);
		} else if(type === 'user'){
			this._router.navigateByUrl(`/user/${category}`);
		} else {
			this._router.navigateByUrl(`/videos/${category}/${url}`);
		}
		if(this.marqueeing){this.item.stop(); this.item.scrollLeft(0);}
		this.close.emit('message');
	}
	photoHover(state,category,index){
	    if(state){
	      $(`#play-button-menu-video-${category}-${index}`).attr("src","/assets/images/orangebutton.svg");
	      $(`#video-artwork-menu-${category}-${index}`).css({'opacity':0.9});
	    }else{
	      $(`#play-button-menu-video-${category}-${index}`).attr("src","/assets/images/blackbutton.svg");
	      $(`#video-artwork-menu-${category}-${index}`).css({'opacity':0.6});
	    }
	}
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.ids.length; i++){
				let index = this.ids[i].indexOf(id);
				if(index > -1){
					this.posts[i][index].average_vote = vote;
					this.posts[i][index].user_voted = user_voted;
				}
			}
	}
	setVote(vote,id,type,average_vote,voted){
    var headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"id":id, "type":"videos", "vote":vote, "already_voted": voted}
      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
		  let change;
		  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
		  else if(vote === 1 && !voted) change = 1;
		  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
		  else if(vote === -1 && !voted) change = -1;
          this.voteChange(id,average_vote+change,data.json().user_vote)
		  this._voteService.change('component',id,average_vote+change,data.json().user_vote,'videos');
      },error=>{
		  if(error.status === 401){
          	this._modal.setModal();
       	  } else if (error.json().locked){
			Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
		  } else if(error.json().archived){
			Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
		  }
	  },()=>{
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
	  });
  }
	photoClicked(type,index,childIndex,form,id){
		// $('.menu-vote-actions-video').css({'margin-top':'-200px'})
		// this.posts[index][childIndex].clicked = true;
		if(form){
			this._vidService.change([this.posts[index][childIndex].upload_url,1])
			// this.initVideo(index,id);
		} else {
			this._vidService.change([this.posts[index][childIndex].link,0,this.posts[index][childIndex].link_type])
			// $('.menu-vote-actions-video').css({'margin-top':'-200px'})
			// this.posts[index][childIndex].clicked = true;
		}
		this.vidOpen = true;
		this.videoPlay(this.posts[index][childIndex].uuid);
		setTimeout(()=>{
			$(".dark-overlay").click(()=>{
				setTimeout(()=>{
					this.vidOpen = false;
					$(".dark-overlay").unbind();
				},150)
			})
		},200)
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
	initVideo(index,id){
		setTimeout(()=>{  
				// if(this.videoJSplayer) this.videoJSplayer.dispose();
					let video = videojs(`menu_video_${index}_${id}`, {}, function() {
           			 // This is functionally the same as the previous example.
        			});
					this.videoJSplayer.push(video);
		},1)
	}
	marqueeToggle(type,name,index){
    	let textwidth = $(`#videos-menu-title-link-${name}-${index}`).width();
    	this.item = $(`#videos-menu-title-link-${name}-${index}`).parent()
    	let parentwidth = this.item.width();
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
    	this.item.stop();
    	if(type === 1 && (textwidth > parentwidth)){
				this.marqueeing = true;
    		this.item.animate({scrollLeft:scrolldistance},time,'linear');
    	} else if (type === 0) {
    		this.item.animate({scrollLeft:0},'medium','swing',()=>{
					this.marqueeing = false;
				});
    	}
    };
	menuClick(name){
		// this.close.emit('message');
		// let url = name != 'all' ? `/videos/${name}` : '/videos';
		this._router.navigateByUrl(`/videos/${name}`);
	}
	giveDataName(name){
		return `menu-${name}-videos`
	}
	ngOnDestroy(){
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
	}
}
