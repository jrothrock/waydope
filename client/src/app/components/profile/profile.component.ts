import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

declare var $;

@Component({
  selector: 'profile',
  templateUrl: 'profile.component.html',
})

export class ProfileComponent implements OnInit {
	ngOnInit(){
	};
  ngOnDestroy(){
    if($("#user-banned-message").data("showing")) $("#user-banned-message").css({'display':'none'}).data('showing',false)
  }
}