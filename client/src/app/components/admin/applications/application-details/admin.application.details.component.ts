import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../../services/auth.service';

import {AdminApplicationsComponent} from '../admin.applications.component';

@Component({
  selector: 'admin_application_details',
  templateUrl: 'admin.application.details.component.html',
  providers:[AuthService, AdminApplicationsComponent]
})

export class AdminApplicationDetailsComponent implements OnInit {
	id:any;
	name:string;
	email:string;
	contact_name:string;
	phone:string;
	website:string;
	information:string;
	submitted_by:string;
	mail:string;
	error:boolean=false;

	constructor(private _http: Http, private _adminApplication: AdminApplicationsComponent, private _router: Router, private _route: ActivatedRoute, private _auth:AuthService){};
	ngOnInit(){
		this._route.params.subscribe(params => {this.id = Number.parseInt(params['id']);});
		
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.get('http://localhost:3000/api/admin/application',{headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.name = data.json().application.name;
				this.email = data.json().application.email;
				this.contact_name = data.json().application.contact_name;
				this.phone = data.json().application.phone;
				this.website = data.json().application.website;
				this.information = data.json().application.information;
				this.submitted_by = data.json().application.submitted_by;
				this.mail = 'mailto:' + data.json().application.email;
			} else {
				this._router.navigate(['/admin/users']);
			}
		});
	};
	accept(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.post('http://localhost:3000/api/admin/application/accept','',{headers: headersInit}).subscribe(data => {
			if(data.json().success){
				this._adminApplication.setMessages('success');
				this._router.navigate(['/admin/applications']);
			} else {
				this.error = true;
			}
		})
	};
}
