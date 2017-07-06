import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../../services/auth.service';
import {BackendService} from '../../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {SystemMessagesComponent} from '../../../system/messages/messages.component';


@Component({
  selector: 'admin_new_flags',
  templateUrl: 'admin.new.flags.component.html',
})

export class AdminNewFlagsComponent implements OnInit {
	subscription:any;
    names:any=['comments','news','music','videos','apparel','technology']
    flags:any=[];
	count:any=[];
	constructor(private _http: Http, private _sysMessages: SystemMessagesComponent, private _auth:AuthService, private _backend:BackendService, private _router:Router){};
	ngOnInit(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/new/flags`, {headers: headersInit}).subscribe(data => {
			if(data.json().success) {
				this.flags = data.json().flags;
				for(let i = 0;i < this.flags.length; i++){
					let count = this.flags && this.flags[i] && this.flags[i].length ? this.flags[i][0].count : 0
					this.count.push(count);
				}
			} else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigate(['/']);
			}
		})
	};
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
    }
}
