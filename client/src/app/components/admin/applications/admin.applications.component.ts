import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {BackendService} from '../../../services/backend.service';
import {AuthService} from '../../../services/auth.service';


var adminApplicationsMessageData = {
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
  selector: 'admin_applications',
  templateUrl: 'admin.applications.component.html',
})

export class AdminApplicationsComponent implements OnInit {
	success:boolean=false;
	nouser:boolean=false;
	nouserfind:boolean=false;
	applications:any=[];
	subscription:any;
	constructor(private _auth: AuthService, private _http: Http, private _backend: BackendService){};
	ngOnInit(){
		this.checkMessages();
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/applications/`, {headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.applications = data.json().applications;
			}
		})
	};
	checkMessages(){
    	if(adminApplicationsMessageData.getMessages()){
	      
	      switch(adminApplicationsMessageData.getMessages()){
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
	      adminApplicationsMessageData.clearMessages();
	    }    
  	}

	public setMessages(message){
    	adminApplicationsMessageData.setMessages(message);
    }
    ngOnDestroy() {
    // prevent memory leak when component destroyed
    if(this.subscription) this.subscription.unsubscribe();
  }
}
