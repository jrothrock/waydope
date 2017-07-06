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

declare var $;

@Component({
  selector: 'admin_new_reports',
  templateUrl: 'admin.new.reports.component.html',
})

export class AdminNewReportsComponent implements OnInit {
    subscription:any;
	paginateSubscription:any;
    names:any=['comments','news','music','videos','apparel','technology']
    reports:any=[];
	count:any=[];
	pages:any=[];
	currentPage:any=[0,0,0,0,0,0];
	offset:any=[0,0,0,0,0,0];
	numbers:any=[];
	constructor(private _http: Http, private _sysMessages: SystemMessagesComponent, private _auth:AuthService, private _backend:BackendService, private _router:Router){};
	ngOnInit(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/new/reports`, {headers: headersInit}).subscribe(data => {
			if(data.json().success) {
				this.reports = data.json().reports;
				for(let i = 0;i < this.reports.length; i++){
					let count = this.reports[i].length ? this.reports[i][0].count : 0
					this.count.push(count);
					this.pages.push(this.count[i]/20);
					this.numbers.push(Array(this.pages[i]).fill(1));
				}
			} else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigate(['/']);
			}
		})
	};
	changePage(type,page,i){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage[i]) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'offset':pageData[0], 'type':this.names[i]}
			this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/new/reports/paginate`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.reports = data.json().reports;
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];
	    	}
	    });
	}
	getOffset(type,page){
		let data = [];
		switch(type){
			case 'start':
				data.push(0);
				data.push(1)
				break;
			case 'back':
				data.push((page-2) * 15);
				data.push(page - 1);
				break;
			case 'next':
				data.push((page) * 15);
				data.push(page + 1);
				break;
			case 'end':
				data.push((page - 1) * 15);
				data.push(page);
				break;
			case 'page':
				data.push((page - 1) * 15);
				data.push(page)
				break;
		}
		return data;
	}
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
    }
}
