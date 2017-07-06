import { Component, OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {BackendService} from '../../../services/backend.service';

declare var $;

@Component({
  selector: 'admin_main',
  templateUrl: 'admin.main.component.html',
})

export class AdminMainComponent implements OnInit {
	subscription:any;

	logged_in:number=0;
	total_users:number=0;
	total_humans:number=0;
	total_bots:number=0;
	total_admins:number=0;
	total_banned:number=0;

	news_flags:number=0;
	music_flags:number=0;
	video_flags:number=0;
	apparel_flags:number=0;
	technology_flags:number=0;

	comment_reports:number=0;
	news_reports:number=0;
	song_reports:number=0;
	video_reports:number=0;
	apparel_reports:number=0;
	technology_reports:number=0;

	new_comments:number=0;
	new_news:number=0;
	new_songs:number=0;
	new_videos:number=0;
	new_apparel:number=0;
	new_technology:number=0;

	total_comments:number=0;
	total_news:number=0;
	total_songs:number=0;
	total_videos:number=0;
	total_apparel:number=0;
	total_technology:number=0;
	constructor(private _http: Http, private _backend: BackendService, private _router: Router, private _sysMessages:SystemMessagesComponent, private _auth:AuthService){}
	ngOnInit(){
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/main`, {headers: headersInit}).subscribe(data => {
			
			if(data.json().success) {
				
				this.logged_in = data.json().users.logged_in;
				this.total_users = data.json().users.total_users;
				this.total_admins = data.json().users.total_admins;
				this.total_banned = data.json().users.total_banned;
				this.total_humans = data.json().users.total_humans;
				this.total_bots = data.json().users.total_bots;

				this.news_flags = data.json().flags.news;
				this.music_flags = data.json().flags.songs;
				this.video_flags = data.json().flags.videos;
				this.apparel_flags = data.json().flags.apparel;
				this.technology_flags = data.json().flags.apparel;

				this.comment_reports = data.json().reports.comments;
				this.news_reports = data.json().reports.news;
				this.song_reports = data.json().reports.songs;
				this.video_reports = data.json().reports.videos;
				this.apparel_reports = data.json().reports.apparel;
				this.technology_reports = data.json().reports.technology;

				this.new_comments = data.json().new.comments;
				this.new_news = data.json().new.news;
				this.new_songs = data.json().new.songs;
				this.new_videos = data.json().new.videos;
				this.new_apparel = data.json().new.apparel;
				this.new_technology = data.json().new.technology;

				this.total_comments = data.json().totals.comments;
				this.total_news = data.json().totals.news;
				this.total_songs = data.json().totals.songs;
				this.total_videos = data.json().totals.videos;
				this.total_apparel = data.json().totals.apparel;
				this.total_technology = data.json().totals.technology;
	
				this.displayAll();
			} else {
				this._sysMessages.setMessages('unathorized');
				this._router.navigate(['/']);
			}
		})
	}
	displayAll(){
		$("#admin-main-content").css({'opacity':'1'})
	}
	ngOnDestroy() {
    // prevent memory leak when component destroyed
    if(this.subscription) this.subscription.unsubscribe();
  	}
}
