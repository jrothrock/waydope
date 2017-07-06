import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {CartService} from '../../../services/cart.service';
import 'angular2-materialize';
import { Router } from '@angular/router';

declare var CloudZoom;
declare var $;

@Component({
  selector: 'cart_modal',
  templateUrl: 'cart.modal.component.html'
})

export class CartModalComponent implements OnInit {
    subscription:any;
    OrderSubscription:any;
    loaded:boolean=false;
    ids:any=[];
    items:any=[];
    quantities:any=[];
    order:any;
    zoomedPhoto:any;
    sizes:any=[];
    colors:any=[];
    totals:any=[];
    sub_totals:any=[];
    taxes:any=[];
    shippings:any=[];
    prices:any=[];
    Object:any=Object;
    titles:any=[];
	constructor(private _cartService: CartService, private _auth: AuthService, private _http: Http, private _router:Router){
    };
	ngOnInit(){
        this.subscription = this._cartService.cartChange.subscribe((values) => {
            console.log('change')
            
            
            this.order = null;
            this.loaded = false;
            this.titles = [];
            this.items = [];
            this.quantities = [];
            this.sizes =[];
            this.colors =[];
            this.prices = [];
            this.shippings = [];
            this.totals = [];
            this.sub_totals = [];
            this.ids = [];
            if(values[0] === 'clear'){
                return;
            }
            
            // the above null and timeout are needed for when a cartchange happens from a tax change in the cart
            setTimeout(()=>{
                this.items = values[0] ? values[0] : []; 
                for(let i = 0; i < this.items.length; i++){
                    this.ids.push(this.items[i].uuid)
                }
                this.order = values[1] ? values[1] : null;
                if(values[1] && values[1]["properties"]){
                    for(let i = 0; i < Object.keys(values[1]["properties"]).length; i++){
                        let id = Object.keys(values[1]["properties"])[i]
                        for(let is = 0; is < Object.keys(values[1]["properties"][id]).length; is++){
                            let sizes = Object.keys(values[1]["properties"][id])[is]
                            for(let ic = 0; ic < Object.keys(values[1]["properties"][id][sizes]).length; ic++){
                                
                                let colors = Object.keys(values[1]["properties"][id][sizes])[ic]
                                if(values[1]["properties"][id][sizes][colors]["quantity"]) this.quantities.push(values[1]["properties"][id][sizes][colors]["quantity"])
                                if(values[1]["properties"][id][sizes][colors]["price"]) this.prices.push(values[1]["properties"][id][sizes][colors]["price"])
                                if(values[1]["properties"][id][sizes][colors]["tax"]) this.taxes.push(values[1]["properties"][id][sizes][colors]["tax"])
                                if(values[1]["properties"][id][sizes][colors]["total"]) this.totals.push(values[1]["properties"][id][sizes][colors]["total"])
                                if(values[1]["properties"][id][sizes][colors]["shipping"]) this.shippings.push(values[1]["properties"][id][sizes][colors]["shipping"])
                                if(values[1]["properties"][id][sizes][colors]["sub_total"]) this.sub_totals.push(values[1]["properties"][id][sizes][colors]["sub_total"])
                                this.titles.push({i:i, title:`${this.items[this.ids.indexOf(id)].title}, ${sizes}, ${colors}`, index:this.ids.indexOf(id)})
                            }
                        }
                    }
                }
                this.loaded = true;
                console.log(this.items.length);
                
            },5)
        });
    };
  marqueeToggle(type,index){
      let textwidth = $(`#apparel-title-link-${index}`).width();
      let item = $(`#apparel-title-link-${index}`).parent()
      let parentwidth = item.width();
      let scrolldistance = textwidth - parentwidth;
      item.stop();
      if(type === 1 && (textwidth > parentwidth)){
        item.animate({scrollLeft:scrolldistance},1500,'linear');
      } else if (type === 0) {
        item.animate({scrollLeft:0},'medium','swing');
      }
  };
  getItem(id){
        
        return this.items[this.ids.indexOf(id)]
  }
    getTotal(quantity,price,shipping,sale,rate){
        if(!rate){
            if(sale && shipping && quantity) return (quantity * parseInt(sale.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
            else if(quantity && price && shipping) return (quantity * parseInt(price.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        } else if(rate) {
            // this javascript floating point bull shit sucks. While this seems to work, the order returns a taxes hash that has the taxes for each product. May be easier to use that in the future.
            if(sale && shipping && quantity) return ((quantity * parseInt(sale.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))) + (Math.round(((quantity * (Math.round((((parseInt(sale.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
            else if(shipping && quantity && price) return ((quantity * parseInt(price.replace("$",""))) + (quantity * parseInt(shipping.replace("$",""))) + (Math.round(((quantity * (Math.round((((parseInt(price.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        }
    }
    getSub(quantity,price,sale){
        if(sale && quantity) return (quantity * parseInt(sale.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        else if (price && quantity) return (quantity * parseInt(price.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
    }
    getShip(quantity,shipping){
        if(quantity && shipping) return (quantity * parseInt(shipping.replace("$",""))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
    }
    getTax(quantity,rate,price,shipping,sale){
        // this javascript float pointing bull shit sucks. While this seems to work, the order returns a taxes hash that has the taxes for each product. May be easier to use that in the future.
        if(sale && quantity && rate && shipping) return (Math.round(((quantity * (Math.round((((parseInt(sale.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        else if(quantity && price && shipping  && rate) return (Math.round(((quantity * (Math.round((((parseInt(price.replace("$","")) + parseInt(shipping.replace("$",""))) *rate)+0.0001)*100) / 100))+0.0001)*100) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
    }
    photoZoom(i){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:13,disableZoom:'false'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-cart-modal-${i}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
    public cartClose(url=null){
        $('body').css({'width':'initial', 'overflow':'initial'});
        // may want to change from fades.
        $('#lightbox-cart').removeClass('active');
        if(url){
            this._router.navigateByUrl(url);
        }
    }
    public setCart(){ 
        $('#lightbox-cart').addClass('active');
        // $('body').css({'width':window.innerWidth, 'overflow':'hidden'});
        // $('body').append(`<div id='dark-overlay' class='dark-overlay' style='z-index:1002;display:block;opacity:0.5;'></div>`)
    }
    // this may not matter, but if a reload triggers all the current components to destroy, then this is very important.
    ngOnDestroy(){
        if(this.zoomedPhoto) this.zoomedPhoto.destroy();
        if(this.subscription) this.subscription.unsubscribe();
    }
}
