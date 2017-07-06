import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';

@Component({
  selector: 'admin_music',
  templateUrl: 'admin.music.component.html',
})

export class AdminMusicComponent implements OnInit {
	songs:any=[];
	constructor(private _http: Http, private _backend: BackendService, private _router: Router, private _sysMessages:SystemMessagesComponent, private _auth:AuthService){};
	ngOnInit(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/music`, {headers: headersInit}).subscribe(data => {
			if(data.json().success) {
				this.songs = data.json().songs;
				
				
			} else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigate(['/']);
			}
		})
	};
}
