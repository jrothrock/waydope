import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {SystemMessagesComponent} from '../system/messages/messages.component';
import {AuthService} from '../../services/auth.service';
import 'angular2-materialize';

declare var $;
declare var Materialize;

var urlData = {
	where: '',
	category: '',
	subcategory: '',
	url: '',
	setUrls:function(where=null,category=null,subcategory=null,url=null){
		this.where = where;
		this.category = category;
		this.subcategory = subcategory;
		this.url = url;
	},
	getUrls:function(){
		return [this.where,this.category,this.subcategory,this.url]
	},
	clearUrls:function(){
		this.where = null;
		this.category = null;
		this.subcategory = null;
		this.url = null;		
	}

}


@Component({
  selector: 'modal',
  templateUrl: 'modal.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class ModalComponent implements OnInit {
	@Output() setLoggedIn = new EventEmitter();
	signUpForm: FormGroup;
	signInForm: FormGroup;
	subscription:any;
	banned:boolean=false;
	error:boolean=false;
	emailError:boolean=false;
	usernameError:boolean=false;
	locked:boolean=false;
	cart:boolean=false;
	submitted:boolean=false;
	// where:string;
	// category:string;
	// subcategory:string;
	// url:string;
	constructor(private _fb: FormBuilder, private _router: Router, private _auth :AuthService, private _sysMessages: SystemMessagesComponent){
		this.signInForm = _fb.group({
	      'username': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')])],
	      'password': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&*()_+=?/<>,.;:~`{}|]*$'), Validators.minLength(6)])],
	    })

	    this.signUpForm = _fb.group({
	      'username': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')])],
	      'email': [null, Validators.pattern('[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?')],
	      'passwords': _fb.group({
	        'password': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&*()_+=?/<>,.;:~`{}|]*$'), Validators.minLength(6)])],
	        'confirmPassword': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-!@#$%^&*()_+=?/<>,.;:~`{}|]*$'), Validators.minLength(6)])]
	      }, {validator: this.areEqual})
	    });
	};
	ngOnInit(){
		$('.modal').modal();
	};
	public setModal(where=null,category=null,subcategory=null,url=null){
		//so angular2 doesn't like this. Why? I don't know. All values passed in above are outside Zone's subscription, or something - a service with a subscription doesn't work either - they will work in this function
    // but even with setting this - ie. this.where = where - other functions will record the value as null. Therefore, the closure above is used to get around angular. Check the console.log comments for more info.
		if(category==='cart'){
			$('.close-modal').css({'display':'none'});
			$(`.guest-continue`).css({'display':'initial'});
			category = null;
			setTimeout(()=>{
				this.watchModalLeave();
			},300	)
		}
		urlData.setUrls(where,category,subcategory,url)
		$('#modal1').modal('open');
		$('ul.tabs').tabs();
		let width = ((window.innerWidth*.55)/2)
		$('#modal1 > ul > .indicator').css({'right':width,'left':0});
	}

	watchModalLeave(){
		$('html').on('click',()=>{
			this._router.navigateByUrl('/cart#shipping');
			$('html').unbind();
			$('#modal1').unbind();
		})
		$('#modal1').on('click',()=>{
			event.stopPropagation();
		})
	}
	watchInputs(type){
    if(type === 'username'){
				$("#modal-signup-username").on('keyup', ()=>{
					
					this.usernameError = false
					$("modal-signup-username").unbind('keyup');
				})
			} else {
				$("#modal-signup-email").on('keyup',()=>{
					this.emailError = false;
					$("#modal-signup-email").unbind('keyup');
				})
			}
		}
	
	logIn(User){
			this.submitted = true;
			let fadein = setTimeout(()=>{
            $('#submit-modal-login').fadeIn();
      },750)
	    this._auth.login(User)
	      .then(data => {
	        if(data){
						// -- these still show null
						clearTimeout(failedRequest);
	       	  $('#modal1').modal('close');
	       	  this.setLoggedIn.emit();
	          this._sysMessages.setMessages('signedin');
						
						let urls = urlData.getUrls();
						let where = urls && urls[0] ? urls[0] : null;
						let category = urls && urls[1] ? urls[1] : null;
						let subcategory = urls && urls[2] ? urls[2] : null;
						let url = urls && urls[3] ? urls[3] : null;
						// only switch on certain routes. No need to switch on submit forms, but stuff like home (where votes and hearts need to be changed) should be reloaded.
						if(where){
							if(url){
	          		this._router.navigate(['/switch', where, category, subcategory, url], { skipLocationChange: true });
							} else if(subcategory && !url){
								this._router.navigate(['/switch', where, category, subcategory], { skipLocationChange: true });
							} else if(category && !subcategory && !url){
								this._router.navigate(['/switch', where, category], { skipLocationChange: true });
							} else {
								this._router.navigate(['/switch', where], { skipLocationChange: true });
							}
							urlData.clearUrls();
						}
	        }
	      }).catch(e => {
					if(fadein) clearTimeout(fadein);
          $('#submit-modal-login').css({'display':'none'});
          $('.waves-ripple').remove();
          this.submitted = false;
					clearTimeout(failedRequest);
	        
	       if(e.banned){
	         this.banned = true;
	       } else {
	         this.error = true;
					 $("#modal-signin-username, #modal-signin-password").on('keyup', ()=>{
							this.error = false;
							$("#modal-signin-username, #modal-signin-password").unbind('keyup')
						})
	       }
	   });

	  let failedRequest = setTimeout(()=>{
				$('.waves-ripple').remove();
				this.submitted = false;
				Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
				$('#submit-modal-login').css({'display':'none'});
		},15000);
	} 
	closeModal(){
		$('#modal1').modal('close');
	}
	guestCheckout(){
		this.cart = false;
		$('.close-modal').css({'display':'initial'});
		$('#modal1').modal('close');
		$(`html`).unbind();
		this._router.navigateByUrl('/cart#shipping');
		setTimeout(()=>{
			$(`.guest-continue`).css({'display':'none'});
		},300)
	}
  signUp(User){
			this.submitted = true;
			setTimeout(()=>{
            $('#submit-modal-signup').fadeIn();
      },750)
	    this._auth.register(User)
	      .then(data => {
	        if(data){
						clearTimeout(failedRequest);
	       	  $('#modal1').modal('close');
	       	  this.setLoggedIn.emit();
	          this._sysMessages.setMessages('registered');
						let urls = urlData.getUrls();
						let where = urls && urls[0] ? urls[0] : null;
						let category = urls && urls[1] ? urls[1] : null;
						let subcategory = urls && urls[2] ? urls[2] : null;
						let url = urls && urls[3] ? urls[3] : null;
						// only switch on certain routes. No need to switch on submit forms, but stuff like home (where votes and hearts need to be changed) should be reloaded.
						if(where){
	          	this._router.navigate(['/switch', where, category, subcategory, url]);
							urlData.clearUrls();
						}
	        } 
	      }).catch(e => {
					clearTimeout(failedRequest);
	        if(e.errors === "username"){
	          this.usernameError = true;
						this.watchInputs("username")
	        }
	        else if(e.errors === "locked"){
	          this.locked = true;
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
				$('#submit-modal-signup').css({'display':'none'});
			},15000);
	}	

	private areEqual(group: FormGroup) {
	    if(group.controls['password'].value === group.controls['confirmPassword'].value) return null;
	    return {areEqual: true};
	  }
}
