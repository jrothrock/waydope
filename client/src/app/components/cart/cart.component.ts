import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../services/auth.service';
import {CartService} from '../../services/cart.service';
import 'angular2-materialize';
import { Router } from '@angular/router';
import {BackendService} from '../../services/backend.service';

declare var CloudZoom;
declare var $;

@Component({
  selector: 'cart',
  templateUrl: 'cart.component.html'
})

export class CartComponent implements OnInit {
    // subscription:any;
    // OrderSubscription:any;
    // loaded:boolean=false;
    // items:any=[];
    // quantities:any=[];
    // order:any;
    // zoomedPhoto:any;
	constructor(private cartService: CartService, private _backend: BackendService, private _auth: AuthService, private _http: Http, private _router:Router){
        // this.subscription = cartService.cartChange.subscribe((values) => {
        //     this.items = values[0] ? values[0] : null; 
        //     this.order = values[1] ? values[1] : null;
        //     if(values[1] && values[1].properties){
        //         for(let i = 0; i < Object.keys(values[1].properties).length; i++){
        //             for(let ic = 0; ic < Object.keys(values[1].properties).length; ic++){
        //                 if(values[1].propeties[i][ic]["quantity"]) this.quantities.push(values[1].properties[i][ic]["quantity"]);
        //             }
        //         }
        //     }
        //     this.loaded = true;
        //     setTimeout(()=>{
        //         this.getImageWidth();
        //     },20)
        // });
    };
	ngOnInit(){};
//     marqueeToggle(type,index){
//     //   let textwidth = $(`#apparel-title-link-${index}`).width();
//     //   let item = $(`#apparel-title-link-${index}`).parent()
//     //   let parentwidth = item.width();
//     //   let scrolldistance = textwidth - parentwidth;
//     //   item.stop();
//     //   if(type === 1 && (textwidth > parentwidth)){
//     //     item.animate({scrollLeft:scrolldistance},1500,'linear');
//     //   } else if (type === 0) {
//     //     item.animate({scrollLeft:0},'medium','swing');
//     //   }
//   };
    // getImageWidth(){
    //     for(let id = 0; id < this.items.length;id++){
    //         let container_width = $(`#main-photo-cart-container-${id}`).width();
    //         let image_object = new Image();
    //         image_object.src = $(`#main-photo-cart-${id}`).attr("src");

            
    //         let native_width = image_object.width;
    //         let native_height = image_object.height;

    //         if(native_height > native_width && native_height > 148){
    //             let multiplier = 148 / native_height
    //             let new_width = native_width * multiplier;
    //             $(`#main-photo-cart-${id}`).height(148).width(new_width)
    //         } else if (native_height > native_width && native_height <= 148) {
    //             $(`#main-photo-cart-${id}`).height(native_height).width(native_width)
    //         } else if (native_width > native_height && native_width > 300){
    //             let multiplier = container_width / native_width;
    //             let new_height = (native_height * multiplier) < 149 ? (native_height * multiplier) : 148;
    //             $(`#main-photo-cart-${id}`).height(new_height).width(container_width);
    //         } else {
    //             $(`#main-photo-cart-${id}`).height(native_height).width(native_width)
    //         }
    //         $(`#main-photo-cart-${id}`).css({'display':'block'});
    //     }
    // }
    // photoZoom(i){
    //         if(this.zoomedPhoto) this.zoomedPhoto.destroy();
    //         let options = {zoomPosition:13,disableZoom:'false'}; 
    //         this.zoomedPhoto = new CloudZoom($(`#main-photo-cart-${i}`),options);
    //         // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    // }
    // cartClose(){
    //     $('body').css({'width':'initial', 'overflow':'initial'});
    //     // may want to change from fades.
    //     $('#lightbox-cart').fadeOut()
    // }
    // public setCart(){ 
    //     $('#lightbox-cart').fadeIn()
    //     // $('body').css({'width':window.innerWidth, 'overflow':'hidden'});
    //     // $('body').append(`<div id='dark-overlay' class='dark-overlay' style='z-index:1002;display:block;opacity:0.5;'></div>`)
    // }
    // this may not matter, but if a reload triggers all the current components to destroy, then this is very important.
    ngOnDestroy(){
        // if(this.zoomedPhoto) this.zoomedPhoto.destroy();
        // if(this.subscription) this.subscription.unsubscribe();
    }
}