import { Injectable } from '@angular/core';
import { CanActivate, Router,
         ActivatedRouteSnapshot,
         RouterStateSnapshot,
         NavigationExtras }       from '@angular/router';
import { AuthService }            from './auth.service';
import { Http, Response, Headers } from '@angular/http';
import {BackendService} from './backend.service';

@Injectable()
export class AdminGuard implements CanActivate{
	constructor(private _http: Http, private _auth: AuthService, private _backend: BackendService, private _router: Router) {}
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
		if(this.checkAdmin){return true;}
	}
	checkAdmin(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		var adminGuardSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/auth/admin/check`,'', {headers: headers}).subscribe(data => {
			if(data.json().success){
				this._auth.setCookie('_waydope_admin', data.json().admin_string, 3)
				if(adminGuardSubscription) adminGuardSubscription.unsubscribe();
				return true;
			} else {
			if(adminGuardSubscription) adminGuardSubscription.unsubscribe();
			return false;
			}
		})
	}
	isAdmin(){
		if(this._auth.getCookie('_waydope_admin') === 'with_great_power_comes_great_responsibility_..._so_rm-rf_that_ish'){return true}else{return false};
	}
}
