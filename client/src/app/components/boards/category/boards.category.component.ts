import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
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
import {VoteService} from '../../../services/vote.service';

declare var $;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'boards_category',
  templateUrl: 'boards.category.component.html',
  providers:[FormBuilder,ModalComponent]
})

export class BoardsCategoryComponent implements OnInit {
	sortPosts:FormGroup;
	category:string;
	posts:any=[];
	subscription:any;
	sortSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	loaded:boolean=false;
	options:any=['Votes','Likes','Alphabetically', 'Newest', 'Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typeValues:any=['Descending','Ascending'];
  	disabledTimeSelect:boolean=false;
  	disabledSelects:boolean=false;
  	offset:number;
  	total:number;
  	pages:number;
  	currentPage:number;
  	numbers:any;
  	optionValues:any;
  	timeValues:any;
  	typesValues:any;
  	error:boolean=false;
	math:any=Math;
	ids:any=[];
	constructor(private _route: ActivatedRoute, private _voteService: VoteService, private _backend: BackendService, private _location: Location, private _http: Http, private _auth: AuthService, private _router: Router, private _fb: FormBuilder, private _modal:ModalComponent){};
	ngOnInit(){
		$('.container').addClass('extended-container');
		this.sortPosts = this._fb.group({
	      'options': ['Votes', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    })
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
					this.sortPosts.patchValue({'options':this.optionValues})
					break;
				case 'time':
					this.timeValues = value;
					this.sortPosts.patchValue({'time':this.timeValues})
					break;
				case 'type':
					this.typesValues = value;
					this.sortPosts.patchValue({'type':this.typeValues})
					break;
			}
			
		}
		this.currentPage = (this.offset / 20) + 1;
		this.routeSubscription = this._route.params.subscribe(params => {this.category = params['category']});
		_setMeta.setCategory('boards',this.category);
		this.getPosts();
		this.voteCheck();
	};
	getPosts(){
		let headersInit = new Headers();
		let offset = this.offset ? this.offset.toString() : null;
		headersInit.append('Category', this.category);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('offset', offset);
		headersInit.append('order', this.optionValues);
		headersInit.append('time', this.timeValues);
		headersInit.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/news/category`,{headers: headersInit}).subscribe(data => {
			if(data.json().success){
				this.posts = data.json().posts;
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
			else if(data.json().status == 404){
				this.posts = false; //this is done so that the *ngif doesn't have to double bang in the view.
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				},150)
			} else {
				this.error = true;
			}
		});
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
    		setTimeout(()=>{$('#type').val('Ascending'); this.sortPosts.patchValue({type:'Ascending'}) },1);
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
    		setTimeout(()=>{$('#type').val('Descending'); this.sortPosts.patchValue({type:'Descending'})},1);
    		this.disabledSelects = false;
    	}
	}
	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		if(index > -1){
			this.posts[index].average_vote = vote;
			this.posts[index].user_voted = user_voted;
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
		for(let i =0; i < this.posts.length; i++){
			this.ids.push(this.posts[i].uuid);
		}
	}
	setVote(vote,id,type,average_vote,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":"news", "vote":vote, "already_voted":voted}
	      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
			  let change;
			  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			  else if(vote === 1 && !voted) change = 1;
			  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			  else if(vote === -1 && !voted) change = -1;
	          this.voteChange(id,average_vote+change,data.json().user_vote)
			  this._voteService.change('boards',id,average_vote+change,data.json().user_vote);
	        }
	        else if(data.json().status === 401){
	              this._modal.setModal('boards',this.category);
	        } else if (data.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(data.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
	      });
	      // upVoteSubscription.unsubscribe();
	}
	getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"featured":null, 'options':values.options, 'time':values.time, 'type':values.type, 'category':this.category}
		  this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/news/category/sort`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
	  			this.posts = data.json().posts;
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
				data.push((page-2) * 20);
				data.push(page - 1);
				break;
			case 'next':
				data.push((page) * 20);
				data.push(page + 1);
				break;
			case 'end':
				data.push((page - 1) * 20);
				data.push(page);
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
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues, 'category':this.category}
	    this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/news/category/paginate`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.posts = data.json().posts;
				this.setIds();
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];

	    		this.setState();
	    	}
	    });
	}
	displayAll(){
		$(`#loading-spinner-boards`).css({'display':'none'});
		$(`#boards-posts-container`).fadeIn();
   	}
   setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
	    this._location.replaceState(`/boards/${this.category}${offsetString}${orderString}${timeString}${typeString}`)
	}
	marqueeToggle(type,name,index){
    	let textwidth = $(`#boards-all-title-link-${name}-${index}`).width();
    	let item = $(`#boards-all-title-link-${name}-${index}`).parent()
    	let parentwidth = item.width();
    	let scrolldistance = textwidth - parentwidth;
    	item.stop();
    	if(type === 1 && (textwidth > parentwidth)){
    		item.animate({scrollLeft:scrolldistance},1500,'linear');
    	} else if (type === 0) {
    		item.animate({scrollLeft:0},'medium','swing');
    	}
    };
	ngOnDestroy(){
		$('.container').removeClass('extended-container');
		if(this.subscription) this.subscription.unsubscribe();
		if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
	}
}
