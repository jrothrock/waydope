import { Component, OnInit } from '@angular/core';
import { Http,Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import { Location } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ModalComponent} from '../../modal/modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {VideoService} from '../../../services/video.service';
declare var videojs;
declare var $;
declare var WaveSurfer;
declare var CloudZoom;
@Component({
  selector: 'search_all',
  templateUrl: 'search.all.component.html',
  providers:[ModalComponent]
})

export class SearchAllComponent implements OnInit {
    subscription:any;
	likeSubscription:any;
	voteSubscription:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	downloadSubscription:any;
	playVideoSubscription:any;
	playSubscription:any;
    category:string;
    search:string;
    results:any=[];
    quantity:number;
    searchForm:FormGroup;
    options:any=['All','Boards','Music','Videos','Apparel','Technology'];
    hovering:boolean;
    hoveringCheck:boolean;
    hoveringType:string;
    hoveringID:number;
    audioPlaying:boolean=false;
  	wavesurfer:any=[];
	videoJSplayer:any=[];
  	currentlyPlaying:any;
  	currentlyPlayingId:number;
  	currentlyPlayingType:string;
  	loadingPlayer:boolean=false;
	math:any=Math;
	zoomedPhoto:any;
	server_url:string;
	currentPage:number=0;
	pages:number=0;
	offset:number= 0; 
	numbers:any=[];
	ids:any=[];
	downloading:boolean=false;
	elapsed_time:any;
    constructor(private _http: Http, private _vidService:VideoService,private _location: Location, private _voteService : VoteService, private _backend : BackendService, private _router: Router, private _auth:AuthService,private _fb:FormBuilder, private _modal: ModalComponent){};
	ngOnInit(){
		this.server_url = this._backend.SERVER_URL;
		this.searchForm = this._fb.group({
	      'category': ['All', Validators.required],
	      'search': [null, Validators.required]
	    })
        let decoded = decodeURIComponent(window.location.search.substring(1))
        let params = decoded.split("&");
        for(let i = 0;i < params.length; i++){
            let key = params[i].split("=")[0]
            let value = params[i].split("=")[1]
            switch(key){
                case 'category':
                    this.category = value ? value : null;
					this.searchForm.patchValue({'category':this.category});
                    break;
                case 'search':
                    this.search = value ? value : null; 
                    break;
				case 'offset': 
					this.offset = value ? parseInt(value) : null;
					break;
            }
        }
        this.submitSearch(null,this.offset);
		this.voteCheck();
    };
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

	like(id,liked,value,index,type){
		var headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "liked" : liked, "type" : type}
		this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
		if(data.json().success){
			let post;
			post = this.results[index];
			post.likes_count = data.json().likes_count;
			post.user_liked = data.json().user_liked;
			if(data.json().user_liked){
				$(`#icon-likes-${id}-${type}`).addClass(' liked-icon fa-heart');
				$(`#icon-likes-${id}-${type}`).removeClass('fa-heart-o');
				$(`#likes-button-${id}-${type}`).addClass(' liked');
				$(`#likes-${id}-${type}`).html(`${value + 1}`);
			} else if(!data.json().user_liked) {
				$(`#icon-likes-${id}-${type}`).addClass(' fa-heart-o');
				$(`#icon-likes-${id}-${type}`).removeClass('liked-icon fa-heart');
				$(`#likes-button-${id}-${type}`).removeClass('liked');
				$(`#likes-${id}-${type}`).html(`${value-1}`);
			}

		} else if(data.json().status === 401){
			this._modal.setModal();
		}
		});
	}

	setVote(vote,id,type,average_vote,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":type, "vote":vote, "already_voted":voted}
	      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
			  let change;
			  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			  else if(vote === 1 && !voted) change = 1;
			  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			  else if(vote === -1 && !voted) change = -1;
	          this.voteChange(id,average_vote+change,data.json().user_vote,type)
			  this._voteService.change(type,id,average_vote+change,data.json().user_vote);
	        } else if(data.json().status === 401){
	              this._modal.setModal();
	        }
	    });
	}

  stopAudio(){
    if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].playPause();
    $(`#song-${this.currentlyPlayingId}`).data('value',0);
    $(`#song-play-icon-${this.currentlyPlayingId}`).removeClass('fa-pause').addClass('fa-play');
    this.audioPlaying = false;
  }

  startAudio(id,place){
    $(`#song-${id}`).data('value',1);
        $(`#song-play-icon-${id}`).removeClass('fa-play').addClass('fa-pause');
        this.audioPlaying = true;
        this.currentlyPlaying = place;
        this.currentlyPlayingId = id;
        this.wavesurfer[place].playPause()
        if(this.loadingPlayer) this.loadingPlayer = false;
  }

  checkEnter(event){
    if(event.keyCode == 13) {
      this.submitSearch(this.searchForm.value,this.offset)
    }
  }

  setIds(){
	 	this.ids = [];
		for(let i =0; i< this.results.length; i++){
			if(this.results[i]){
				this.ids.push([this.results[i].uuid,this.results[i].post_type]);
			}
		}
	}
	voteChange(id,vote,user_voted,type){
		for(let i =0; i< this.ids.length; i++){
			if(this.ids[i] && this.ids[i][0] === id && this.ids[i][1] === type){
				this.results[i].average_vote = vote;
				this.results[i].user_voted = user_voted;
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
          $(`#song-play-icon-${id}`).removeClass('fa-pause').addClass('fa-play');
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
      let surfer = WaveSurfer.create({
          container: `#song-waveform-${id}`,
          waveColor: '#ddd',
          progressColor: '#ff6100',
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
	download(id,title,type){
		if(!this.downloading){
			this.downloading=true;
			let headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {"song":id}
			this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/download`, body, {headers: headers}).subscribe(data => {
				if(data.json().success){  
					
					// (<any>window).location = data.json().url;
					if(type===1){
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
	videoPlay(id){
  	let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let body = {"id":id}
		this.playVideoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/post/play`, body, {headers: headers}).subscribe(data => {
		});
	}
	loop(id){
		let index = $(`#song-${id}`).data('place');
		let wavesurfer = this.wavesurfer[index];
		let loop = $(`#song-${id}-repeat`).data('loop')
		if(!loop){
		wavesurfer.un('finish');
		wavesurfer.on('finish',()=>{
			this.startAudio(id,index);
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
	initVideo(index,id){
		setTimeout(()=>{  
				// if(this.videoJSplayer) this.videoJSplayer.dispose();
				///
					let video = videojs(`video-${id}`, {}, function() {
           			 // This is functionally the same as the previous example.
					
                  let container = $(`#video-${id}`)
                  $(container).css({"visibility":"visible"});
                  let video_elem = $(container).find("video");
                  $(video_elem).css({"visibility":"visible"});
        			});
					video.requestFullscreen();
					this.videoJSplayer.push(video);
		},1)
	}
	photoClicked(index,id,type){
		if(type === 'music'){
			var url;
			let song = this.results[index]
			song.clicked = true;
			if(song.form===1) url = song.upload_url;
			setTimeout(()=>{
				if(url)this.waveSurferCreate(id,url);
				if(song.form===1) this.songPlay(song.uuid);
			})
		}else if(type === 'videos'){
			this.results[index].clicked = true;
			if(this.results[index].form){
				if(window.outerWidth > 700){
					this._vidService.change([this.results[index].upload_url,1])
				} else {
					this.results[index].clicked = true;
					this.initVideo(index,id);
				}
			} else {
				if(window.outerWidth > 700){
					this._vidService.change([this.results[index].link,0,this.results[index].link_type])
				} else {
					this.results[index].clicked = true;
				}
			}
			this.videoPlay(this.results[index].uuid);
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
    searchArtist(artist){
        this._router.navigateByUrl(`/switch/search?category=All&search=${artist}`, { skipLocationChange: true });
    }
    marqueeToggle(type,index){
		let textwidth = $(`#search-title-link-${index}`).width();
		let item = $(`#search-title-link-${index}`).parent()
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


    transformRating(average_rating){
	    return `translateX(${average_rating}%)`
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

	changePage(type,page){
		let pageData = this.getOffset(type,page);
		this.submitSearch(null,pageData[0]);
	}
	setState(){
		if(this.offset) this._location.replaceState(`/search?category=${this.category}&search=${this.search}&offset=${this.offset}`);
		else this._location.replaceState(`/search?category=${this.category}&search=${this.search}`);
	}

    submitSearch(values,offset){
        if(values && values.search && values.category && values.category === this.category && this.search === values.search){
            return false;
        }
        if(values && values.search && values.category){
            this.search = values.search;
            this.category = values.category;
        }
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        headers.append('category', this.category);
        headers.append('search', this.search);
		headers.append('offset',offset.toString());
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/search/`, {headers:headers}).subscribe(data => {
			
			if(data.json().success){
                this.results = data.json().results;
				this.setIds();
                this.quantity = data.json().total;
				this.offset = data.json().offset;
				this.pages = data.json().pages;
				this.currentPage = data.json().current_page;
				if(!this.numbers.length) this.numbers = Array(this.pages).fill(1);
				this.setState();
				this.displayAll();
			} else if(data.json().status === 404) {
                this.quantity = 0;
                this.results = [];
				this.displayAll();
			}
            this.searchForm.patchValue({search:''})
            $(`#search`).blur();
		});

	};
	changePhoto(type,parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-${type}-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-${type}-${parentIndex}-${photoIndex}`);
		let src = $(newactive).attr('src');
		$(`#main-photo-${type}-${parentIndex}`).attr('src', src);
		$(oldactive).removeClass('active-photo');
		$(newactive).addClass('active-photo');
	}
	photoZoom(type,id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-${type}-${id}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
	displayAll(){
		$("#loading-spinner-search").fadeOut();
		$("#results-container").fadeIn();
	}
    ngOnDestroy(){
		 this._voteService.isAll(false);
         if(this.subscription) this.subscription.unsubscribe();
		 if(this.likeSubscription) this.likeSubscription.unsubscribe();
		 if(this.voteSubscription) this.voteSubscription.unsubscribe();
		 if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		 if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		 if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		 if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
		 if(this.playSubscription) this.playSubscription.unsubscribe();
		 if(this.playVideoSubscription) this.playVideoSubscription.unsubscribe();
		 if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();});
    }
}
