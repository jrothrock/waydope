import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../../../services/auth.service';
import {BackendService} from '../../../../services/backend.service';
import { AdminPartnersComponent } from '../admin.partners.component';

@Component({
  selector: 'admin_partner_details',
  templateUrl: 'admin.partner.details.component.html',
  providers:[AuthService, AdminPartnersComponent]
})

export class AdminPartnerDetailsComponent implements OnInit {
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

	constructor(private _http: Http, private _backend: BackendService, private _adminPartners: AdminPartnersComponent, private _router: Router, private _route: ActivatedRoute, private _auth:AuthService){};
	ngOnInit(){
		this._route.params.subscribe(params => {this.id = Number.parseInt(params['id']);});
		
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/partner`,{headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.name = data.json().partner.name;
				this.email = data.json().partner.email;
				this.contact_name = data.json().partner.contact_name;
				this.phone = data.json().partner.phone;
				this.website = data.json().partner.website;
				this.information = data.json().partner.information;
				this.submitted_by = data.json().partner.submitted_by;
			} else {
				this._router.navigate(['/admin/users']);
			}
		});
	};
	revoke(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/partner/revoke`,'',{headers: headersInit}).subscribe(data => {
			if(data.json().success){
				this._adminPartners.setMessages('success');
				this._router.navigate(['/admin/partners']);
			} else {
				this.error = true;
			}
		})
	};
}
