import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'privacy',
  templateUrl: 'privacy.component.html',
})

export class PrivacyComponent implements OnInit {
	constructor(){};
	ngOnInit(){
	};
	sendEmail(){
		window.location.href = "mailto:info@waydope.com";
	}
}