import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'terms',
  templateUrl: 'terms.component.html',
})

export class TermsComponent implements OnInit {
	constructor(){};
	ngOnInit(){
	};
	sendEmail(){
		window.location.href = "mailto:info@waydope.com";
	}
}