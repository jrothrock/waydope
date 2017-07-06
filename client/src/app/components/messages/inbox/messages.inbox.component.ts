import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {ModalComponent} from '../../modal/modal.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import { Router } from '@angular/router';
@Component({
  selector: 'message_inbox',
  templateUrl: 'messages.inbox.component.html',
})

export class MessagesInboxComponent implements OnInit {
    subscription:any
	constructor(private _auth: AuthService, private _backend: BackendService, private _http: Http,){};
	ngOnInit(){
        var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/messages/inbox`,{headers: headersInit}).subscribe(data => {
            
            if(data.json().success){

            } else {

            }
        });
	};
}
