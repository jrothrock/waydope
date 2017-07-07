import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {BackendService} from '../../../services/backend.service';
import { Location } from '@angular/common';

declare var $;
declare var CloudZoom;

@Component({
  selector: 'profile_orders',
  templateUrl: 'profile.orders.component.html',
})

export class ProfileOrdersComponent implements OnInit {
	subscription:any;
  routeSubscription:any;
  paginateSubscription:any;
  orders:any=[];
  offset:number;
  user:string;
  totalCount:number;
  total:number;
  pages:number;
  currentPage:number;
  loaded:boolean=false;
  numbers:any;
  quantities:any=[];
  zoomedPhoto:any;
  server_url:string;
  math:any=Math;
  taxes:any=[];
  prices:any=[];
  totals:any=[];
  sub_totals:any=[];
  shippings:any=[];
  titles:any=[];
  constructor(private _auth: AuthService, private _backend:BackendService, private _router: Router, private _sysMessages: SystemMessagesComponent, private _location: Location, private _http:Http,  private _route: ActivatedRoute){};
	ngOnInit(){
    this.server_url = this._backend.SERVER_URL;
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
    this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
    this.getOrders();
  };
  getOrders(){
    var headersInit = new Headers();
    let offset = this.offset ? String(this.offset) : '0';
		headersInit.append('offset', offset);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/user/${this.user}/orders`,{headers: headersInit}).subscribe(data => {
        this.totalCount = data.json().orders.length;
        this.offset = this.offset ? this.offset : data.json().offset;
        this.orders = data.json().orders;
        this.total = data.json().count;
				this.pages = data.json().pages;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
        this.setQuantities();
        setTimeout(()=>{
          this.getImageWidth();
          this.displayAll();
        },200)
    },error=>{
        this._sysMessages.setMessages('unauthroized');
        this._router.navigateByUrl(`/users/${this.user}`);
        this.loaded = true;
    })
  }
   photoZoom(i,ic){
        if(this.zoomedPhoto) this.zoomedPhoto.destroy();
        let options = {zoomPosition:3,disableZoom:'false'}; 
        this.zoomedPhoto = new CloudZoom($(`#main-photo-cart-review-${i}-${ic}`),options);
        // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
  setQuantities(){
    if(this.quantities) this.quantities=[];
    
    for(let i = 0; i < this.orders.length; i++){
      let order_qs = []
      let titles = [];
      let taxes = [];
      let prices = [];
      let shippings = [];
      let sub_totals = [];
      let totals = [];
      for(let id = 0; id < Object.keys(this.orders[i].properties).length;id++){
        let prod_id = Object.keys(this.orders[i].properties)[id];
        
        for(let is = 0; is < Object.keys(this.orders[i].properties[prod_id]).length;is++){
          let size = Object.keys(this.orders[i].properties[prod_id])[is]
          
          for(let ic = 0; ic < Object.keys(this.orders[i].properties[prod_id][size]).length;ic++){
            let color = Object.keys(this.orders[i].properties[prod_id][size])[ic];
            
            order_qs.push(this.orders[i].properties[prod_id][size][color]["quantity"])
            
            if(this.orders[i].properties[prod_id][size][color]["tax"]) taxes.push(this.orders[i].properties[prod_id][size][color]["tax"])
            if(this.orders[i].properties[prod_id][size][color]["price"]) prices.push(this.orders[i].properties[prod_id][size][color]["price"])
            if(this.orders[i].properties[prod_id][size][color]["total"]) totals.push(this.orders[i].properties[prod_id][size][color]["total"])
            if(this.orders[i].properties[prod_id][size][color]["shipping"]) shippings.push(this.orders[i].properties[prod_id][size][color]["shipping"])
            if(this.orders[i].properties[prod_id][size][color]["sub_total"]) sub_totals.push(this.orders[i].properties[prod_id][size][color]["sub_total"])
            titles.push({i:id, title:`${this.orders[i].products[id].title}, ${size}, ${color}`})
          }
        }
      }
      this.taxes.push(taxes);
      this.prices.push(prices);
      this.shippings.push(shippings);
      this.sub_totals.push(sub_totals);
      this.totals.push(totals);
      this.titles.push(titles);
      this.quantities.push(order_qs)
    }
    
  }
  marqueeToggle(type,index,innerIndex){
      let textwidth = $(`#apparel-title-link-${index}-${innerIndex}`).width();
      let item = $(`#apparel-title-link-${index}-${innerIndex}`).parent()
      let parentwidth = item.width();
      let scrolldistance = textwidth - parentwidth;
      item.stop();
      if(type === 1 && (textwidth > parentwidth)){
        item.animate({scrollLeft:scrolldistance},1500,'linear');
      } else if (type === 0) {
        item.animate({scrollLeft:0},'medium','swing');
      }
    };
  getImageWidth(){
      for(let id = 0; id < this.orders.length;id++){
        for(let ic = 0; ic < this.orders[id].products.length;ic++){
            $(`#main-photo-cart-review-${id}-${ic}`).css({'display':'block'});
        }
      }
    }
  displayAll(){
    $("#loading-spinner-orders").css({'display':'none'});
    $("#orders-container").fadeIn();
  }
  changePage(type,page){
		let pageData = this.getOffset(type,page);
		var headers = new Headers({
      'user': this.user,
      'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
      'offset':pageData[0]
	  });
    this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/orders`, {headers: headers}).subscribe(data => {
        this.totalCount = data.json().orders.length;
        this.orders = data.json().orders;
        this.offset = data.json().offset;
        this.currentPage = pageData[1];
        this.setState();
        this.setQuantities();
    });
	}
  getTotal(quantity,price,shipping,sale,rate){
        if(!rate){
            if(sale) return (quantity * parseInt(sale.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
            else return (quantity * parseInt(price.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        } else {
            // this javascript floating point bull shit sucks. While this seems to work, the order returns a taxes hash that has the taxes for each product. May be easier to use that in the future.
            if(sale) return ((quantity * parseInt(sale.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))) + (Math.round(((quantity * (Math.round((((parseInt(sale.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
            else return ((quantity * parseInt(price.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))) + (Math.round(((quantity * (Math.round((((parseInt(price.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        }
    }
    getSub(quantity,price,sale){
        if(sale) return (quantity * parseInt(sale.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        else return (quantity * parseInt(price.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
    }
    getShip(quantity,shipping){
        return (quantity * parseInt(shipping.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
    }
    getTax(quantity,rate,price,shipping,sale){
        // this javascript float pointing bull shit sucks. While this seems to work, the order returns a taxes hash that has the taxes for each product. May be easier to use that in the future.
        if(sale) return (Math.round(((quantity * (Math.round((((parseInt(sale.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        else return (Math.round(((quantity * (Math.round((((parseInt(price.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
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
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
    let url = `/user/${this.user}/orders${offsetString}`;
	  this._location.replaceState(url);
	}
  ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
  }
}
