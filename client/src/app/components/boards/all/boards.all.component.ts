import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Http, Headers } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';

declare var $;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'boards_all',
  templateUrl: 'boards.all.component.html',
  providers:[FormBuilder,ModalComponent]
})

export class BoardsAllComponent implements OnInit {
	sortCategories:FormGroup;
	sortPosts:FormGroup;
	boards:any=[]
	display:any=[]
	error:boolean=false;
	subscription:any;
	sortSubscription:any;
	voteSubscription:any;
	paginateSubscription:any;
	getRestSubscription:any;
	watchVoteSubscription:any;
	posts:any;
  	options:any=['Number of Posts','Alphabetically', 'Newest', 'Oldest'];
  	// options:any=['Number of Posts','Number Of Subscribers','Alphabetically', 'Newest', 'Oldest'];
  	optionsNews:any=['Votes','Likes','Alphabetically', 'Newest', 'Oldest'];
	optionsValues:any=['Posts','Alphabetically','Newest','Oldest'];
  	// optionsValues:any=['Posts','Subscribers','Alphabetically','Newest','Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typesValues:any=['Descending','Ascending'];
	tabTypes=['news','categories'];
	newsTypes:any=['Highest To Lowest','Lowest To Highest'];
	newsTypesValues:any=['Descending','Ascending'];
  	disabledTimeSelect:boolean=false;
  	disabledSelects:boolean=false;
	newsDisabledSelects:boolean=false;
	newsDisabledTimeSelects:boolean=false;
  	offset:number;
  	total:number;
  	pages:number;
  	currentPage:number;
  	numbers:any;
  	optionValues:any;
  	timeValues:any;
  	typeValues:any;
  	all:any=[];
	newsOffset:number;
	newsOptionValues:any;
	newsTimeValues:any;
	newsTypeValues:any;
	pagesNews:number;
	totalNews:number;
	numbersNews:any;
	currentPageNews:number;
	math:any=Math;
	all_ids:any=[];
	post_ids:any=[];
	constructor(private _http:Http, private _voteService: VoteService, private _backend: BackendService, private _auth:AuthService, private _fb: FormBuilder,private _modal: ModalComponent, private _location: Location){};
	ngOnInit(){
		_setMeta.setType('boards');
		$('.container').addClass('extended-container');
		this.sortCategories = this._fb.group({
	      'options': ['Posts', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    })
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
					this.sortCategories.patchValue({'options':this.optionValues})
					break;
				case 'time':
					this.timeValues = value;
					this.sortCategories.patchValue({'time':this.timeValues})
					break;
				case 'type':
					this.typeValues = value;
					this.sortCategories.patchValue({'type':this.typeValues})
					break;
				case 'news_offset':
					this.newsOffset = parseInt(value);
					break;
				case 'news_order':
					this.newsOptionValues = value;
					this.sortPosts.patchValue({'options':this.newsOptionValues})
					break;
				case 'news_time':
					this.newsTimeValues = value;
					this.sortPosts.patchValue({'time':this.newsTimeValues})
					break;
				case 'news_type':
					this.newsTypeValues = value;
					this.sortPosts.patchValue({'type':this.newsTypeValues})
					break;
			}
		}
		if(this.optionValues){
			setTimeout(()=>{
				this.onOptionsChange('categories',this.optionValues)
			}, 5)
		}
		if(this.newsOptionValues){
			setTimeout(()=>{
				this.onOptionsChange('news',this.newsOptionValues)
			}, 10)
		}
		this.currentPage = this.offset ? (this.offset / 20) + 1 : 1;
		this.currentPageNews = this.newsOffset ?  (this.newsOffset / 20) + 1 : 1;
		this.getBoards();
		this.voteCheck();
	};
	getBoards(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		let newsOffset = this.newsOffset ? this.newsOffset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typeValues);
		headers.append('noffset', newsOffset);
		headers.append('norder', this.newsOptionValues);
		headers.append('ntime', this.newsTimeValues);
		headers.append('ntype', this.newsTypeValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/news/`, {headers:headers}).subscribe(data => {
				this.all = data.json().all;
				this.boards = data.json().boards;
				this.setIds('all');
				this.posts = data.json().posts;
				this.setIds('posts');
				this.offset = this.offset ? this.offset : data.json().offset;
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.pagesNews = data.json().news_pages;
				this.totalNews = data.json().news_count; 
				this.numbers = Array(this.pages).fill(1);
				this.numbersNews = Array(this.pagesNews).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
				this.currentPageNews = this.currentPageNews ? this.currentPageNews : data.json().news_page;
				this.getBoardsRest();
				setTimeout(()=>{
					this.transition(0);
					this.displayAll();
				},300)
		},error=>{
			this.error = true;
		});
	};
	getBoardsRest(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken());
		let offset = this.offset ? this.offset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typeValues);
		this.getRestSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/news/rest`, {headers:headers}).subscribe(data => {
			
			
			if(data.json().success){
				this.posts = this.posts.concat(data.json().posts);
				this.setIds('posts');
			}
		});
	}
   displayAll(){
		$(`#loading-spinner-boards`).css({'display':'none'});
		$(`#boards-posts-container-all, #boards-posts-container-categories`).fadeIn();
   }
	
   setVote(vote,id,average_vote,voted){
		var headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"news", "vote":vote, "already_voted":voted}
			this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			let change;
			if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			else if(vote === 1 && !voted) change = 1;
			else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			else if(vote === -1 && !voted) change = -1;
				this.voteChange(id,average_vote+change,data.json().user_vote)
				this._voteService.change('boards',id,average_vote+change,data.json().user_vote);
			},error=>{
				if(error.status === 401){
					this._modal.setModal('boards');
				} else if (error.json().locked){
					Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
				} else if(error.json().archived){
					Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
				}
			});
			// upVoteSubscription.unsubscribe();
	}

  setIds(type){
	  if(type === 'all'){
		this.all_ids = [];
		for(let i =0; i < this.all.length; i++){
			this.all_ids.push(this.all[i].uuid);
		}
	  } else { 
		this.post_ids = [];
		for(let i =0; i < this.posts.length; i++){
			this.post_ids.push([]);
			for(let ic = 0; ic < this.posts[i].length; ic++ ){
				this.post_ids[i].push(this.posts[i][ic].uuid);
			}
		}
	  }
	}
	voteChange(id,vote,user_voted){
		let index = this.all_ids.indexOf(id);
		if(index > -1){
			this.all[index].average_vote = vote;
			this.all[index].user_voted = user_voted;
		}

		for(let i =0; i < this.posts.length; i++){
			let index = this.post_ids[i].indexOf(id)
			if(index > -1){
				this.posts[i][index].average_vote = vote;
				this.posts[i][index].user_voted = user_voted;
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

	getOffset(type,page){
		let data = [];
		switch(type){
			case 'start':
				data.push(0);
				data.push(1)
				break;
			case 'back':
				data.push((page-1) * 20);
				data.push(page);
				break;
			case 'next':
				data.push((page-1) * 20);
				data.push(page);
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
	changePage(tab,type,page){
		// the front end keeps returning NAN for currentPage +/- 1. Even though if you put the currentPage it shows a number. IDK why.
		if(tab === 'categories' && (type === 'back' || type === 'next' )) page = type === 'back' ? this.currentPage - 1 : this.currentPage + 1;
		let pageData = this.getOffset(type,page);
		if(tab === 'news' && page != this.currentPageNews) $(`.btn-pagination-news.active`).removeClass('active')
		else if(tab === 'categories' && page != this.currentPage) $(`.btn-pagination-categories.active`).removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = tab === 'categories' ? {'sort':'categories','offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typeValues} : {'sort':tab,'news_offset':pageData[0], 'news_options':this.newsOptionValues, 'news_time':this.newsTimeValues, 'news_type':this.newsTypeValues}
		this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/news`, body, {headers: headers}).subscribe(data => {
	    		if(tab === 'categories'){
					this.boards = data.json().boards;
					this.posts = data.json().posts;
					this.setIds('posts');
					this.offset = data.json().offset;
					this.transition(0);
					this.currentPage = pageData[1];
				} else {
					this.all = data.json().posts;
					this.setIds('all');
					this.currentPageNews = pageData[1];
					this.newsOffset = data.json().offset;
				}
	    		this.setState();
	    });
	}
	setState(){
		let orderString, newsOrderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typeValues ? `&type=${this.typeValues}` : ``;

		let newsOffset = '';
		if(this.newsOffset){ newsOffset = this.offset ? `&news_offset=${this.newsOffset}` : `?news_offset=${this.newsOffset}`  } else { newsOffset = ``}
		if(newsOffset || offsetString || orderString){newsOrderString = this.newsOptionValues ? `&news_order=${this.newsOptionValues}` : ``} else{newsOrderString = this.newsOptionValues ? `?news_order=${this.newsOptionValues}` : ``}
		let newsTime = this.newsTimeValues ?  `&news_time=${this.newsTimeValues}` : ``;
		let newsType = this.newsTypeValues ?  `&news_type=${this.newsTypeValues}` : ``;

	    this._location.replaceState(`/boards${offsetString}${orderString}${timeString}${typeString}${newsOffset}${newsOrderString}${newsTime}${newsType}`)
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

	onOptionsChange(type,value) {
		let $time = type === 'categories' ? $('#time') : $('#time-news');
		let $type = type === 'categories' ? $('#type') : $('#type-news');
		// let types = type === 'categories' ? this.types : this.musicTypes;
		// let typesValues = type === 'categories' ? this.typesValues : this.musicTypesValues;
		let disabledSelects = type === 'categories' ? this.disabledSelects : this.newsDisabledSelects;
		let disabledTimeSelect = type === 'categories' ? this.disabledTimeSelect : this.newsDisabledTimeSelects;
		let sort = type === 'categories' ? this.sortCategories : this.sortPosts;
		if(value === 'Newest' || value === 'Oldest'){
			if(type === 'categories'){
				this.disabledTimeSelect = false;
				this.disabledSelects = true;
			} else {
				this.newsDisabledTimeSelects = false;
				this.newsDisabledSelects = true;
			}
    		$time.val('');
    		$time.prop('disabled', 'disabled');
    		$type.val('');
    		$type.prop('disabled', 'disabled');
    	} else if(value === 'Alphabetically'){
    		if(disabledSelects){
    			$type.prop('disabled', false); 
				if(type === 'categories') this.disabledSelects = false
				else this.newsDisabledSelects = false;
    		}

    		if(type === 'categories') {
				this.disabledTimeSelect = true;
				this.types=['A-Z','Z-A'];
				this.typesValues=['Ascending','Descending'];
			}
			else { 
				this.newsDisabledTimeSelects = true;
				this.newsTypes=['A-Z','Z-A'];
				this.newsTypesValues=['Ascending','Descending'];
			}
    		$time.val('');
    		$time.prop('disabled', 'disabled');
    		setTimeout(()=>{$type.val('Ascending'); sort.patchValue({type:'Ascending'}) },1);
    	} else if(disabledTimeSelect){
			if(type === 'categories'){
    			this.types=['Highest To Lowest','Lowest To Highest'];
    			this.typesValues=['Descending','Ascending'];
				this.disabledTimeSelect = false;
			} else {
				this.newsTypes=['Highest To Lowest','Lowest To Highest'];
    			this.newsTypesValues=['Descending','Ascending'];
				this.newsDisabledTimeSelects = false;
			}
    		$type.val('')
    		$time.val('All Time');
    		$time.prop('disabled', false);
    	} else if(disabledSelects) {
			if(type === 'categories'){
				this.types=['Highest To Lowest','Lowest To Highest'];
    			this.typesValues=['Descending','Ascending'];
				this.disabledSelects = false;
			} else {
				this.newsTypes=['Highest To Lowest','Lowest To Highest'];
    			this.newsTypesValues=['Descending','Ascending'];
				this.newsDisabledSelects = false;
			}
    		$time.prop('disabled', false); 
    		$time.val('All Time');
    		$type.prop('disabled', false); 
    		setTimeout(()=>{$type.val('Descending'); sort.patchValue({type:'Descending'})},1);
    	}
	}

	getSorting(type,values){
		if(type === 'categories'){
			this.optionValues = values.options ? values.options:null;
			this.timeValues = values.time ? values.time : null;
			this.typeValues = values.type ? values.type : null;
		} else {
			this.newsOptionValues = values.options ? values.options:null;
			this.newsTimeValues = values.time ? values.time : null;
			this.newsTypeValues = values.type ? values.type : null;
		}
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = type === 'categories' ? {'sort':'categories','options':this.optionValues, 'time':this.timeValues, 'type':this.typeValues } : 
		{'sort':'news','news_options':this.newsOptionValues, 'news_time':this.newsTimeValues, 'news_type':this.newsTypeValues }
	    this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/news/sort`, body, {headers: headers}).subscribe(data => {
			if(type === 'categories'){ 
				this.boards = data.json().boards;
				this.posts = data.json().posts;	
				this.setIds('posts')
			} else {
				this.all = data.json().posts;
				this.setIds('all')
			}
			this.setState();
	    });
	}
	transition(id){
		let value = $(`#post-toggle-button-${id}`).data('value');
		if(value === 0){
			$(`#post-toggle-button-${id}`).removeClass('fa-chevron-down').addClass('fa-chevron-up').data('value',1);
			$(`#post-block-${id}`).slideDown( "slow" );
		} else if(value === 1) {
			$(`#post-toggle-button-${id}`).removeClass('fa-chevron-up').addClass('fa-chevron-down').data('value',0);
			$(`#post-block-${id}`).slideUp( "slow" );
		}
	}
	ngOnDestroy(){
		$('.container').removeClass('extended-container');
		if(this.subscription) this.subscription.unsubscribe();
		if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.getRestSubscription) this.getRestSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
	}
}
