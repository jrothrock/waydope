import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {SystemMessagesComponent} from '../system/messages/messages.component';
import {AppComponent} from '../app/app.component';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormControl
} from '@angular/forms';

declare var $;
declare var Materialize;

@Component({
  selector: 'sign-up',
  templateUrl: 'signUp.component.html',
  providers: [FormBuilder, AuthService, SystemMessagesComponent]
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  usernameError: boolean = false;
  emailError: boolean = false;
  error: boolean = false;
  locked:boolean = false;
  submitted:boolean=false;
  usernameLengthError:boolean=false;
  constructor(private _fb: FormBuilder, private _router: Router, private _auth: AuthService, private _sysMessages: SystemMessagesComponent, private _app: AppComponent) {
    this.signUpForm = _fb.group({
      'username': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_-]*$')])],
      'email': [null, Validators.pattern('[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?')],
      'passwords': _fb.group({
        'password': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&\\\\*()\\]\\\'_+=?/<>,.;:~`{}|"[]*$'), Validators.minLength(6)])],
        'confirmPassword': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&\\\\*()\\]\\\'_+=?/<>,.;:~`{}|"[]*$'), Validators.minLength(6)])]
      }, {validator: this.areEqual})
    });
  }

  ngOnInit() {
  }

  watchInputs(type){
    if(type === 'username'){
      $("#username-signup-page").on('keyup', ()=>{
        
        this.usernameError = false
        $("#username-signup-page").unbind('keyup');
      })
    } else {
      $("#email-signup-page").on('keyup',()=>{
        this.emailError = false;
        $("#email-signup-page").unbind('keyup');
      })
    }
  }

  onSubmit(User){
    this.submitted = true;
    let fadein = setTimeout(()=>{
      $('#submit-signup').fadeIn().css("display","inline-block");
    },750)
    this._auth.register(User)
      .then(data => {
        if(data){
          clearTimeout(failedRequest);
          this._app.setLoggedIn();
          this._sysMessages.setMessages('registered'); //registered message
          // this._sysMessages.setMessages('registered'); // Will work on at another point
          this._router.navigateByUrl('/');
        } 
      }).catch(e => {
        
        clearTimeout(failedRequest);
        if(fadein) clearTimeout(fadein);
        this.submitted = false;
        $("#submit-signup").css({'display':'none'});
        $('.waves-ripple').remove();
        if(e.errors === "username"){
          this.usernameError = true;
          this.watchInputs("username")
        }
        else if(e.errors === "locked"){
          this._sysMessages.setMessages('locked'); 
        }
        else if (e.errors === "username-length"){
          this.usernameLengthError = true;
          this.watchInputs("username")
        }
        else if (e.errors === "email"){
          this.emailError = true;
          this.watchInputs("email");
        }
        else if (e.errors && e.both){
          this.usernameError = true;
          this.emailError = true;
          this.watchInputs("email");
          this.watchInputs("username");
        }
        else if (!e.error){
          this.error = true;
        }
      });
      let failedRequest = setTimeout(()=>{
        $('.waves-ripple').remove();
        this.submitted = false;
        Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
        $('#submit-signup').css({'display':'none'});
      },15000);
	}	

  private areEqual(group: FormGroup) {
    if(group.controls['password'].value === group.controls['confirmPassword'].value) return null;
    return {areEqual: true};
  }
}

