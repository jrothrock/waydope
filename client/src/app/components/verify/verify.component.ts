import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import {BackendService} from '../../services/backend.service';
import { Router } from '@angular/router';
import {SystemMessagesComponent} from '../system/messages/messages.component';
@Component({
  selector: 'verify',
  templateUrl: 'verify.component.html',
})

export class VerifyComponent implements OnInit {
	constructor(private _http: Http, private _backend: BackendService, private _router: Router, private _sysMessages: SystemMessagesComponent){};
    verifySubscription:any;
    type:string;
    token:string;
	ngOnInit(){
        let decoded = decodeURIComponent(window.location.search.substring(1))
        let params = decoded.split("&");
        for(let i = 0;i < params.length; i++){
            let key = params[i].split("=")[0]
            let value = params[i].split("=")[1]
            switch(key){
                case 'type':
                    this.type = value ? value : null;
                    break;
                case 'verification':
                    this.token = value ? value : null; 
                    break;
            }
        }
        if(this.type && this.token) this.submitVerification()
        else this._router.navigate(['/']);
    };
    submitVerification(){
        var headers = new Headers({
	            'Content-Type': 'application/json'
	    });
	    let body = {'token':this.token}
	    this.verifySubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/actions/verify`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
                this._sysMessages.setMessages('verifiedEmail');
	    		this._router.navigate(['/']);
	    	} else {
                this._router.navigate(['/']);
            }
	    })
        setTimeout(()=>{
            this._router.navigate(['/']);
            this._sysMessages.setMessages('failedEmailVerify');
        },20000);
	}
    ngOnDestroy(){
        if(this.verifySubscription) this.verifySubscription.unsubscribe();
    }
}
