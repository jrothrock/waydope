import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
declare var $;


@Component({
  selector: 'admin_posts_modal',
  template: ``,
  providers: [AuthService]
})
export class PayPalVerifyComponent implements OnInit {
    subscription:any;
    constructor(private _http: Http, private _backend: BackendService, private _auth: AuthService){}
    ngOnInit(){
        console.log(window.location.href);
        let code = window.location.href.split('?').length && window.location.href.split('?')[1].split('&')[0].split('=').length ? window.location.href.split('?')[1].split('&')[0].split('=')[1] : null;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'code': code}
        this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/seller/paypal/update`, creds, {headers: headers}).subscribe(data => {
            if(data.json().success){
            }
        });
        setTimeout(()=>{
            window.close();
        },10)
    }

    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
    }
}