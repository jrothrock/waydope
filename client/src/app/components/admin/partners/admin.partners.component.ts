import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {BackendService} from '../../../services/backend.service';
import {AuthService} from '../../../services/auth.service';

var adminPartnersMessageData = {
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
  selector: 'admin_partners',
  templateUrl: 'admin.partners.component.html',
})

export class AdminPartnersComponent implements OnInit {
	success:boolean=false;
	nouser:boolean=false;
	nouserfind:boolean=false;
	partners:any=[];
	constructor(private _auth: AuthService, private _backend: BackendService, private _http: Http){};
	ngOnInit(){
		this.checkMessages();
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/partners/`, {headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.partners = data.json().partners;
			}
		})
	};

	checkMessages(){
    	if(adminPartnersMessageData.getMessages()){
	      
	      switch(adminPartnersMessageData.getMessages()){
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
	      adminPartnersMessageData.clearMessages();
	    }    
  	}

	public setMessages(message){
    	adminPartnersMessageData.setMessages(message);
    }
}
