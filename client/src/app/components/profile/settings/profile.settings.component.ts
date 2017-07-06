import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';

declare var $;
declare var Materialize;

@Component({
  selector: 'profile_settings',
  templateUrl: 'profile.settings.component.html'
})

export class ProfileSettingsComponent implements OnInit {
    updateSettingsForm: FormGroup;
    updateOptionsForm: FormGroup;
    updatePasswordForm: FormGroup;
    updateSSNForm:FormGroup;
    updateInfoSubscription:any;
    updatePasswordSubscription:any;
    updateOptionsSubscription:any;
    subscription:any;
    updateSubscription:any;
    currentUser:string;
    submitted:boolean=false;
    settings:any= ['info','options','password']
    passwordError:boolean=false;
    constructor(private _fb: FormBuilder, private _backend: BackendService, private _http: Http, private _auth: AuthService, private _router: Router, private _sysMessages: SystemMessagesComponent) {
	    this.updateSettingsForm = _fb.group({
	      'firstname': [null, Validators.pattern('^[a-zA-Z]*$')],
	      'lastname': [null, Validators.pattern('^[a-zA-Z]*$')],
	      'email': [null, Validators.pattern('[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?')],
          'phone': [null],
          'address': [null],
          'address_two': [null],
          'city': [null],
          'state': [null],
          'zipcode': [null, Validators.pattern('^[0-9]*$')],
          'phone_number': [null, Validators.pattern('^[0-9]*$')],
          'show_nsfw':[null],
          'hide_nsfw':[null]
	    })
        this.updateOptionsForm = _fb.group({
	      'firstname': [null, Validators.pattern('^[a-zA-Z]*$')],
	      'lastname': [null, Validators.pattern('^[a-zA-Z]*$')],
	    })
        this.updatePasswordForm = _fb.group({
	      'current': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&\\\\*()\\]\\\'_+=?/<>,.;:~`{}|"[]*$')])],
	      'passwords': _fb.group({
            'password': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&\\\\*()\\]\\\'_+=?/<>,.;:~`{}|"[]*$'), Validators.minLength(6)])],
            'confirmPassword': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&\\\\*()\\]\\\'_+=?/<>,.;:~`{}|"[]*$'), Validators.minLength(6)])]
          }, {validator: this.areEqual})
	    })
        this.updateSSNForm = _fb.group({
            'ssn':[null, Validators.required],
        });
	}
	ngOnInit(){
        if(!localStorage.getItem('username')){this._sysMessages.setMessages('unathorized');this._router.navigateByUrl('/');}
		else{this.currentUser = localStorage.getItem('username')}
        this.getSettings();
        if(window.localStorage.getItem("waydope_ssn_required")){
            this.settings =['info','options','password','seller']
            setTimeout(()=>{
                this.watchContactInputs();
            },5)
        }
    };
    watchContactInputs(){
        $(`#ssn-settings-input`).on('keyup', function(){
            $(this).val(function (index, value) {
              console.log(value);
              return value.replace(/\W/gi, '').replace(/(.{3})/, '$1-').replace(/(.{6})/, '$1-')
            });
        })
    }
    updateSSN(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $(`#submit-settings`).fadeIn().css("display","inline-block");
        },750)
        var headers = new Headers();
		var creds = {'ssn':values.ssn};
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); 
        headers.append('Signature', window.localStorage.getItem('signature'))
  		this.updateInfoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/seller/ssn/update`, creds, {headers: headers}).subscribe(data => {
              clearTimeout(failedRequest);
              if(data.json().success){
                  this._sysMessages.setMessages('updateInfo');
                  Materialize.toast("Successfully Updated SSN", 3500, 'rounded-success');
                  window.localStorage.removeItem("waydope_ssn_required")
              } else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigateByUrl('/');
              }
              if(fadein) clearTimeout(fadein);
              $(`#submit-settings`).css({'display':'none'});
              $('.waves-ripple').remove();
              this.submitted = false;
        })
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-settings`).css({'display':'none'});
        },15000);
    }
    getSettings(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/settings`, {headers: headers}).subscribe(data => {
            if(data.json().success){
                if(data.json().email && data.json().email !== "Null"){
					this.updateSettingsForm.patchValue({email:data.json().email})
					$('#profile-email-settings').addClass('active');
                    $('#email-settings').addClass('valid');
				}
				if(data.json().firstname && data.json().firstname !== "Null"){
					this.updateSettingsForm.patchValue({firstname:data.json().firstname})
					$('#profile-firstname-settings').addClass('active');
                    $('#firstname-settings').addClass('valid');
				}
                if(data.json().city && data.json().city !== "Null"){
					this.updateSettingsForm.patchValue({city:data.json().city})
					$('#profile-city').addClass('active');
                    $('#city-settings').addClass('valid');
				}
                if(data.json().state && data.json().state !== "Null"){
					this.updateSettingsForm.patchValue({state:data.json().state})
					$('#profile-state').addClass('active');
                    $('#state-settings').addClass('valid');
				}
				if(data.json().lastname && data.json().lastname !== "Null"){
					this.updateSettingsForm.patchValue({lastname:data.json().lastname})
					$('#profile-lastname-settings').addClass('active');
                    $('#lastname-settings').addClass('valid');
				}
                if(data.json().address && data.json().address !== "Null"){
					this.updateSettingsForm.patchValue({address:data.json().address})
					$('#profile-address').addClass('active');
                    $('#address-settings').addClass('valid');
				}
                if(data.json().zipcode && data.json().zipcode !== "Null"){
					this.updateSettingsForm.patchValue({zipcode:data.json().zipcode})
					$('#profile-zipcode').addClass('active');
                    $('#zipcode-settings').addClass('valid');
				}
                if(data.json().phone_number && data.json().phone_number !== "null"){
					this.updateSettingsForm.patchValue({phone_number:data.json().phone_number})
					$('#profile-phone_number').addClass('active');
                    $('#phone_number-settings').addClass('valid');
				}
                if(data.json().show_nsfw != null && data.json().show_nsfw != "null"){
                    this.updateOptionsForm.patchValue({show_nsfw:data.json().show_nsfw})
                    let $selector = $(`#show-nsfw-${data.json().show_nsfw}`)
                    $selector.prop('checked',true);
                }
                if(data.json().hide_nsfw != null && data.json().hide_nsfw != "null"){
                    this.updateOptionsForm.patchValue({hide_nsfw:data.json().hide_nsfw})
                    let $selector = $(`#hide-nsfw-${data.json().hide_nsfw}`)
                    $selector.prop('checked',true);
                }
            } else {
				this._auth.destroySession();
				this._sysMessages.setMessages('unathorized');
				this._router.navigateByUrl('/');
			}
        })
    }
    updateInfo(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $(`#submit-settings`).fadeIn().css("display","inline-block");
        },750)
        var headers = new Headers();
		var creds = {"type":"info","firstname":values.firstname,"lastname":values.lastname,"email":values.email,"address":values.address,"zipcode":values.zipcode,"phone_number":values.phone_number,"show_nsfw":values.show_nsfw,"hide_nsfw":values.hide_nsfw};
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); 
        headers.append('Signature', window.localStorage.getItem('signature'))
  		this.updateInfoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/settings/update`, creds, {headers: headers}).subscribe(data => {
              clearTimeout(failedRequest);
              if(data.json().success){
                  this._sysMessages.setMessages('updateInfo');
                  Materialize.toast("Successfully Updated Info", 3500, 'rounded-success');
              } else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigateByUrl('/');
              }
              if(fadein) clearTimeout(fadein);
              $(`#submit-settings`).css({'display':'none'});
              $('.waves-ripple').remove();
              this.submitted = false;
        })
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-settings`).css({'display':'none'});
        },15000);
    }
    updateOptions(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $(`#submit-settings`).fadeIn().css("display","inline-block");
        },750)
        var headers = new Headers();
		var creds = {"type":"options","firstname":values.firstname,"lastname":values.lastname,"email":values.email,"address":values.address,"zipcode":values.zipcode,"phone_number":values.phone_number,"show_nsfw":values.show_nsfw,"hide_nsfw":values.hide_nsfw};
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this.updateOptionsSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/settings/update`, creds, {headers: headers}).subscribe(data => {
              clearTimeout(failedRequest);
              if(data.json().success){
                  this._sysMessages.setMessages('updateInfo');
                  Materialize.toast("Successfully Updated Options", 3500, 'rounded-success');
              } else {
                this._auth.destroySession();
				this._sysMessages.setMessages('unathorized');
				this._router.navigateByUrl('/');
              }
              if(fadein) clearTimeout(fadein);
              $(`#submit-settings`).css({'display':'none'});
              $('.waves-ripple').remove();
              this.submitted = false;
        })
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-settings`).css({'display':'none'});
        },15000);
    }
    updatePassword(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $(`#submit-settings`).fadeIn().css("display","inline-block");
        },750)
        var headers = new Headers();
		var creds = {"type":"password","current_password":values.current,"password":values.passwords.password};
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this.updatePasswordSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/settings/update`, creds, {headers: headers}).subscribe(data => {
              clearTimeout(failedRequest);
              if(data.json().success){
                  this._sysMessages.setMessages('updateInfo');
                  Materialize.toast("Successfully Updated Password", 3500, 'rounded-success');
                  $("#current-password-settings,#new-password-settings,#confirm-password-settings").removeClass('valid');
                  $("#password-signup-page, #new-password, #current-password").removeClass('valid');
                  this.updatePasswordForm.reset()
              } else if(data.json().password) {
                  this.passwordError = true;
              }
              if(fadein) clearTimeout(fadein);
              $(`#submit-settings`).css({'display':'none'});
              $('.waves-ripple').remove();
              this.submitted = false;
        })
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-settings`).css({'display':'none'});
        },15000);
    }
    private areEqual(group: FormGroup) {
        if(group.controls['password'].value === group.controls['confirmPassword'].value) return null;
        return {areEqual: true};
    }
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.updateSubscription) this.updateSubscription.unsubscribe();
        if(this.updateOptionsSubscription) this.updateOptionsSubscription.unsubscribe();
        if(this.updatePasswordSubscription) this.updatePasswordSubscription.unsubscribe();
    }
}