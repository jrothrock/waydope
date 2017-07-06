import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../../services/auth.service';
import {BackendService} from '../../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

@Component({
  selector: 'admin_video_details',
  templateUrl: 'admin.video.details.component.html',
  providers:[FormBuilder, AuthService]
})

export class AdminVideoDetailsComponent implements OnInit {
	updateVideo: FormGroup;
	id:any;
	title:string;
	category:string;
	description:string;
	link:string;
	submitted_by:string;
	error:boolean;
	powers = ['electronic','hip-hop','house','trap'];

	constructor(private _http: Http, private _backend: BackendService, private _fb: FormBuilder, private _router: Router, private _route: ActivatedRoute, private _auth:AuthService){
		this.updateVideo = this._fb.group({
	      'title': [null, Validators.required],
	      'category': [null, Validators.required],
	      'description': [null],
	      'link': [null, Validators.required]
	    })
	};
	ngOnInit(){
		this._route.params.subscribe(params => {this.id = Number.parseInt(params['id']);});
		
		var headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		headersInit.append('id', this.id);
		
		this._http.get(`${this._backend.SERVER_URL}/api/v1/admin/video`,{headers: headersInit}).subscribe(data => {
			
			if(data.json().success){
				this.title = data.json().video.title;
					var titleLabel = document.getElementById("title-label");
					titleLabel.className += 'active';
					var titleInput = document.getElementById("title-input");
					titleInput.className += ' valid';
				this.category = data.json().video.category;
				this.description = data.json().video.description;
				this.link = data.json().video.link;
					var linkLabel = document.getElementById("link-label");
					linkLabel.className += 'active';
					var linkInput = document.getElementById("link-input");
					linkInput.className += ' valid';
				this.submitted_by = data.json().video.submitted_by;
			} else {
				this._router.navigate(['/admin/users']);
			}
		});
	};

	submitVideo(values){
		if(values.title === null && this.title) values.title = this.title;
		if(values.category === null && this.category) values.category = this.category;
		if(values.link === null && this.link) values.link = this.link;
		if(values.description === null && this.description) values.description = this.description;
		var headers = new Headers();
		var creds = {"id":this.id, "title": values.artist, "category" : values.category, "link" : values.link, "description" : values.description}
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/video/update`, creds, {headers: headers}).subscribe(data => {
  				if(data.json().success){
  					
  					// this._music.setMessages('submittedMusic');
  					this._router.navigateByUrl('/admin/videos');
  				} else {
  					this.error = true;
  				}
  		});
	}
}
