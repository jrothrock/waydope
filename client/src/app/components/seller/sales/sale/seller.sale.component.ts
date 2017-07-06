import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../../services/auth.service';
import {SystemMessagesComponent} from '../../../system/messages/messages.component';
import {BackendService} from '../../../../services/backend.service';

@Component({
  selector: 'seller_sale',
  templateUrl: 'seller.sale.component.html',
})

export class SellerSaleComponent implements OnInit {
    subscription:any;
    routeSubscription:any;
    id:number;
    category:string;
    name:string;
    url:string;
    quantity:number;
    shipping:number;
    address:string;
    address_two:string;
    firstname:string;
    lastname:string;
    city:string;
    state:string;
    zip:string;
    sub_category:string;
    sub_total:number;
    total:number;
    type:string;
    tracking:string;
    product:any;
    color:any;
    size:any;
    constructor(private _auth: AuthService, private _backend: BackendService, private _route: ActivatedRoute, private _http: Http ){};
	ngOnInit(){
      this.routeSubscription = this._route.params.subscribe(params => {
        this.id = params['order']; 
        this.product = params['product'];
        this.color = params['color'];
        this.size = params['size'];
      });
      
      var headers = new Headers();
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      headers.append('order', String(this.id));
      headers.append('product', this.product);
      headers.append('size', this.size);
      headers.append('color', this.color);
      
      this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/sellers/sale`, {headers: headers}).subscribe(data => {
        if(data.json().success){
          this.category = data.json().sale.category;;
          this.name = data.json().sale.product;
          this.url = data.json().sale.product_url;
          this.quantity = data.json().sale.quantity;
          this.shipping = data.json().sale.shipping;
          this.address = data.json().sale.shipping_info.address;
          this.address_two = data.json().sale.shipping_info.address_two;
          this.city = data.json().sale.shipping_info.city;
          this.firstname = data.json().sale.shipping_info.firstname;
          this.lastname = data.json().sale.shipping_info.lastname;
          this.state = data.json().sale.shipping_info.state;
          this.zip = data.json().sale.shipping_info.zip;
          this.sub_category = data.json().sale.sub_category;
          this.sub_total = data.json().sale.sub_total;
          this.total = data.json().sale.total;
          this.type = data.json().sale.type;
          this.tracking = data.json().sale.confirmation;
          
        } else if( data.json().status === 401) {

        }
      });
    };
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.routeSubscription) this.routeSubscription.unsubscribe();
    }
}
