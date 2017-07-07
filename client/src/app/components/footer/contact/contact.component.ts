import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {BackendService} from '../../../services/backend.service';

declare var $;
declare var Materialize;

@Component({
  selector: 'contact',
  templateUrl: 'contact.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class ContactComponent implements OnInit {
	subscription:any;
	uploadMessage: FormGroup;
	error:boolean=false;
	submitted:boolean=false;
	powers = ['vendors','press','developers','questions', 'complaints', 'suggestions'];
  	unsupported:boolean=false;
	constructor(private _http: Http, private _backend: BackendService, private _auth: AuthService, private fb: FormBuilder, private _router: Router, private _sysMessages: SystemMessagesComponent){};
	ngOnInit(){
		this.uploadMessage = this.fb.group({
	      'title': [null, Validators.required],
        'email': [null, Validators.compose([Validators.required, Validators.pattern('[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?')])],
	      'category': [null, Validators.required],
	      'body': [null, Validators.required]
	    })
	};

	submitMessage(values){
		this.submitted = true;
		let fadein = setTimeout(()=>{
			$('#submit-contact').fadeIn().css("display","inline-block");
		},750)
		var headers = new Headers();
		var body = {"title": values.title,"email":values.email, "category" : values.category, "body" : values.body}
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/messages`, body, {headers: headers}).subscribe(data => {
		  clearTimeout(failedRequest);
	     if(data.json().success){
			this._sysMessages.setMessages('contact');
			this._router.navigateByUrl('/');
		  } else if (data.json().error) {
			this.unsupported = true;
		  } else {
			this.error;
          }
		    if(fadein) clearTimeout(fadein);
			$('#submit-contact').css({'display':'none'});
			$('.waves-ripple').remove();
			this.submitted = false;
  		});
		let failedRequest = setTimeout(()=>{
		  $('.waves-ripple').remove();
          this.submitted = false;
     	  Materialize.toast("Something failed on our end. Please try again.", 3000, 'rounded-failure');
          $(`#submit-contact`).css({'display':'none'});
      	},15000);
	}
	ngOnDestroy(){
		if(this.subscription) this.subscription.unsubscribe();
	}
}
