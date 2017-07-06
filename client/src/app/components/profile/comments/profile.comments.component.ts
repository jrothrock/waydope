import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import { Location } from '@angular/common';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {PhotosService} from '../../../services/photos.service';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {ModalComponent} from '../../modal/modal.component';
declare var $;

@Component({
  selector: 'profile_comments',
  templateUrl: 'profile.comments.component.html'
})

export class ProfileCommentsComponent implements OnInit {
  sortComments:FormGroup;
  subscription:any;
	likeSubscription:any;
	bioSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
  paginateSubscription:any;
  sortSubscription:any;
  user:string=null;
  offset:any;
  comments:any=[];
  optionValues:any;
  timeValues:any;
  typesValues:any;
  currentPage:number;
	iscurrentUser:boolean=false;
  options:any=['Votes','Newest', 'Oldest'];
  timings:any=['Day','Week','Month','Year','All Time'];
  types:any=['Highest To Lowest','Lowest To Highest'];
  typeValues:any=['Descending','Ascending'];
  disabledTimeSelect:boolean;
  disabledSelects:boolean;
  totalCount:number;
  total:number;
  pages:number;
  numbers:any;
  loaded:boolean;
  height:number;
  width:number;
	math:any=Math;
	constructor(private _fb: FormBuilder, private _backend: BackendService, private _http: Http, private _location: Location, private _modal: ModalComponent, private _route: ActivatedRoute, private _router: Router, private _auth: AuthService, private _sysMessages: SystemMessagesComponent){};
	ngOnInit(){
      $('.container').addClass('extended-container');
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
            break;
          case 'time':
            this.timeValues = value;
            break;
          case 'type':
            this.typesValues = value;
            break;
        }
      }
      this.currentPage = (this.offset / 20) + 1;
      this.sortComments = this._fb.group({
          'options': ['Votes', Validators.required],
          'time': ['All Time', Validators.required],
          'type': ['Descending', Validators.required]
        })
        this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
        this.iscurrentUser = localStorage.getItem('username') === this.user ? true : false;
        this.getComments();
  };
  getComments(){
    let headersInit = new Headers();
    headersInit.append('user', this.user);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		headersInit.append('offset', offset);
		headersInit.append('order', this.optionValues);
		headersInit.append('time', this.timeValues);
		headersInit.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/comments`,{headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.totalCount = data.json().comments.length;
				this.offset = this.offset ? this.offset : data.json().offset;
        this.comments = data.json().comments;
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
				this.loaded = true;
         setTimeout(()=>{
                    this.displayAll();
          },150)
			} 
			else if(data.json().status === 404){
				this.loaded = true;
				setTimeout(()=>{
						this.displayAll();
				},150)
			} else {
				// this.error = true;
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
    		setTimeout(()=>{$('#type').val('Ascending'); this.sortComments.patchValue({type:'Ascending'}) },1);
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
    		setTimeout(()=>{$('#type').val('Descending'); this.sortComments.patchValue({type:'Descending'})},1);
    		this.disabledSelects = false;
    	}
	}
  getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'user':this.user,"featured":null, 'options':values.options, 'time':values.time, 'type':values.type}
        this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/comments/sort`, body, {headers: headers}).subscribe(data => {
        if(data.json().success){
        this.comments = data.json().comments;
        this.offset = data.json().offset;
        this.currentPage = data.json().page;
        this.setState();
        }
      });
	}
  changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'user':this.user,'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
				this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/comments/paginate`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.comments = data.json().comments;
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];
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
  setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
        let url = `/user/${this.user}/comments${offsetString}${orderString}${timeString}${typeString}`
	    this._location.replaceState(url);
	}
  setVote(vote,id,type,voted){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"comment", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
    		if(data.json().success){
    			$(`#${type}-vote-${id}`).text(data.json().vote);
    			if(data.json().user_vote === 1){
    				$(`#${type}-upvote-${id}`).css({"color": "#ef6837"});
    				$(`#${type}-downvote-${id}`).css({"color": "black"});
    			} else if (data.json().user_vote === -1){
    				$(`#${type}-upvote-${id}`).css({"color": "black"});
    				$(`#${type}-downvote-${id}`).css({"color": "#ef6837"});
    			} else if (data.json().user_vote === null){
    				$(`#${type}-upvote-${id}`).css({"color": "black"});
    				$(`#${type}-downvote-${id}`).css({"color": "black"});
    			}
    		}
    		if(data.json().status === 401){
          		this._modal.setModal('user', this.user, 'comments');
      		}
    	});
    	// upVoteSubscription.unsubscribe();
	}
  displayAll(i=null){
       $(`#loading-spinner-comments`).css({'display':'none'})
       $(`#comments-container`).fadeIn();
  }
   ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
    if(this.sortSubscription) this.sortSubscription.unsubscribe();
    if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
    if(this.likeSubscription) this.likeSubscription.unsubscribe();
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.voteSubscription) this.voteSubscription.unsubscribe();
  }
}
