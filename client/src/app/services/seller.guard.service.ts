import { Injectable } from '@angular/core';
import { CanActivate, Router,
         ActivatedRouteSnapshot,
         RouterStateSnapshot,
         NavigationExtras }       from '@angular/router';
import { AuthService }            from './auth.service';
import { Http, Response, Headers } from '@angular/http';
import {BackendService} from './backend.service';

@Injectable()
export class SellerGuard implements CanActivate{
	constructor(private _http: Http, private _backend:BackendService, private _auth: AuthService, private _router: Router) {}
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
		if(this.checkSeller){return true;}
	}
	checkSeller(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		var sellerGuardSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/auth/seller/check`,'', {headers: headers}).subscribe(data => {
			if(data.json().success){
				this._auth.setCookie('_waydope_seller', data.json().seller_string, 3)
				if(sellerGuardSubscription) sellerGuardSubscription.unsubscribe();
				return true;
			} else {
			if(sellerGuardSubscription) sellerGuardSubscription.unsubscribe();
			return false;
			}
		})
	}
	isSeller(){
		if(this._auth.getCookie('_waydope_seller')){return true}else{return false};
	}
}
