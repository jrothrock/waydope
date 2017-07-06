import { Component, OnInit, OnChanges, Input, OnDestroy,AfterViewInit,ChangeDetectionStrategy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {ModalComponent} from '../../modal/modal.component';
import {AuthService} from '../../../services/auth.service';
import { Router } from '@angular/router';
import {BackendService} from '../../../services/backend.service';
import {VoteService} from '../../../services/vote.service';
import 'rxjs/Rx';
import 'angular2-materialize';

declare var $;
declare var WaveSurfer;
declare var Materialize;

@Component({
  selector: 'music-home',
  templateUrl: 'music.home.component.html',
  providers:[ModalComponent, AuthService,BackendService],
   // changeDetection: ChangeDetectionStrategy.OnPush
})

export class MusicHomeComponent implements OnChanges {
  @Input() music:any;
  loaded:boolean = false;
  names:any=['hot','new','featured'];
  songs:any=[];
  count:any=[];
	currentPosts:any=[];
	currentPage:any=[];
  newValue:number;
  subscription:any;
  likeSubscription:any;
  musicSubscription:any;
  paginateSubscription:any;
  watchVoteSubscription:any;
  downloadSubscription:any;
  playSubscription:any;
  voteSubscription:any;
  hovering:boolean=false;
  hoveringCheck:boolean=false;
  hoveringIndex:number;
  hoveringCategory:string;
  wavesurfer:any=[];
  audioPlaying:boolean=false;
  currentlyPlaying:any;
  currentlyPlayingType:string;
  currentlyPlayingId:number;
  currentlyPlayingCategory:string;
  loadingPlayer:boolean=false;
  math:any=Math; // allows the usage of Math in the view
  window:any=window;
  // song:any;
  // timeline:any;
  // playhead:any;
  // pButton:any;
  // timelineWidth:any;
  // duration:any;
  server_url:string;
  ids:any=[];
  current_ids:any=[];
  downloading:boolean=false;
  elapsed_time:any;
	constructor(private _http:Http, private _backend: BackendService, private _voteService : VoteService, private _modal:ModalComponent, private _auth:AuthService, private _router: Router){
    this.server_url = this._backend.SERVER_URL;
    this.voteCheck();
  };

	ngOnChanges(changes:any):void {
      var musicChange:any = changes.music.currentValue;
      if (musicChange) {
        // need different pointers;
        this.songs = [musicChange[0],musicChange[1],musicChange[2]];
			  this.currentPosts = [musicChange[0],musicChange[1],musicChange[2]];
        this.setIds();
        this.count = [];
        this.currentPage = Array(4).fill(0);
        for(let i = 0; i < this.songs.length; i++){
          if(this.count.length < 4){
            if(this.songs && this.songs[i] && this.songs[i].length) this.count.push(this.songs[i][0].total_count);
            else this.count.push(0);
          }
        }
        this.loaded=true;
        setTimeout(()=>{
				  $('#tab-output-music').addClass('active-home');
			  },25)
      }
  }
  setIds(){
		this.ids = [];
		for(let i =0; i < this.songs.length; i++){
			if(this.songs.length && this.songs[i]){
				this.ids.push([]);
				for(let ic= 0; ic < this.songs[i].length; ic++){
					this.ids[i].push(this.songs[i][ic].uuid);
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
		for(let i =0; i < this.songs.length; i++){
      if(this.ids[i]){
        let index = this.ids[i].indexOf(id);
        if(index > -1){
          this.songs[i][index].average_vote = vote;
          this.songs[i][index].user_voted = user_voted;
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
  getPosts(index,category){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('Type', 'music');
		headers.append('offset', (this.currentPage[index] * 4 + 4).toString());
    headers.append('category', category)
    
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/home/paginate`, {headers:headers}).subscribe(data => {
			
			if(data.json().success){
				this.songs[index] = this.songs[index].concat(data.json().posts);
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.songs[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
        this.setIds();
			}
		});
	}
	paginate(type,index){
		if(type === 'next'){
			if(((this.currentPage[index] * 4 + 4)  === this.songs[index].length) && (this.songs[index].length < this.count[index])){
				this.getPosts(index,this.names[index]);
			} else {
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.songs[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
         setTimeout(()=>{
          this.initOldSongs(index);
        },50)
			}
		} else {
			if(this.currentPage[index] > 0){
				this.currentPage[index] -= 1;
				this.currentPosts[index] = this.songs[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
         setTimeout(()=>{
          this.initOldSongs(index);
        },50)
			}
		}
    if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
    this.audioPlaying = false;
    this.wavesurfer = [];
	}

  like(id, liked, type, value, index,childIndex){
    
    
    
    var headers = new Headers({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"id":id, "liked" : liked, "type" : type}
    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
      
      if(data.json().success){
        let song = this.currentPosts[index][childIndex];
        song.likes_count = data.json().likes_count;
        song.user_liked = data.json().user_liked;
        if(data.json().user_liked){
            $(`#icon-likes-${id}`).addClass(' liked-icon fa-heart');
            $(`#icon-likes-${id}`).removeClass('fa-heart-o');
            $(`#likes-button-${id}`).addClass(' liked');
            $(`#likes-${id}`).html(`${value + 1}`);
        } else if(!data.json().user_liked){
            $(`#icon-likes-${id}`).addClass('fa-heart-o');
            $(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
            $(`#likes-button-${id}`).removeClass('liked');
            $(`#likes-${id}`).html(`${value - 1}`);
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
  marqueeToggle(type,name,index){
      let textwidth = $(`#music-home-title-link-${name}-${index}`).width();
      
      let item = $(`#music-home-title-link-${name}-${index}`).parent()
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
  stopAudio(){
    if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].playPause();
    $(`#song-${this.currentlyPlayingCategory}-${this.currentlyPlayingId}`).data('value',0);
    $(`#song-play-icon-${this.currentlyPlayingCategory}-${this.currentlyPlayingId}`).removeClass('fa-pause').addClass('fa-play');
    this.audioPlaying = false;
  }

  startAudio(id,place,category){
    $(`#song-${category}-${id}`).data('value',1);
        $(`#song-play-icon-${category}-${id}`).removeClass('fa-play').addClass('fa-pause');
        this.audioPlaying = true;
        this.currentlyPlaying = place;
        this.currentlyPlayingId = id;
        this.currentlyPlayingCategory = category;
        try{
          this.wavesurfer[place].playPause()
        }catch(e){
          console.error('caught error in playPause');
        }
        if(this.loadingPlayer) this.loadingPlayer = false;
  }

  playAudio(id,url,category,index=null){
    if((!this.loadingPlayer && index === null) || (this.loadingPlayer && index != null)){
        let value = $(`#song-${category}-${id}`).data('value');
        let place = index ? index : $(`#song-${category}-${id}`).data('place');
        // 
        if((this.currentlyPlaying != null) && (this.currentlyPlaying != place)){
          this.stopAudio();
          this.startAudio(id,place,category);
        }  else if(value===0) {
         this.startAudio(id,place,category);
        } else {
         this.stopAudio();
        }
        this.wavesurfer[place].on('finish', ()=>{
          $(`#song-${category}-${id}`).data('value',0);
          $(`#song-play-icon-${category}-${id}`).removeClass('fa-pause').addClass('fa-play');
          this.audioPlaying = false;
        });
        this.wavesurfer[place].on('audioprocess', (data)=>{
			    // this will help cut back on the cpu usage a little
          if(Math.floor(data) != this.elapsed_time){
            this.elapsed_time = Math.floor(data);
            let minutes = Math.floor(data / 60)
            let seconds = Math.floor(data % 60)
            $(`#current-time-${category}-${id}`).text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds }`);
          }
        })
      }
    }
  initOldSongs(index){
    for(let i = 0; i < this.currentPosts[index].length; i++){
      if(this.currentPosts[index][i].clicked) this.waveSurferCreate(this.currentPosts[index][i].uuid,this.currentPosts[index][i].upload_url,this.names[index])
    }
  }
  waveSurferCreate(id,url,category){
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
        container: `#song-waveform-${category}-${id}`,
        waveColor: '#ddd',
        progressColor: '#ff6100',
        height: height,
        barWidth: 2,
        normalize:true,
      });
    this.wavesurfer.push(surfer);
    let newid = this.wavesurfer.length - 1;
    $(`#song-${category}-${id}`).data('place',newid);
    
    this.loadingPlayer = true;
    this.wavesurfer[newid].load(`${url}`);
    this.wavesurfer[newid].on('ready',()=>{
      this.playAudio(id,url,category,newid);
      let time = this.wavesurfer[newid].getDuration()
      let minutes = Math.floor(time / 60)
      let seconds = Math.floor(time % 60)
      $(`#duration-${category}-${id}`).text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
      $(`#song-playing-time-${category}-${id}`).css({'display':'block'})
    });
  }
  
  photoClicked(index,childIndex,id,category){
    var url;
    let song = this.currentPosts[index][childIndex]
    song.clicked = true;
    if(song.form===1) url = song.upload_url;
    setTimeout(()=>{
      if(url){ this.waveSurferCreate(id,url,category); }
      this.songPlay(song.uuid);
    },200)
  }
  checkVolume(type,id,category,click=false){
    if(type && !click){
      $(`#${category}-${id}-volume-range`).on("change mousemove", ()=> {
       let index = $(`#song-${category}-${id}`).data('place');
       if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range`).val())/100)
      });
    } else if(!click) {
      $(`#${category}-${id}-volume-range`).unbind("change mousemove");
    } else {
      let index = $(`#song-${category}-${id}`).data('place');
      if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range`).val())/100)
    }
  }
  download(id,title,type){
    // this may cause problem if the person trys downloading a lot of files at once, ie, just clicking through a list.
      // a way to counter act this would be to use a data attribute and check it.
    if(!this.downloading){
        let headers = new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
        });
        let body = {"song":id}
        this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/download`, body, {headers: headers}).subscribe(data => {
            if(data.json().success){  
              if(type === 1){
                let tag = document.createElement('a');
                tag.setAttribute('href', data.json().url);
                tag.setAttribute('target', "_blank");
                tag.setAttribute('download', title);
                tag.click();
              }
              this.downloading = false;
            }
        });
    }
	}
  loop(id,category){
    let index = $(`#song-${category}-${id}`).data('place');
    let wavesurfer = this.wavesurfer[index];
    let loop = $(`#song-${category}-${id}-repeat`).data('loop')
    if(!loop){
      wavesurfer.un('finish');
      wavesurfer.on('finish',()=>{
          this.startAudio(id,index,category);
      });
      $(`#song-${category}-${id}-repeat`).addClass('active');
      let loop = $(`#song-${category}-${id}-repeat`).data('loop',1)
    } else {
      wavesurfer.un('finish');
      $(`#song-${category}-${id}-repeat`).removeClass('active');
      let loop = $(`#song-${category}-${id}-repeat`).data('loop',0)
      this.wavesurfer[index].on('finish', ()=>{
          $(`#song-${category}-${id}`).data('value',0);
          $(`#song-play-icon-${category}-${id}`).removeClass('fa-pause').addClass('fa-play');
          this.audioPlaying = false;
      });
    }
  }
  searchArtist(artist){
    this._router.navigateByUrl(`/search?category=All&search=${artist}`);
  }
  setVote(vote,id,type,average_vote,voted){
    var headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"id":id, "type":"music", "vote":vote, "already_voted":voted}
      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
        if(data.json().success){
         let change;
				 if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				 else if(vote === 1 && !voted) change = 1;
				 else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				 else if(vote === -1 && !voted) change = -1;
         this.voteChange(id,average_vote+change,data.json().user_vote)
				 this._voteService.change('music',id,average_vote+change,data.json().user_vote);
        }
        else if(data.json().status === 401){
            this._modal.setModal('home');
        } else if (data.json().locked){
          Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
        } else if(data.json().archived){
          Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
        }
      });
      // upVoteSubscription.unsubscribe();
  }
  //category is really just the song.id
  photoHover(state,index,category){
    if(state){
      if((this.hovering && this.hoveringIndex === index && this.hoveringCategory === category) || (this.hovering && !this.hoveringCheck)){
        $(`#play-button-home-${this.hoveringIndex}-${this.hoveringCategory}`).attr("src","/assets/images/blackbutton.svg");
        $(`#music-artwork-home-${this.hoveringIndex}-${this.hoveringCategory}`).css({'opacity':0.6});
      }
      this.hovering = true;
      this.hoveringCheck = true;
      this.hoveringIndex = index;
      this.hoveringCategory = category;
      $(`#play-button-home-${index}-${category}`).attr("src","/assets/images/orangebutton.svg");
      $(`#music-artwork-home-${index}-${category}`).css({'opacity':0.9});
    }else{
      this.hoveringCheck=false;
      //allows cursor to move over play button without changing the image back
      setTimeout(()=>{
        if(!this.hoveringCheck){
          $(`#play-button-home-${index}-${category}`).attr("src","/assets/images/blackbutton.svg");
           $(`#music-artwork-home-${index}-${category}`).css({'opacity':0.6});
          this.hovering = false;
        }
      },100)
    }
  }
  songPlay(id){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":id}
	    this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/song/play`, body, {headers: headers}).subscribe(data => {
		});
	}
  transformRating(average_rating){
    return `translateX(${average_rating}%)`
  }
  tabClick(name){
    this._router.navigateByUrl(`/music/${name}`);
  }
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    if(this.voteSubscription) this.voteSubscription.unsubscribe();
    if(this.subscription) this.subscription.unsubscribe();
    if(this.likeSubscription) this.likeSubscription.unsubscribe();
    if(this.musicSubscription) this.musicSubscription.unsubscribe();
    if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
    if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
    if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
    if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
    if(this.playSubscription) this.playSubscription.unsubscribe();
  }
}
