import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import {BackendService} from '../../services/backend.service';
import { Router } from '@angular/router';
import {SystemMessagesComponent} from '../system/messages/messages.component';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

declare var Materialize;
declare var $;

@Component({
  selector: 'reset',
  templateUrl: 'reset.component.html',
})

export class ResetComponent implements OnInit {
	constructor(private _http: Http, private _fb: FormBuilder, private _backend: BackendService, private _router: Router, private _sysMessages: SystemMessagesComponent){};
    verifySubscription:any;
    resetForm: FormGroup;
    no_user:boolean=false;
    no_email:boolean=false;
    submitted:boolean=false;
	ngOnInit(){
        this.resetForm = this._fb.group({
            'username': [null, Validators.compose([Validators.required])],
        })
    };
    submitReset(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $(`#submit-reset`).fadeIn();
        },750)
        var headers = new Headers({
	            'Content-Type': 'application/json'
	    });
	    let body = {'username':values.username}
	    this.verifySubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/actions/reset`, body, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
            
	    	if(data.json().success){
                Materialize.toast("Recovery Email Sent.", 3000, 'rounded-success')
                setTimeout(()=>{
                    this._router.navigate(['/']);
                },3500)
	    	} else if(data.json().no_user) {
               this.no_user = true; 
            } else if(data.json().no_email) {
               this.no_email = true;
            }
            if(fadein) clearTimeout(fadein);
            $(`#submit-reset`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.submitted = false;
	    });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-reset`).css({'display':'none'});
        },15000);
	}
    ngOnDestroy(){
        if(this.verifySubscription) this.verifySubscription.unsubscribe();
    }
}
