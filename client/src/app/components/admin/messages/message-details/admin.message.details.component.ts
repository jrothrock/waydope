import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../../services/auth.service';
import {BackendService} from '../../../../services/backend.service';

@Component({
  selector: 'admin_message_details',
  templateUrl: 'admin.message.details.component.html',
  providers:[AuthService]
})

export class AdminMessageDetailsComponent implements OnInit {
	id:any;
	title:string;
	email:string;
	category:string;
	body:string;
	submitted_by:string;
	mail:string;

	constructor(private _http: Http, private _backend: BackendService, private _router: Router, private _route: ActivatedRoute, private _auth:AuthService){};
	ngOnInit(){
		this._route.params.subscribe(params => {this.id = Number.parseInt(params['id']);});
		
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/message`,{headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.title = data.json().message.title;
				this.email = data.json().message.email;
				this.category = data.json().message.category;
				this.body = data.json().message.body;
				this.submitted_by = data.json().message.submitted_by;
				this.mail = 'mailto:' + data.json().message.email + '?Subject=RE: ' + data.json().message.title;
			} else {
				this._router.navigate(['/admin/users']);
			}
		});
	};
}
