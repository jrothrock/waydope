import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {BackendService} from '../../../services/backend.service';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';

declare var $;
declare var Materialize;

@Component({
  selector: 'partner',
  templateUrl: 'partner.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class PartnerComponent implements OnInit {
	applyForm: FormGroup;
	error:boolean=false;
	unsupported:boolean=false;
  parnerSubscription:any;
	submitted:boolean=false;
	constructor(private _fb: FormBuilder, private _backend: BackendService, private _http: Http, private _auth:AuthService, private _sysMessages: SystemMessagesComponent, private _router: Router){};
	ngOnInit(){
		this.applyForm = this._fb.group({
      		'email': [null, Validators.compose([Validators.required, Validators.pattern('[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?')])],
      		'name': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-_ ]*$')])],
      		'website': [null, Validators.compose([Validators.required, Validators.pattern('((http(s)?)?:\/\/)?([a-zA-Z]*\.)?[a-zA-Z]*\.[a-zA-Z]*(\/[a-zA-Z]*)?'), Validators.minLength(6)])],
      		'contact_name': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-_ ]*$')])],
      		'phone': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9x\+-]*$'), Validators.minLength(10)])],
      		'information': [null, Validators.compose([Validators.required, Validators.minLength(30)])],
    	})
	};

	apply(values){
		this.submitted = true;
		let fadein = setTimeout(()=>{
			$('#submit-partner').fadeIn().css("display","inline-block");
		},750)
		var headers = new Headers();
		var body = {"name": values.name,"email":values.email, "website" : values.website, "contact_name" : values.contact_name,"phone" : values.phone,"information" : values.information}
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this.parnerSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/partners/application`, body, {headers: headers}).subscribe(data => {
					clearTimeout(failedRequest);
					this.submitted = false;
  				this._sysMessages.setMessages('partner');
  				this._router.navigateByUrl('/');
					if(fadein) clearTimeout(fadein);
					$('#submit-partner').css({'display':'none'});
					$('.waves-ripple').remove();
					this.submitted = false;
  		}, error =>{
				  if (error.json().error) {
  		     		 this.unsupported = true;
  				} else {
            this.error;
          }
			});
			let failedRequest = setTimeout(()=>{
					$('.waves-ripple').remove();
					this.submitted = false;
					Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
					$('#submit-partner').css({'display':'none'});
			},15000);
	}
  ngOnDestroy(){
    if(this.parnerSubscription) this.parnerSubscription.unsubscribe();
  }
}
