import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import { Location } from '@angular/common';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';

declare var $;

@Component({
  selector: 'seller_main',
  templateUrl: 'seller.main.component.html',
})

export class SellerMainComponent implements OnInit {
    subscription:any;
    paginateSubscription:any;
    totalSales:number;
    totalDollar:number;
    totalTaxed:number;
    currentPage:number;
    offset:number=0;
    pages:number;
    total:number;
    totalSalesCount:number;
    totalSub:number;
    totalTax:number;
    totalShipping:number;
    numbers:any=[];
    sales=[];
    math:any=Math;
    quantities:any=[];
    taxes:any=[];
    prices:any=[];
    shippings:any=[];
    sub_totals:any=[];
    totals:any=[];
    titles:any=[];
    constructor(private _http: Http, private _location: Location, private _router: Router, private _sysMessages: SystemMessagesComponent, private _backend: BackendService, private _auth: AuthService){};
    ngOnInit(){
      let decoded = decodeURIComponent(window.location.search.substring(1))
      let params = decoded.split("&");
      for(let i = 0;i < params.length; i++){
        let key = params[i].split("=")[0]
        let value = params[i].split("=")[1]
        switch(key){
          case 'offset':
            this.offset = parseInt(value);
            break;
        }
      }
      this.currentPage = (this.offset / 5) + 1;
      var headers = new Headers();
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      headers.append('offset', this.offset.toString());
      this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/sellers`, {headers: headers}).subscribe(data => {
        
        if(data.json().success){
          this.totalSalesCount = data.json().seller.total;
          this.totalSales = data.json().seller.total_sales;
          this.totalSub = data.json().seller.total_sub;
          this.totalShipping = data.json().seller.total_shipping;
          this.totalTax = data.json().seller.total_tax;
          this.sales = data.json().seller.sales;
          this.total = data.json().count;
          this.pages = data.json().pages;

          this.numbers = Array(this.pages).fill(1);
          this.currentPage = this.currentPage ? this.currentPage : data.json().page;
          this.setQuantities();
        } else if( data.json().status === 401) {
           this._sysMessages.setMessages('unathorized');
           this._router.navigateByUrl(`/`);
        }
      });
    };
    setQuantities(){
      if(this.quantities) this.quantities=[];
      let sales = [];
      for(let i = 0; i < this.sales.length; i++){
        let order_qs = []
        let titles = [];
        let taxes = [];
        let prices = [];
        let shippings = [];
        let sub_totals = [];
        let totals = [];
        for(let id = 0; id < Object.keys(this.sales[i]).length;id++){
          let prod_id = Object.keys(this.sales[i])[id];
          for(let is = 0; is < Object.keys(this.sales[i][prod_id]).length;is++){
            let size = Object.keys(this.sales[i][prod_id])[is]
            for(let ic = 0; ic < Object.keys(this.sales[i][prod_id][size]).length;ic++){
              let color = Object.keys(this.sales[i][prod_id][size])[ic];
              order_qs.push(this.sales[i][prod_id][size][color]["quantity"]);
              if(this.sales[i][prod_id][size][color]["tax"]) taxes.push(this.sales[i][prod_id][size][color]["tax"]);
              titles.push({i:id, title:`${this.sales[i][prod_id][size][color]["product"]}, ${size}, ${color}`, item:this.sales[i][prod_id][size][color]});
              sales.push(this.sales[i][prod_id][size][color]);
            }
          }
        }
        this.taxes.push(taxes);
        this.prices.push(prices);
        this.shippings.push(shippings);
        this.sub_totals.push(sub_totals);
        this.totals.push(totals);
        this.titles.push(titles);
        this.quantities.push(order_qs);
      }
      this.sales = sales;
    }
    changePage(type,page){
      let pageData = this.getOffset(type,page);
      if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
      var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
                "offset":pageData[0]
        });
          this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/sellers`, {headers: headers}).subscribe(data => {
            
          if(data.json().success){
            this.sales = data.json().seller.sales;
            this.offset = data.json().offset;
            this.currentPage = pageData[1];
            this.setState();
          }
        });
  }
  getOffset(type,page){
		let data = [];
		switch(type){
			case 'start':
				data.push(0);
				data.push(1)
				break;
			case 'back':
				data.push((this.currentPage-2) * 5);
				data.push(this.currentPage - 1);
				break;
			case 'next':
				data.push((this.currentPage) * 5);
				data.push(this.currentPage + 1);
				break;
			case 'end':
				data.push((this.pages - 1) * 5);
				data.push(this.pages);
				break;
			case 'page':
				data.push((page - 1) * 5);
				data.push(page)
				break;
		}
		return data;
	}
  setState(){
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
    let url = `/seller${offsetString}`
	  this._location.replaceState(url);
	}
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
    }
}
