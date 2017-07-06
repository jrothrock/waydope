/* As there is currently no routerReUse, this will have to suffice. All I do is route back to the component that routed to me. */

import {HomeComponent} from '../home/home.component';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {ModalComponent} from '../modal/modal.component';
@Component({
  selector: 'switch',
  template: ``,
  providers: [HomeComponent, ModalComponent]
})
export class SwitchComponent implements OnInit {
  where:any;
  genre:any;
  routeSubscription:any;
  category:string;
  subcategory:string;
  url:string;
  search:string;
  comment:string;
  constructor( private _router: Router, private _route: ActivatedRoute, private _home: HomeComponent) {}

  ngOnInit() {
    let decoded = decodeURIComponent(window.location.search.substring(1))
    let params = decoded.split("&");
    for(let i = 0;i < params.length; i++){
          let key = params[i].split("=")[0]
          let value = params[i].split("=")[1]
          switch(key){
              case 'category':
                  this.category = value ? value : null;
                  break;
              case 'search':
                  this.search = value ? value : null; 
                  break;
          }
      }
      // this has to be done due to the location skip
     this.category = localStorage.getItem('category') || this.category;
     this.search = localStorage.getItem('search') || this.search;
     if(this.category) localStorage.removeItem("category");
     if(this.search) localStorage.removeItem("search");

  	 this.routeSubscription = this._route.params.subscribe(params => {this.where = params['where']});
     if(!this.category){
      this.routeSubscription = this._route.params.subscribe(params => {this.category = params['category']});
      this.routeSubscription = this._route.params.subscribe(params => {this.subcategory = params['subcategory']});
      this.routeSubscription = this._route.params.subscribe(params => {this.url = params['url']});
      this.routeSubscription = this._route.params.subscribe(params => {this.comment = params['comment']});
     }

  	if(this.where === 'home'){
  		this._router.navigate(['/']);
  	} else if(this.where === 'search'){
      this._router.navigateByUrl(`/search?category=${this.category}&search=${this.search}`);
    } else {
       if(this.comment) this._router.navigateByUrl(`/${this.where}/${this.category}/${this.subcategory}/${this.url}/${this.comment}`)
       else if(this.url && this.subcategory) this._router.navigateByUrl(`/${this.where}/${this.category}/${this.subcategory}/${this.url}`)
       else if (this.url && !this.subcategory) this._router.navigateByUrl(`/${this.where}/${this.category}/${this.url}`)
       else if (!this.url && this.subcategory) this._router.navigateByUrl(`/${this.where}/${this.category}/${this.subcategory}`)
       else if (this.category && !this.subcategory && !this.url) this._router.navigateByUrl(`/${this.where}/${this.category}`)
       else this._router.navigateByUrl(`/${this.where}`)
    } 
  }
  ngOnDestroy(){
  	if(this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}