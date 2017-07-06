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
  selector: 'admin_new_posts',
  templateUrl: 'admin.new.posts.component.html',
})

export class AdminNewPostsComponent implements OnInit {
	subscription:any;
	paginateSubscription:any;
    names:any=['comments','news','music','videos','apparel','technology']
    posts:any=[];
	count:any=[];
	pages:any=[];
	math:any=Math;
	currentPage:any=[1,1,1,1,1,1];
	offset:any=[0,0,0,0,0,0];
	numbers:any=[];
	constructor(private _http: Http, private _sysMessages: SystemMessagesComponent, private _auth:AuthService, private _backend:BackendService, private _router:Router){};
	ngOnInit(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/new/posts`, {headers: headersInit}).subscribe(data => {
			if(data.json().success) {
				this.posts = data.json().posts;
				for(let i = 0;i < this.posts.length; i++){
					let count = this.posts && this.posts[i] && this.posts[i].length ? this.posts[i][0].count : 0
					this.count.push(count);
					this.pages.push(Math.ceil(this.count[i]/20)+1);
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
		if(page != this.currentPage[i]) $(`.btn-pagination.${i}.active`).removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
				'type': this.names[i],
				'offset':pageData[0]
	    });
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/new/posts/paginate`, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.posts[i] = data.json().posts;
	    		this.offset[i] = data.json().offset;
	    		this.currentPage[i] = pageData[1];
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
				data.push((page-2) * 20);
				data.push(page);
				break;
			case 'next':
				data.push((page) * 20);
				data.push(page);
				break;
			case 'end':
				data.push((page - 1) * 20);
				data.push(page);
				break;
			case 'page':
				data.push((page - 1) * 20);
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
