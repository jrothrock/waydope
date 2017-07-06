import { Injectable,EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import {BackendService} from './backend.service';
import 'rxjs/Rx';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
  prod:boolean;
  watchSession: EventEmitter<any> = new EventEmitter<any>();
  constructor(private _http: Http, private _backend: BackendService) {
    this.prod = environment.production;
  }

  register(user) {
  	return new Promise((resolve,reject) => {
  		var creds = user.email !== null? "username=" + user.username  + "&email=" + user.email + "&password=" + user.passwords.password :
                                       "username=" + user.username  + "&password=" + user.passwords.password;
      var defaultNews = ['all'];
      var defaultMusic = ['all'];
      var defaultVideos = ['all'];
  		var headers = new Headers();
      if(this.check('_cart')) headers.append('Cart', this.getCookie('_cart'))
  		headers.append('Content-Type', 'application/x-www-form-urlencoded');
  		var registerSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/auth/signup`, creds, {headers: headers}).subscribe(data => {
  			if(data.json().success){
          localStorage.setItem('token', data.json().token);
          localStorage.setItem('username',user.username);
          this.setLoggedin();
          if(registerSubscription) registerSubscription.unsubscribe();
  				resolve(true);
  			} else {
          if(registerSubscription) registerSubscription.unsubscribe();
  				reject(data.json());
  			}
  		})
  	})
  }
  checkSession(){
    if(!this.checkLoggedInState()){
      
      this.watchSession.next('session ended');
      return false;
    } else{
      return true;
    }
  }

  login(user){
  	return new Promise((resolve,reject)=>{
  		var creds = "username=" + user.username + "&password=" + user.password;
      var defaultNews = ['all'];
      var defaultMusic = ['all'];
      var defaultVideos = ['all'];
  		var headers = new Headers();
      if(this.check('_cart')) headers.append('Cart', this.getCookie('_cart'))
  		headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('X-XSRF-TOKEN', this.getCookie('X-XSRF-TOKEN'));
  		var loginSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/auth/login`, creds, {headers: headers}).subscribe(data => {
        if(data.json().success && !data.json().banned){
          this.destroySession();
          this.setLoggedin();
          localStorage.setItem("token", data.json().token)
          // this.setCookie('_waydope', data.json().token, 3);
  				window.localStorage.setItem('username', data.json().data.username);
          // window.localStorage.setItem('news_subs', JSON.stringify(defaultNews.concat(data.json().data.news_subs)));
          // window.localStorage.setItem('music_subs', JSON.stringify(defaultMusic.concat(data.json().data.music_subs)));
          // window.localStorage.setItem('video_subs', JSON.stringify(defaultVideos.concat(data.json().data.video_subs)));
          if(data.json().data.admin){
            this.setCookie('_waydope_admin', 'with_great_power_comes_great_responsibility_..._so_rm-rf_that_ish', 3);
          }
          if(data.json().data.seller){
            this.setCookie('_waydope_seller', 'randomsting', 3);
          }
          if(data.json().data.ssn_required){
            window.localStorage.setItem('waydope_ssn_required', "true");
          }
          if(loginSubscription) loginSubscription.unsubscribe();
  				resolve(true);
  			} else if (data.json().success && data.json().banned){
          if(loginSubscription) loginSubscription.unsubscribe();
          reject(data.json());
        } else if (!data.json().success){
          if(loginSubscription) loginSubscription.unsubscribe();
  				reject(data.json());
  			}
  		})
  	})
  }

  

  logout() {
    return new Promise((resolve, reject) => {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', 'Bearer ' + this.getToken());
        var logOutSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/auth/logout`,'', {headers: headers}).subscribe(data => {
            if(data.json().success){
                this.destroySession();
                if(logOutSubscription) logOutSubscription.unsubscribe();
                resolve(true);
            } else {
              // Well, it failed, so that kinda blows. We need to remove everything anyway.
              if(logOutSubscription) logOutSubscription.unsubscribe();
                this.destroySession();
                resolve(true);
            }

        })
    })
  }
  setLoggedin(){
    isLoggedInData.setLoggedIn();
  }
  checkLoggedInState(){
    if(isLoggedInData.getLoggedIn() && !this.checkToken()){
      isLoggedInData.setLoggedOut();
      return false;
    } else {
      return true;
    }
  }
  check(name){
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length == 2) return true;
      else return false;
  }
  checkToken(){
    if (localStorage.getItem("token") != null) return true
    else return false
  }
  getToken(){
    return localStorage.getItem("token");
  }
  getCookie(name){
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length == 2) return parts.pop().split(";").shift();
  }
  destroySession(){
      window.localStorage.clear();
      document.cookie = `_waydope=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/${this.prod ? ";domain=waydope.com" : ''}`;
      document.cookie = `_waydope_admin=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/${this.prod ? ";domain=waydope.com" : ''}`;
      document.cookie = `_waydope_seller=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/${this.prod ? ";domain=waydope.com" : ''}`;
      document.cookie = `X-XSRF-TOKEN=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/${this.prod ? ";domain=waydope.com" : ''}`;
      isLoggedInData.setLoggedOut();
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/${this.prod ? ";domain=waydope.com" : ''}`;
  }
}

var isLoggedInData = {
    loggedin:false,
    getLoggedIn(){
      return this.loggedin;
    },
    setLoggedIn(){
      this.loggedin = true;
    },
    setLoggedOut(){
      this.loggedin = false;
    }
}
