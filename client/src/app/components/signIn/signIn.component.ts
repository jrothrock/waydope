import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {SystemMessagesComponent} from '../system/messages/messages.component';
import {AppComponent} from '../app/app.component';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

declare var $;
declare var Materialize;

@Component({
  selector: 'sign-in',
  templateUrl: 'signIn.component.html',
  providers: [FormBuilder, AuthService, SystemMessagesComponent]
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  error: boolean = false;
  banned:boolean = false;
  submitted:boolean=false;

  constructor(private _fb: FormBuilder, private _router: Router, private _auth: AuthService, private _activatedRoute: ActivatedRoute, private _sysMessages: SystemMessagesComponent, private _app: AppComponent) {
    
    this.signInForm = _fb.group({
      'username': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')])],
      'password': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&*()_+=?/<>,.;:~`{}|]*$'), Validators.minLength(6)])],
    })
  }

  ngOnInit() {
  }

  onSubmit(User){
    this.submitted = true;
    let fadein = setTimeout(()=>{
      // let button = $("#submit-login-button");
      // let positions = button.position();
      // 
      // let width = button.width();
      // let inner_width = window.innerWidth > 768 ? 10 : 20;
      // $("#submit-login").css({left:(positions.left + (width * 2) + inner_width ), top: positions.top});
      $('#submit-login').fadeIn().css("display","inline-block");
    },750)
    this._auth.login(User)
      .then(data => {
        if(data){
          clearTimeout(failedRequest);
          this._app.setLoggedIn();
          this._sysMessages.setMessages('signedin'); 
          // signedin Message
          // this._messages.setMessages('signedin');
          this._router.navigateByUrl('/');
        }
      }).catch(e => {
       this.submitted = false;
       if(fadein) clearTimeout(fadein);
       $("#submit-login").css({'display':'none'});
       $('.waves-ripple').remove();
       clearTimeout(failedRequest);
       if(e.banned){
         this.banned = true;
       } else {
         this.error = true;
         $("#username-signin-page, #password-signin-page").on('keyup', ()=>{
           this.error = false;
           $("#username-signin-page, #password-signin-page").unbind('keyup')
         })
       }
   });
   let failedRequest = setTimeout(()=>{
        $('.waves-ripple').remove();
        this.submitted = false;
        Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
        $('#submit-login').css({'display':'none'});
    },15000);
  }  

}

interface AuthAttrs {
  email: string;
  password: string;
}
