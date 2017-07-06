import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';

declare var $;


var adminUsersMessageData = {
  messages:null,
  setMessages:function(message){
    this.messages = message;
  },
  getMessages:function(){
    return this.messages;
  },
  clearMessages:function(){
    this.messages=null;
  }  
}


@Component({
  selector: 'Admin_Users',
  templateUrl: 'admin.users.component.html',
  providers: [AuthService, SystemMessagesComponent]
})

export class AdminUsersComponent implements OnInit {
	users:any=[]
	success:boolean=false;
	nouser:boolean=false;
	nouserfind:boolean=false;
	offset:number=0;
	total:number=0;
	pages:number=0;
	currentPage:number=0;
	numbers:any=[];
	math:any=Math;
	constructor(private _http: Http, private _location : Location, private _backend: BackendService, private _router: Router, private _sysMessages:SystemMessagesComponent, private _auth:AuthService){}

	ngOnInit(){
		this.checkMessages();
		this.getUsers();
	}

	getUsers(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('offset',this.offset.toString());
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/users`, {headers: headersInit}).subscribe(data => {
			if(data.json().success) {
				this.users = data.json().users;
				this.offset = this.offset ? this.offset : data.json().offset;
				this.total = data.json().count;
				this.pages = data.json().pages + 1;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = data.json().current + 1;
			} else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigate(['/']);
			}
		})
	}

	toggleBan(user,standing,index){
		
		
		if(standing === true){this.banUser(user,index)}else{this.unBanUser(user,index)};
	}

	banUser(user,index){
		var headersBU = new Headers();
		var body = "user_id=" + user;
		headersBU.append('Authorization', 'Bearer ' + this._auth.getToken());
		headersBU.append('Content-Type', 'application/x-www-form-urlencoded');
		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/user/ban`, body, {headers: headersBU}).subscribe(data =>{
			if(data.json().success){
				var goodStandingText = document.getElementById("good-standing-text-" + user);
            	goodStandingText.innerHTML = 'false';
            	var banText = document.getElementById("ban-text-" + user);
            	banText.innerHTML = 'Unban';
            	this.users[index].good_standing = false;
			}
		});
	}

	unBanUser(user,index){
		
		var headersUBU = new Headers();
		var body = "user_id=" + user;
		headersUBU.append('Authorization', 'Bearer ' + this._auth.getToken());
		headersUBU.append('Content-Type', 'application/x-www-form-urlencoded');
		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/user/unban`, body, {headers: headersUBU}).subscribe(data =>{
			if(data.json().success){
				var goodStandingText = document.getElementById("good-standing-text-" + user);
            	goodStandingText.innerHTML = 'true';
            	var banText = document.getElementById("ban-text-" + user);
            	banText.innerHTML = 'Ban';
            	this.users[index].good_standing = true;
			}
		});
	}

	toggleLock(user,standing,index){
		
		
		if(standing === false){this.lockUser(user,index)}else{this.unLockUser(user,index)};
	}

	lockUser(user,index){
		var headersBU = new Headers();
		var body = "user_id=" + user;
		headersBU.append('Authorization', 'Bearer ' + this._auth.getToken());
		headersBU.append('Content-Type', 'application/x-www-form-urlencoded');
		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/user/lock`, body, {headers: headersBU}).subscribe(data =>{
			if(data.json().success){
				var goodStandingText = document.getElementById("locked-text-" + user);
            	goodStandingText.innerHTML = 'false';
            	var banText = document.getElementById("lock-text-" + user);
            	banText.innerHTML = 'Unlock';
            	this.users[index].locked = true;
			}
		});
	}

	unLockUser(user,index){
		
		var headersUBU = new Headers();
		var body = "user_id=" + user;
		headersUBU.append('Authorization', 'Bearer ' + this._auth.getToken());
		headersUBU.append('Content-Type', 'application/x-www-form-urlencoded');
		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/user/lock`, body, {headers: headersUBU}).subscribe(data =>{
			if(data.json().success){
				var goodStandingText = document.getElementById("locked-text-" + user);
	        	goodStandingText.innerHTML = 'true';
	        	var banText = document.getElementById("lock-text-" + user);
	        	banText.innerHTML = 'Lock';
	        	this.users[index].locked = false;
			}
		});
	}

	getOffset(type,page){
		// this is kinda all fucked up due to the adding 1 in the data.json();
		let data = [];
		switch(type){
			case 'start':
				this.offset = 0;
				break;
			case 'back':
				this.offset = this.currentPage - 2 * 100;
				break;
			case 'next':
				this.offset = this.currentPage * 100;
				break;
			case 'end':
				this.offset = Math.floor(this.total / 100) * 100
				break;
			case 'page':
				this.offset = ((page -1) * 100)
				break;
		}
		return data;
	}
	changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		this.getUsers();
	}
	setState(){
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	  this._location.replaceState(`/admin/users${offsetString}`)
	}


	checkMessages(){
    	if(adminUsersMessageData.getMessages()){
	      
	      switch(adminUsersMessageData.getMessages()){
	        case 'success':
	          this.success = true;
	          break;
	        case 'nouser':
	          this.nouser = true;
	          break;
	        case 'nouserfind':
	        	this.nouserfind = true;
	        	break;
	      }
	      adminUsersMessageData.clearMessages();
	    }    
  	}

	public setMessages(message){
    	adminUsersMessageData.setMessages(message);
    }
}
