import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthService} from '../../../../services/auth.service';
import {SystemMessagesComponent} from '../../../system/messages/messages.component';
import {BackendService} from '../../../../services/backend.service';
import { Location } from '@angular/common';

declare var $;
declare var CloudZoom;

@Component({
  selector: 'profile_order',
  templateUrl: 'profile.order.component.html',
})

export class ProfileOrderComponent implements OnInit {
	subscription:any;
  routeSubscription:any;
  order:any=[];
  id:string;
  user:string;
  loaded:boolean=false;
  numbers:any;
  quantities:any=[];
  zoomedPhoto:any;
  server_url:string;
  shipped_ids:any=[];
  confirmation_codes:any=[];
  taxes:any=[];
  shippings:any=[];
  sub_totals:any=[];
  totals:any=[];
  prices:any=[];
  titles:any=[];
  constructor(private _auth: AuthService, private _backend:BackendService, private _router: Router, private _sysMessages: SystemMessagesComponent, private _location: Location, private _http:Http,  private _route: ActivatedRoute){};
	ngOnInit(){
    this.server_url = this._backend.SERVER_URL;
    this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
    this.routeSubscription = this._route.params.subscribe(params => {this.id = params['order']});
    this.getOrders();
  };
  getOrders(){
    var headersInit = new Headers();
    headersInit.append('order', this.id);
    headersInit.append('user', this.user);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/orders/order`,{headers: headersInit}).subscribe(data => {
      if(data.json().success){
        this.order = data.json().order;
        this.loaded = true;
        this.setQuantities();
        this.setShipped();
        $("#order-container").addClass('active-post');
      } else {
        this._sysMessages.setMessages('unauthroized');
        this._router.navigateByUrl(`/users/${this.user}`);
        this.loaded = true;
      }
    })
  }
   photoZoom(ic){
        if(this.zoomedPhoto) this.zoomedPhoto.destroy();
        let options = {zoomPosition:3,disableZoom:'false'}; 
        this.zoomedPhoto = new CloudZoom($(`#main-photo-order-${ic}`),options);
        // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
  setQuantities(){
    if(this.quantities) this.quantities=[];
      let order_qs = []
      for(let id = 0; id < Object.keys(this.order.properties).length;id++){
        let prod_id = Object.keys(this.order.properties)[id];
        
        for(let is = 0; is < Object.keys(this.order.properties[prod_id]).length;is++){
          let size = Object.keys(this.order.properties[prod_id])[is]
          
          for(let ic = 0; ic < Object.keys(this.order.properties[prod_id][size]).length;ic++){
            let color = Object.keys(this.order.properties[prod_id][size])[ic];
            
            order_qs.push(this.order.properties[prod_id][size][color]["quantity"])
            
            if(this.order.properties[prod_id][size][color]["tax"]) this.taxes.push(this.order.properties[prod_id][size][color]["tax"])
            if(this.order.properties[prod_id][size][color]["price"]) this.prices.push(this.order["products"][id]["properties"][size][color]["price"])
            if(this.order.properties[prod_id][size][color]["total"]) this.totals.push(this.order.properties[prod_id][size][color]["total"])
            if(this.order.properties[prod_id][size][color]["shipping"]) this.shippings.push(this.order.properties[prod_id][size][color]["shipping"])
            if(this.order.properties[prod_id][size][color]["sub_total"]) this.sub_totals.push(this.order.properties[prod_id][size][color]["sub_total"])
            this.titles.push({i:id, title:`${this.order.products[id].title}, ${size}, ${color}`})
          }
        }
      }
     this.quantities = order_qs;
  }
  setShipped(){
    if(this.shipped_ids) this.shipped_ids=[];
    if(this.confirmation_codes) this.confirmation_codes=[];
    let shipped_ids = []
    let confirmation_codes = []
    for(let i =0; i < Object.keys(this.order.shipped).length; i++){  
      shipped_ids.push(Object.keys(this.order.shipped)[i])
      confirmation_codes.push(this.order.shipped[shipped_ids[i]]);
    };
    this.shipped_ids = shipped_ids;
    this.confirmation_codes = confirmation_codes;
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
  ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
