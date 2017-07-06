import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import {BackendService} from '../../../services/backend.service';
import { Router } from '@angular/router';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

declare var $;
declare var Materialize;

@Component({
  selector: 'reset_password',
  templateUrl: 'reset.password.component.html',
})

export class ResetPasswordComponent implements OnInit {
	constructor(private _http: Http, private _fb:FormBuilder, private _backend: BackendService, private _router: Router, private _sysMessages: SystemMessagesComponent){};
    verifySubscription:any;
    type:string;
    token:string;
    resetForm: FormGroup;
    submitted:boolean=false;
	ngOnInit(){
        this.resetForm = this._fb.group({
            'password': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&*()_+=?/<>,.;:~`{}|]*$'), Validators.minLength(6)])],
            'confirmPassword': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&*()_+=?/<>,.;:~`{}|]*$'), Validators.minLength(6)])]
        }, {validator: this.areEqual})
        let decoded = decodeURIComponent(window.location.search.substring(1))
        let params = decoded.split("&");
        for(let i = 0;i < params.length; i++){
            let key = params[i].split("=")[0]
            let value = params[i].split("=")[1]
            switch(key){
                case 'token':
                    this.token = value ? value : null; 
                    break;
            }
        }
        if(!this.token) this._router.navigate(['/']);
    };
    submitReset(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $(`#submit-reset-password`).fadeIn();
        },750)
        var headers = new Headers({
	            'Content-Type': 'application/json'
	    });
	    let body = {'token':this.token, password:values.password, confirmPassword:values.confirmPassword}
	    this.verifySubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/actions/reset/password`, body, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
            
	    	if(data.json().success){
                this._sysMessages.setMessages('successfulReset');
	    		this._router.navigate(['/']);
	    	} else {
                this._sysMessages.setMessages('unsuccessfulReset');
                this._router.navigate(['/']);
            }
            if(fadein) clearTimeout(fadein);
            $(`#submit-reset-password`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.submitted = false;
	    })
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-reset-password`).css({'display':'none'});
        },15000);
	}
    private areEqual(group: FormGroup) {
        if(group.controls['password'].value === group.controls['confirmPassword'].value) return null;
        return {areEqual: true};
    }
    ngOnDestroy(){
        if(this.verifySubscription) this.verifySubscription.unsubscribe();
    }
}
