import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import 'angular2-materialize';
import {BackendService} from '../../../services/backend.service';

declare var $;
declare var Materialize;
declare var Stripe;
declare var paypal;

var typeData = {
	type: '',
	setTypes:function(type=null){
		this.type = type;
	},
	getTypes:function(){
		return this.type;
	},
	clearTypes:function(){
		this.type = null;	
	}

}


@Component({
  selector: 'modal_update',
  templateUrl: 'modal.update.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class ModalUpdateComponent implements OnInit {
    updateForm: FormGroup;
    paymentForm: FormGroup;
    subscription:any;
    stripeSubscription:any;
    paypalSubscription:any;
    currentUser:string;
    submitted:boolean=false;
    businessEntity:boolean=false;
    accountBank:boolean;
    addedScipts:boolean;
    cardInvalid:boolean;
    token:string;
    cardType:string;
    is_prod:boolean;
    polling:boolean;
    pollCount:number=0;
    retryPaypal:boolean=false;
    uploadDocument:boolean=false;
    amz_key:any;
    policy:any;
    signature:any;
    store_dir:any;
    upload_time:any;
    upload_date:any;
    key:any;
    userId:any;
    file_name:any;
    cardError:boolean=false;
    insubmit:boolean=false;
    constructor(private _fb: FormBuilder, private _backend: BackendService, private _http: Http, private _router: Router, private _auth :AuthService, private _sysMessages: SystemMessagesComponent){
        this.updateForm = _fb.group({
            'firstname': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-.]*$')])],
            'lastname': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-.]*$')])],
            'email': [null, Validators.required],
            'address': [null, Validators.required],
            'address_two': [null],
            'phone': [null, Validators.required],
            'date': [null, Validators.required],
            'business_name': [null],
            'business_tax_id': [null],
            'ssn':[null],
            'zip': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
            'city': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-.]*$')])],
            'state': [null, Validators.required],
        });
        this.paymentForm = this._fb.group({
            'number': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9 ]*$'),  Validators.maxLength(19),  Validators.minLength(19)])],
            'holder': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-. ]*$')])],
            'month': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
            'year': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
            'security': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
            'zip': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
            'routing': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
            'account': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
        })
    }
    ngOnInit(){
        $(".update-info-modal-contact-form-input").prop('disabled','disabled');
        this.is_prod = this._backend.PRODUCTION;
    }

    watchExit(){
        $('.dark-overlay, #close-update-modal').click(()=>{
            $('body').css({'width':'initial', 'overflow':'initial'});
            // may want to change from fades.
            $('#dark-overlay').fadeOut(function(){
                $(this).remove();
            });
            $('#update-modal').fadeOut()
            $(".dark-overlay, #close-update-modal").unbind( "click" );
            $("#update-modal").unbind( "click" );
            this._router.navigateByUrl(`/${typeData.getTypes()}`)
            this._sysMessages.setMessages('needInfo')
        });
        $('#update-modal').click(()=>{
            event.stopPropagation();
        })
    }
    getInfo(){
        this.currentUser = localStorage.getItem('username') || '';
        var headersInit = new Headers();
        headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/info`,{headers: headersInit}).subscribe(data => {
            if(data.json().success){
                if(data.json().email) this.updateForm.patchValue({genre:data.json().email});
                if(data.json().address) this.updateForm.patchValue({genre:data.json().address});
                if(data.json().address_two) this.updateForm.patchValue({genre:data.json().address_two});
                if(data.json().zip) this.updateForm.patchValue({genre:data.json().zip});
                if(data.json().firstname) this.updateForm.patchValue({genre:data.json().firstname});
                if(data.json().lastname) this.updateForm.patchValue({genre:data.json().lastname});
                if(data.json().phone_number) this.updateForm.patchValue({genre:data.json().phone_number});
                if(data.json().city) this.updateForm.patchValue({genre:data.json().city});
                if(data.json().state) this.updateForm.patchValue({genre:data.json().state});
            }
        });
    }
    locationChange(value){
        if(value === 'begin'){
            $(`#seller-sign-up-bar`).get(0).className = 'contact';
            $(`#update-info-modal-begin`).slideUp();
            $(`#update-info-modal-contact`).slideDown()
            this.watchContactInputs();
        }
        else if(value === 'contact'){
            this.updateInfo(this.updateForm.value)
        }
        else if(value === 'card-bank'){
            this.updateCardBank()
        }
        else if(value === 'paypal'){

        } else {

        }

    }
    locationChangeBackward(value){
        if(value === 'begin'){
            $(`#seller-sign-up-bar`).get(0).className = 'begin';
            $(`#update-info-modal-contact`).slideUp()
            $(`#update-info-modal-begin`).slideDown();
        } else if(value === 'contact'){
            $(`#seller-sign-up-bar`).get(0).className = 'contact';
            $(`#update-info-modal-card-bank`).slideUp()
            $(`#update-info-modal-contact`).slideDown();
        } else if(value === 'card-bank'){
            $(`#seller-sign-up-bar`).get(0).className = 'card-bank'
            $(`#update-info-modal-paypal`).slideUp();
            $(`#update-info-modal-card-bank`).slideDown();
        }
    }
    watchCardType(){
      // this is really ugly, may want to either use stripe's version or use a case statement with fall through.
      $(`#number-update-form`).on('keyup', ()=>{
        let val = $(`#number-update-form`).val().toString();
        let type,string;
        if(val.length && val.length < 5 ){
          if(val[0]==='4'){
            type = 'visa';
          } else if(val[0] === '5'){
              type = 'master';
              if(val.length > 1 && (val[1] != '1' || val[1] != '2' || val[1] != '3' || val[1] != '4' || val[1] != '5')){
                type=null;
              } 
          } else if(val[0] === '3'){
              type = 'amex';
              if(val.length > 1  && (val[1] != '4' && val[1] != '7')){
                type = null;
              }
          } else if(val[0] === '6'){
              type = 'discover'
              let check;
              if(val.length > 1 && (val[1] != '0' && val[1] != '5' && val[1] != '4')){
                type = null;
              } else if(val.length > 1 && (val[1] === '4' || val[1] === '0')){
                // continue checking
               check = true; 
              }
              if(type === 'discover' && check && val.length > 2 && ((val[2] != '4' && val[1] === '4') || (val[2] != '1' && val[1]==='0'))){
                type = null;
                check = false;
              } else if(type === 'discover' && val.length > 2 && check && val[2] === '4'){
                check = false
              }
              if(type === 'discover' && check && val.length > 3 && val[3]!='1'){
                type = null;
              }
          } 
        } else if(!val.length && this.cardType){
            type = null;
          }
          if(type != this.cardType && val.length < 5){
            if(this.cardType) $(`#${this.cardType}-logo`).fadeOut();
            if(type) $(`#${type}-logo`).fadeIn();
            this.cardType = type;
          }
      });
    }
    watchCard(){
      $(`#number-update-form,#month-update-form,#year-update-form,#security-update-form`).on('keyup', ()=>{
        this.cardInvalid = false;
      })
    }
    watchContactInputs(){
        $(`#ssn`).on('keyup', function(){
            $(this).val(function (index, value) {
              return value.replace(/\W/gi, '').replace(/(.{3})/, '$1-').replace(/(.{6})/, '$1-')
            });
        })
        $(`#phone-number-update-modal`).on('keyup', function(){
            $(this).val(function (index, value) {
              return value.replace(/\W/gi, '').replace(/(.{3})/, '$1-').replace(/(.{7})/, '$1-')
            });
        })
    }
    watchCardInputs(){

      let component = this;
      let m,y;
      $(`#month-update-form,#year-update-form,#security-update-form,.holder-update-form,#zip-update-form,#number-update-form`).on('keyup', function(){
        let type = $(this).data('type');
        
        switch(type){
          case 'holder':
            $('.credit-card-box .card-holder div').html($(this).val());
            break;
          case 'number':
            $('.credit-card-box .number').html($(this).val())
            $(this).val(function (index, value) {
              return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');
            });
            break;
          case 'month':
            m = $('#month-update-form').val();
            m = (m < 10 && m[0] != 0) ? '0' + m : m;
            y = $('#year-update-form').val();
            $('.card-expiration-date div').html(m + '/' + y);
            break;
          case 'year':
            m = $('#month-update-form').val();
            m = (m < 10 && m[0] != 0) ? '0' + m : m;
            y = $('#year-update-form').val();
            $('.card-expiration-date div').html(m + '/' + y);
            break;
          case 'security':
            $('.cvc div').html($(this).val());
            break;
        }
      });
      $('#security-update-form').on('focus', function(){
        $('.credit-card-box').addClass('hover');
      }).on('blur', function(){
        $('.credit-card-box').removeClass('hover');
      });
    }
    updateCardBank(){
        let component = this;
        let key = this._backend.PRODUCTION ? "pk_live_YkhyJSZtzYAbhKzfkYEYPmuu" : "pk_test_rDbUqm3vwXDwL7d9ITAtj5TF"
        Stripe.setPublishableKey(key);
        if(this.accountBank){
            Stripe.bankAccount.createToken({
                country: 'us',
                currency: 'usd',
                routing_number: this.paymentForm.get("routing").value,
                account_number: this.paymentForm.get("account").value,
                account_holder_name: this.paymentForm.get("holder").value,
                account_holder_type: this.businessEntity ? 'company' : 'individual'
            }, function stripeResponseHandler(status, response) {
                console.log(response)
                if (response.error) {
                    component.cardInvalid = true;
                } else {
                    component.token = response.id;
                    component.updateStripe();
                    // setTimeout(()=>{
                    //     component.setPaypal();
                    // },10)
                }
            })
        } else {
            Stripe.card.createToken({
                number: this.paymentForm.get("number").value.replace(/ /g,''),
                cvc: this.paymentForm.get("security").value,
                exp_month: this.paymentForm.get("month").value,
                exp_year: this.paymentForm.get("year").value,
                name: this.paymentForm.get("holder").value,
                address_zip: this.paymentForm.get("zip").value,
                currency: 'usd'
            }, function stripeResponseHandler(status, response) {
                console.log(response)
                if (response.error) {
                    component.cardInvalid = true;
                } else {
                    component.token = response.id;
                    component.updateStripe();
                    //  setTimeout(()=>{
                    //     component.setPaypal();
                    // },10)
                }
            });
        }
    }
    updateStripe(){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $('#submit-update-modal-card-bank').fadeIn();
        },750)
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let body = {'token':this.token}
        console.log(body);
  		this.stripeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/seller/stripe/update`, body, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
            if(data.json().success){
                if(data.json().verification_document){
                    this.uploadDocument = true;
                    this.amz_key =data.json().key;
                    this.policy =data.json().policy;
                    this.signature =data.json().signature;
                    this.store_dir =data.json().store;
                    this.upload_time =data.json().time;
                    this.upload_date =data.json().time_date;
                    this.userId =data.json().user_id;
                    this.file_name = `verification_${this.userId}.png`
                    this.key = `${this.store_dir}/${this.file_name}`;
                    setTimeout(()=>{
                        this.photoUpload();
                    },20)
                } else {
                    $(`#seller-sign-up-bar`).get(0).className = 'paypal';
                    $(`#update-info-modal-card-bank`).slideUp();
                    $(`#update-info-modal-paypal`).slideDown()
                }
            } else if(data.json().credit_card){
                Materialize.toast("Card Must Be Debit.", 3500, 'rounded-failure');
                this.cardInvalid = true;
            }  else if (data.json().error) {
                // this.unsupported = true;
            } else if(data.json().status === 401){
                // this._modal.setModal();
            } else {
                // this.error = true;
            }
            if(fadein) clearTimeout(fadein);
            $('#submit-update-modal-card-bank').css({'display':'none'});
            $('.waves-ripple').remove();
            this.submitted = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $('#submit-update-modal-card-bank').css({'display':'none'});
        },15000);
    }
    pollPaypal(restart=false){
        if(!this.polling || restart){
            if(this.retryPaypal) this.retryPaypal = false;
            if(!restart) window.open(`https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/authorize?client_id=AcpZuoNp0lWmZvHkoUjLA8NH3aRp7HLKXpyu69sPKj-G2JaeiORtzpwoNBPxbJbRO9ebUZGflTxmmqvI&response_type=code&scope=openid&redirect_uri=${!this.is_prod ? 'http%253A%252F%252Flocalhost:4200/paypal/verify' : 'https%253A%252F%252Fwaydope.com/paypal/verify'}&nonce=18564110&newUI=Y`, 'paypal-login', 'width=400,height=500');
            this.polling = true;
            this.pollCount += 1;
            this.currentUser = localStorage.getItem('username') || '';
            var headersInit = new Headers();
            headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
            this.paypalSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/seller/paypal`,{headers: headersInit}).subscribe(data => {
                if(data.json().success){
                    if(data.json().has_paypal){
                        $(`#seller-sign-up-bar`).get(0).className = 'success';
                        $(`#update-info-modal-paypal`).slideUp();
                        $(`#update-info-modal-success`).slideDown()
                        setTimeout(()=>{
                            this.closeModal();
                        },5000)
                    }else{
                        if(this.pollCount < 20){
                            this.paypalSubscription.unsubscribe();
                            setTimeout(()=>{
                                this.pollPaypal(true);
                            },3000)
                        } else {
                            this.polling = false;
                            this.retryPaypal = true;
                            this.pollCount = 0;
                            this.paypalSubscription.unsubscribe();
                        }
                    }
                } else {
                    // needs to implemented tho.
                }
            });
        }
    }
    // setPaypal(){
    //     paypal.use( ['login'], function (login) {
    //         login.render ({
    //             "appid":"AcpZuoNp0lWmZvHkoUjLA8NH3aRp7HLKXpyu69sPKj-G2JaeiORtzpwoNBPxbJbRO9ebUZGflTxmmqvI",
    //             "authend":"sandbox",
    //             "scopes":"openid",
    //             "containerid":"lippButton",
    //             "locale":"en-us",
    //             "returnurl":"https://waydope.com"
    //         });
    //     });
    // }
    closeModal(){
        $('body').css({'width':'initial', 'overflow':'initial'});
            // may want to change from fades.
        $('#dark-overlay').fadeOut(function(){
            $(this).remove();
        });
        $('#update-modal').fadeOut()
        $(".dark-overlay, #close-update-modal").unbind( "click" );
        $("#update-modal").unbind( "click" );
    }
    triggerInputClick(){
        $(`#photo-upload-modal-update`).trigger('click');
    }
    photoUpload(){
       var self = this;
       $(`#photo-upload-modal-update`).fileupload({
        url: `https://${self._backend.BUCKET}.s3.amazonaws.com`,
        dataType: 'json',
        sequentialUploads: true,
        add: function (e, data) {
            // data.context = $('<p/>').text('Uploading...').appendTo(document.body);
            //test
            data.submit();
        },
        submit: function (e, data) {
          data.formData = {key:`${self.store_dir}/${self.file_name}`, "Policy":self.policy,"X-Amz-Signature":self.signature,"X-Amz-Credential":`${self.amz_key}/${self.upload_date}/us-west-2/s3/aws4_request`,"X-Amz-Algorithm":"AWS4-HMAC-SHA256", "X-Amz-Date":self.upload_time};
        },
        progress: (e, data) => {
          let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
          var progress = Math.floor(((parseInt(data.loaded)*0.9)  / (parseInt(data.total))) * 100);
          $(`#inner-progress-modal-update`).css({'transform':`translateX(${progress}%)`});
          $(`#progress-text-modal-update`).text(progress);
        },
        done: function (e, data) {
            // $.each(data.result.files, function (index, file) {
            //     $('<p/>').text(file.name).appendTo(document.body);
            // });
            $(`#inner-progress-modal-update`).css({'transform':`translateX(100%)`});
            $(`#progress-text-modal-update`).text(100);
            self.hasUploaded();
        }
      });    
    }
    hasUploaded(){
        let body = {"uploaded":true}
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/seller/verify`, body, {headers: headers}).subscribe(data => {
              if(data.json().success){
                this.uploadDocument = false;
                $(`#seller-sign-up-bar`).get(0).className = 'paypal';
                $(`#update-info-modal-card-bank`).slideUp();
                $(`#update-info-modal-paypal`).slideDown()
              }
        });
    }
    updateInfo(values){
        this.submitted = true;
        let fadein = setTimeout(()=>{
            $('#submit-update-modal-contact').fadeIn();
        },750)
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let body = {'email':values.email,'is_business':this.businessEntity,'ssn':values.ssn,'ein':values.business_tax_id,'business_name':values.business_name,'address':values.address,'zip':values.zip,'firstname':values.firstname,'lastname':values.lastname,'phone':values.phone,'city':values.city,'state':values.state,'dob':values.date}
        console.log(body);
  		this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/seller/info/update`, body, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
            if(data.json().success){
                $(`#seller-sign-up-bar`).get(0).className = 'card-bank';
                $(`#update-info-modal-contact`).slideUp();
                $(`#update-info-modal-card-bank`).slideDown()
                this.addScripts();
            } else if (data.json().country) {
                Materialize.toast("We are currently only accepting sellers in the United States. Sorry about that.", 6000, 'rounded-failure');
                $(`#close-update-modal`).trigger('click');
                // this.unsupported = true;
            } else if(data.json().status === 401){
                // this._modal.setModal();
            } else {
                // this.error = true;
            }
            if(fadein) clearTimeout(fadein);
            $('#submit-update-modal-contact').css({'display':'none'});
            $('.waves-ripple').remove();
            this.submitted = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.submitted = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $('#submit-update-modal-contact').css({'display':'none'});
        },15000);
    }

    changeEntity(value){
        this.businessEntity = value === 'business' ? true : false;
        $(".update-info-modal-contact-form-input").prop('disabled',false);
        $("#update-info-modal-contact-form").addClass("active-form");
        setTimeout(()=>{
            console.log(this.updateForm.get("business_name").value);
            if(value === 'business' && this.updateForm.get("business_name").value){$(`#profile-business_name`).addClass('active'); $(`#business_name`).addClass('valid');}
            if(value === 'business' && this.updateForm.get("business_tax_id").value){$(`#profile-business_tax_id`).addClass('active'); $(`#business_tax_id`).addClass('valid');}
        },5)
    }

    addScripts(){
      if(!this.addedScipts){
        this.loadScript("https://js.stripe.com/v2/", ()=>{});
        // this.loadScript("https://www.paypalobjects.com/js/external/api.js", ()=>{});
      }
      this.addedScipts = true;
    }

    loadScript( url, callback ) {
      let script = document.createElement( "script" )
      script.type = "text/javascript";
      script.async = true;
      script.onload = function() {
          callback();
      };
      script.src = url;
      document.getElementsByTagName( "head" )[0].appendChild( script );
    }

    changeAccount(value){
        setTimeout(()=>{
            if(value === 'bank'){
                $(`#update-info-modal-card-form`).removeClass('active-form');
                $(`#update-info-modal-bank-form`).addClass('active-form')
                if(this.paymentForm.get("routing").value) $(`#routing-label`).addClass('active');
                if(this.paymentForm.get("account").value) $(`#account-label`).addClass('active');
            } else {
                $(`#month-update-form,#year-update-form,#security-update-form,.holder-update-form,#zip-update-form,#number-update-form`).unbind();
                $(`#update-info-modal-bank-form`).removeClass('active-form')
                $(`#update-info-modal-card-form`).addClass('active-form');
                this.watchCardInputs();
                this.watchCardType();
            }
        },10)
        this.accountBank = value === 'bank' ? true : false;
    }

    public setBox(type){ 
        // may want to change from fades.
        $('#update-modal').fadeIn()
        $('body').css({'width':window.innerWidth, 'overflow':'hidden'});
        $('body').append(`<div id='dark-overlay' class='dark-overlay' style='z-index:1002;display:block;opacity:0.5;'></div>`)
        typeData.setTypes(type);
        setTimeout(()=>{
            this.watchExit();
            this.getInfo();
            // this.magnify();
        },250);
    }

    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.stripeSubscription) this.stripeSubscription.unsubscribe();
        if(this.paypalSubscription) this.paypalSubscription.unsubscribe();
    }

}
