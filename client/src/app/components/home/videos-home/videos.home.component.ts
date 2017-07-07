import { Component, OnInit, OnChanges, Input, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {VoteService} from '../../../services/vote.service';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {VideoService} from '../../../services/video.service';
import 'angular2-materialize';

declare var $;
declare var videojs;
declare var Materialize;

@Component({
  selector: 'videos-home',
  templateUrl: 'videos.home.component.html'
})

export class VideosHomeComponent implements OnChanges {
  @Input() videos:any;
  loaded:boolean=false;
  names:any=['hot','new','featured'];
  vids:any=[];
  count:any=[];
	currentPosts:any=[];
	currentPage:any=[];
  voteSubscription:any;
  likeSubscription:any;
  paginateSubscription:any;
  watchVoteSubscription:any;
  playSubscription:any;
  hovering:boolean=false;
  hoveringCheck:boolean=false;
  hoveringIndex:number;
  hoveringCategory:string;
  videoJSplayer:any=[];
  math:any=Math; // allows the usage of Math in the view
  window:any=window;
  server_url:string;
  ids:any=[];
  current_ids:any=[];
	constructor(private _auth: AuthService, private _vidService: VideoService, private _voteService: VoteService, private _backend: BackendService, private _http: Http, private _modal: ModalComponent, private _router: Router){
    this.server_url = this._backend.SERVER_URL;
    this.voteCheck();
  };
	ngOnChanges(changes:any):void {
      var videosChange:any = changes.videos.currentValue;
      if (videosChange) {
        // need different pointers;
        this.vids = [videosChange[0],videosChange[1],videosChange[2]];
			  this.currentPosts = [videosChange[0],videosChange[1],videosChange[2]];
        this.setIds();
        this.count = [];
        this.currentPage = Array(4).fill(0);
        for(let i = 0; i < this.vids.length; i++){
          if(this.count.length < 4){
            if(this.vids && this.vids[i] && this.vids[i].length) this.count.push(this.vids[i][0].total_count);
            else this.count.push(0);
          }
        }
        this.loaded = true;
        setTimeout(()=>{
          $('#tab-output-videos').addClass('active-home');
        },25)
      }
  }
  
  getPosts(index,category){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('Type', 'videos');
		headers.append('offset', (this.currentPage[index] * 4 + 4).toString());
    headers.append('category', category);
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/home/paginate`, {headers:headers}).subscribe(data => {
				this.vids[index] = this.vids[index].concat(data.json().posts);
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.vids[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
        this.setIds();
		});
	}
  setIds(){
		this.ids = [];
		for(let i =0; i < this.vids.length; i++){
			if(this.vids.length && this.vids[i]){
				this.ids.push([]);
				for(let ic= 0; ic < this.vids[i].length; ic++){
					this.ids[i].push(this.vids[i][ic].uuid);
				}
			}
		}
		for(let i  = 0;i< this.currentPosts;i++){
			if(this.currentPosts.length && this.currentPosts[i]){
				this.current_ids.push([]);
				for(let ic= 0; ic < this.currentPosts[i].length; ic++){
					this.current_ids[i].push(this.currentPosts[i][ic].uuid);
				}
			}
		}
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.vids.length; i++){
			if(this.ids[i]){
				
				let index = this.ids[i].indexOf(id);
				if(index > -1){
				this.vids[i][index].average_vote = vote;
				this.vids[i][index].user_voted = user_voted;
				}
			}
		}
		for(let i =0; i < this.currentPosts.length; i++){
			if(this.current_ids[i]){
				
				let current_index = this.current_ids[i].indexOf(id);
				if(current_index > -1){
					this.currentPosts[i][current_index].average_vote = vote;
					this.currentPosts[i][current_index].user_voted = user_voted;
				}
			}
		}
	}
  startPaginate(type,index){
    if(this.videoJSplayer.length > 0) {
      $.each( this.videoJSplayer, ( i, val ) => { 
         
        
        val.dispose();
        if(i === (this.videoJSplayer.length - 1) ) {this.paginate(type,index);}
      });
    } else {
      this.paginate(type,index);
    }
  }
	paginate(type,index){
    this.videoJSplayer = [];
    // if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();});
		if(type === 'next'){
			if(((this.currentPage[index] * 4 + 4)  === this.vids[index].length) && (this.vids[index].length < this.count[index])){
				this.getPosts(index,this.names[index]);
			} else {
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.vids[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
        setTimeout(()=>{
          this.initOldVideos(index);
        },50)
			}
		} else {
			if(this.currentPage[index] > 0){
				this.currentPage[index] -= 1;
				this.currentPosts[index] = this.vids[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
        setTimeout(()=>{
          this.initOldVideos(index);
        },50)
			}
		}
	}
  setVote(vote,id,type,average_vote,voted){
    var headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"id":id, "type":"videos", "vote":vote, "already_voted": voted}
      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
          let change;
				  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				  else if(vote === 1 && !voted) change = 1;
				  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				  else if(vote === -1 && !voted) change = -1;
          this.voteChange(id,average_vote+change,data.json().user_vote)
				  this._voteService.change('videos',id,average_vote+change,data.json().user_vote);
      },error=>{
        if(error.status === 401){
          this._modal.setModal('home');
        } else if (error.json().locked){
					Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
				} else if(error.json().archived){
					Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
				}
      });
  }
  likeVideo(id, liked, type, value, index, childIndex){
    
    
    var headers = new Headers({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"id":id, "liked" : liked, "type" : type}
    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
      
      if(data.json().success){
        let video = this.currentPosts[index][childIndex]
        video.likes_count = data.json().likes_count;
        video.user_liked = data.json().user_liked;
        if(data.json().user_liked){
            $(`#icon-likes-video-${id}`).addClass(' liked-icon fa-heart');
            $(`#icon-likes-video-${id}`).removeClass('fa-heart-o');
            $(`#likes-button-video-${id}`).addClass(' liked');
            $(`#likes-video-${id}`).html(`${value + 1}`);
        } else if(!data.json().user_liked){
            $(`#icon-likes-video-${id}`).addClass(' fa-heart-o');
            $(`#icon-likes-video-${id}`).removeClass('liked-icon fa-heart');
            $(`#likes-button-video-${id}`).removeClass('liked');
            $(`#likes-video-${id}`).html(`${value-1}`);
        }

      }
      else if(data.json().status === 401){
          this._modal.setModal('home');
      } else if (data.json().locked){
        Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
      } else if(data.json().archived){
        Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
      }
    });
  }
  photoClicked(index,childIndex,id){
    // this.currentPosts[index][childIndex].clicked = true;
    if(this.currentPosts[index][childIndex].form){
      if(window.outerWidth > 700){
        this._vidService.change([this.currentPosts[index][childIndex].upload_url,1])
      } else {
        this.currentPosts[index][childIndex].clicked = true;
        this.initVideo(index,id);
      }
    } else {
      if(window.outerWidth > 700){
        this._vidService.change([this.currentPosts[index][childIndex].link,0,this.currentPosts[index][childIndex].link_type])
      } else {
        this.currentPosts[index][childIndex].clicked = true;
      }
    }
    this.videoPlay(this.currentPosts[index][childIndex].uuid)
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
  initOldVideos(index){
    for(let i = 0; i < this.currentPosts[index].length; i++){
      
      if(this.currentPosts[index][i].clicked) this.initVideo(index,this.currentPosts[index][i].uuid,false);
    }
  }
  initVideo(index,id,autoplay=true){
		setTimeout(()=>{  
				// if(this.videoJSplayer) this.videoJSplayer.dispose();
          if(!autoplay) $(`#home_video_${index}_${id}`).data('setup', '{"fluid":true, "playbackRates":[0.5,1,1.5,2], "autoplay":false}')
					let video = videojs(`home_video_${index}_${id}`, {}, function() {
           			 // This is functionally the same as the previous example.
                  let container = $(`#home_video_${index}_${id}`)
                  $(container).css({"visibility":"visible"});
                  let video = $(container).find("video");
                  $(video).css({"visibility":"visible"});
        			});
          video.requestFullscreen();
					this.videoJSplayer.push(video);
		},1)
	}
  marqueeToggle(type,name,index){
      let textwidth = $(`#video-home-title-link-${name}-${index}`).width();
      
      let item = $(`#video-home-title-link-${name}-${index}`).parent()
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
  //category is really vid.id
  photoHover(state,index,category){
    if(state){
      if((this.hovering && this.hoveringIndex === index && this.hoveringCategory === category) || (this.hovering && !this.hoveringCheck)){
        $(`#play-button-home-videos-${this.hoveringIndex}-${this.hoveringCategory}`).attr("src","/assets/images/blackbutton.svg");
        $(`#video-artwork-home-${this.hoveringIndex}-${this.hoveringCategory}`).css({'opacity':0.6});
      }
      this.hovering = true;
      this.hoveringCheck = true;
      this.hoveringIndex = index;
      this.hoveringCategory = category;
      $(`#play-button-home-videos-${index}-${category}`).attr("src","/assets/images/orangebutton.svg");
      $(`#video-artwork-home-${index}-${category}`).css({'opacity':0.9});
    }else{
      this.hoveringCheck=false;
      //allows cursor to move over play button without changing the image back
      setTimeout(()=>{
        if(!this.hoveringCheck){
          $(`#play-button-home-videos-${index}-${category}`).attr("src","/assets/images/blackbutton.svg");
           $(`#video-artwork-home-${index}-${category}`).css({'opacity':0.6});
          this.hovering = false;
        }
      },100)
    }
  }
  transformRating(average_rating){
    return `translateX(${average_rating}%)`
  }
  tabClick(name){
    this._router.navigateByUrl(`/videos/${name}`);
  }
  ngOnDestroy() {
    // prevent memory leak when component destroyed
      if(this.voteSubscription) this.voteSubscription.unsubscribe();
      if(this.likeSubscription) this.likeSubscription.unsubscribe();
      if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
      if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
      if(this.playSubscription) this.playSubscription.unsubscribe();
      if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();});
  }

}