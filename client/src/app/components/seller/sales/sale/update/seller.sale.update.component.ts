import { Component, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {SystemMessagesComponent} from '../../../../system/messages/messages.component';
import {AuthService} from '../../../../../services/auth.service';
import {BackendService} from '../../../../../services/backend.service';

declare var $;

@Component({
  selector: 'seller_sale_update',
  templateUrl: 'seller.sale.update.component.html',
})

export class SellerSaleUpdateComponent implements OnInit {
  saleUpdateForm:FormGroup;
  subscription:any;
  routeSubscription:any;
  id:number;
  tracking:boolean=false;
  product:any;
  color:any;
  size:any;
  constructor(private _fb: FormBuilder, private _backend: BackendService, private _sysMessages: SystemMessagesComponent, private _router: Router, private _route: ActivatedRoute, private _auth: AuthService, private _http: Http){};
	ngOnInit(){
      this.routeSubscription = this._route.params.subscribe(params => {
        this.id = params['order']; 
        this.product = params['product'];
        this.color = params['color'];
        this.size = params['size'];
      });
    	this.saleUpdateForm = this._fb.group({
	      'tracking': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')])],
	    })
      if(!this.id || !this.product || !this.color || !this.size){
        alert('fuck');
      }
      var headers = new Headers();
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      headers.append('order', String(this.id));
      headers.append('product', this.product);
      headers.append('size', this.size);
      headers.append('color', this.color);
      this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/sellers/sale`, {headers: headers}).subscribe(data => {
        if(data.json().success){
          if(data.json().sale.confirmation){
            this.saleUpdateForm.patchValue({'tracking':data.json().sale.confirmation});
            $('#tracking').addClass('valid');
            $('#tracking-label').addClass('active');
            this.tracking = true;
          }
        } else if( data.json().status === 401) {
        }
      });
  };
  submitTracking(values){
     var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":this.id, "color": this.color, "size": this.size, "product": this.product, "code": values.tracking}
	    this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/sellers/sale/update`, body, {headers: headers}).subscribe(data => {
        if(data.json().success){
          this._router.navigateByUrl('/seller');
          this._sysMessages.setMessages('added-tracking');
        }
      });
  }
  ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
