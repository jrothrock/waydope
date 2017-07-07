import { Component, OnInit,EventEmitter, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import { Router } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';

declare var $;
declare var CloudZoom;
declare var Materialize;

@Component({
  selector: 'apparel_menu',
  templateUrl: 'apparel.menu.component.html',
  providers:[ModalComponent]
})

export class ApparelMenuComponent implements OnInit {
	subscription:any;
	voteSubscription:any;
	watchVoteSubscription:any;
	close = new EventEmitter();
	open = new EventEmitter();
	apparel:any=[];
	names:any=['hot','new','featured'];
	offset:number=0;
	loaded:boolean=false;
	initiated:boolean=false;
	zoomedPhoto:any;
	math:any=Math;
	system_url: string;
	magnificationOpen:boolean=false;
	marqueeing:boolean=false;
	item:any; // this is the marquee object.
	ids:any=[];
	currentTab:any='hot';
	constructor(private _http:Http, private _voteService: VoteService, private _backend: BackendService, private _auth:AuthService,private _router: Router, private _modal: ModalComponent){};
	ngOnInit(){
		this.getPosts();
		this.voteCheck();
	};
	getPosts(){
		this.system_url = this._backend.SERVER_URL;
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/menus/apparel/`, {headers:headers}).subscribe(data => {
				this.apparel = data.json().posts;
				
				for(let i = 0; i < this.apparel.length; i++){
					this.ids.push([])
					for(let ic = 0; ic < this.apparel[i].length; ic++){
						this.ids[i].push(this.apparel[i][ic].uuid);
					}
				}
				this.loaded = true;
				setTimeout(()=>{
					this.initiated=true;
					setTimeout(()=>{
						this.getImageWidth();
						$(`.menu-apparel-container`).addClass('active-menu');
					},10)
				},20)
				if(this.subscription) this.subscription.unsubscribe();
		});
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.apparelVote.subscribe((value) => { 

			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	mouseLeft(){
		if(!this.magnificationOpen){
			if(this.zoomedPhoto) this.zoomedPhoto.closeZoom()
			this.close.emit('message');
			setTimeout(()=>{
				$(`#menu-tab-apparel-${this.currentTab}, #menu-tab-name-apparel-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
				$(`#menu-tab-apparel-hot, #menu-tab-name-boards-hot`).addClass("active-tab").find('a').addClass('active');
				$(`#menu-${this.currentTab}-apparel`).css({'display':'none'});
				$(`#menu-hot-apparel`).css({'display':'block'});
				this.currentTab = 'hot'
			},20)
		}
	}
	mouseEnter(){
		this.open.emit('message');
	}
	clickedLink(type,category=null,url=null,subcategory=null){
		if(type === 'header'){
			this._router.navigateByUrl(`/apparel`);
		} else if(type === 'category'){
			this._router.navigateByUrl(`/apparel/${category}`); 
		} else if(type === 'subcategory'){
			this._router.navigateByUrl(`/apparel/${category}/${url}`); 
		} else if(type ==='user'){
			this._router.navigateByUrl(`/user/${category}`);
		} else {
			this._router.navigateByUrl(`/apparel/${category}/${subcategory}/${url}`);
		}
		if(this.marqueeing){this.item.stop(); this.item.scrollLeft(0);}
		this.close.emit('message');
	}
	hoveringItem(name){
		if(name != this.currentTab){
			$(`#menu-tab-apparel-${this.currentTab}, #menu-tab-name-apparel-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-apparel-${name}, #menu-tab-name-apparel-${name}`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-apparel`).css({'display':'none'});
			$(`#menu-${name}-apparel`).css({'display':'block'});
			this.currentTab = name;
		}
	}
	getImageWidth(){
		let container_width = $(`#main-photo-apparel-menu-container-0-0`).width()
		let container_height = $(`#main-photo-apparel-menu-container-0-0`).height()
        for(let i = 0; i < this.names.length;i++){
			for(let id = 0; id < this.apparel[i].length; id++){
				// let image_object = new Image();
				// // let container_height = $(`#main-photo-apparel-menu-container-${i}-${id}`).height()
				// image_object.src = $(`#main-photo-apparel-menu-${i}-${id}`).attr("src");

				
				// let native_width = image_object.width;
				// let native_height = image_object.height;
				// if(native_height > native_width && native_height > container_height){
				// 	let multiplier = container_height / native_height
				// 	let new_width = native_width * multiplier;
				// 	$(`#main-photo-apparel-menu-${i}-${id}`).height(container_height).width(new_width)
				// } else if (native_height > native_width && native_height <= container_height) {
				// 	$(`#main-photo-apparel-menu-${i}-${id}`).height(native_height).width(native_width)
				// } else if (native_width > native_height && native_width > container_width){
				// 	let multiplier = container_width / native_width;
				// 	let new_height = native_height * multiplier;
				// 	$(`#main-photo-apparel-menu-${i}-${id}`).height(new_height).width(container_width);
				// } else if(native_height === 0 && native_width === 0) {
				// 	$(`#main-photo-apparel-menu-${i}-${id}`).height(container_height).width(container_width)
				// } else{
					$(`#main-photo-apparel-menu-${i}-${id}`).height("100%").width("100%")
				// }
				$(`#main-photo-apparel-menu-${i}-${id}`).css({'display':'block'});
			}
        }
    }
    photoZoom(i,id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:12,disableZoom:'false'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-apparel-menu-${i}-${id}`),options);
			$(`#main-photo-apparel-menu-${i}-${id}`).bind('cloudzoom_start_zoom',()=>{
				this.magnificationOpen = true;
			});
			$(`#main-photo-apparel-menu-${i}-${id}`).bind('cloudzoom_end_zoom',()=>{
				this.magnificationOpen = false;
				$(`#main-photo-apparel-menu-${i}-${id}`).unbind("cloudzoom_start_zoom").unbind("cloudzoom_end_zoom")
			});
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.ids.length; i++){
			let index = this.ids[i].indexOf(id);
			if(index > -1){
				this.apparel[i][index].average_vote = vote;
				this.apparel[i][index].user_voted = user_voted;
			}
		}
	}
	setVote(vote,id,type,average_vote,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":"apparel", "vote":vote}
	      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			  let change;
			  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			  else if(vote === 1 && !voted) change = 1;
			  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			  else if(vote === -1 && !voted) change = -1;
			  this.voteChange(id,average_vote+change,data.json().user_vote)
			  this._voteService.change('component',id,average_vote+change,data.json().user_vote,'apparel');
	    }, error=>{
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
	marqueeToggle(type,name,index){
    	let textwidth = $(`#apparel-menu-title-link-${name}-${index}`).width();
    	this.item = $(`#apparel-menu-title-link-${name}-${index}`).parent()
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
		this.close.emit('message');
		this._router.navigateByUrl(`/apparel/${name}`);
	}
	giveDataName(name){
		return `menu-${name}-apparel`
	}
	ngOnDestroy(){
		if(this.zoomedPhoto) this.zoomedPhoto.destroy();
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
	}
}
