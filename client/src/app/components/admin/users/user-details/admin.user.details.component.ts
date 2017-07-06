import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../../services/auth.service';
import {AdminUsersComponent} from '../admin.users.component';
import {BackendService} from '../../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

@Component({
  selector: 'admin_user_details',
  templateUrl: 'admin.user.details.component.html',
  providers:[AuthService, AdminUsersComponent],
})

export class AdminUserDetailsComponent implements OnInit {
	id:any;
	username:string;
	firstname:string;
	lastname:string;
	email:string;
	good_standing:boolean;
	is_admin:boolean;
	bio:string;
	powers = [false,true];
	set_admin:boolean = this.is_admin || false;

	constructor(private _http: Http, private _backend : BackendService, private _auth: AuthService, private _router: Router, private _route: ActivatedRoute, private _adminUsers: AdminUsersComponent){};
	
	ngOnInit(){
		this._route.params.subscribe(params => {this.id = Number.parseInt(params['id']);});
		
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/user`,{headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.username = data.json().user.username;
				this.firstname = data.json().user.firstname;
				this.lastname = data.json().user.lastname;
				this.email = data.json().user.email;
				this.good_standing = data.json().user.good_standing;
				this.is_admin = data.json().user.admin;
				this.bio = data.json().user.bio;
			} else {
				this._adminUsers.setMessages('nouserfind');
				this._router.navigate(['/admin/users']);
			}
		});
	};

	updateInfo(){
		var headersInit = new Headers();
		var body = "id=" + this.id + "&admin=" + this.set_admin;
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('Content-Type', 'application/x-www-form-urlencoded');
		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/user/update`, body, {headers: headersInit}).subscribe(data => {
			if(data.json().success){
				this._adminUsers.setMessages('success');
				this._router.navigate(['/admin/users']);
			} else {
				this._adminUsers.setMessages('nouser');
				this._router.navigate(['/admin/users']);
			}
		});
	}
}
