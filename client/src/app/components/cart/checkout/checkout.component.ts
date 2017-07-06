import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Http, Headers } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
import 'angular2-materialize';
import { Router } from '@angular/router';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AppComponent} from '../../app/app.component';
import {CartService} from '../../../services/cart.service';
import {BackendService} from '../../../services/backend.service';

declare var $;
declare var CloudZoom;
declare var paypal;
declare var Stripe;
declare var Materialize;

@Component({
  selector: 'checkout',
  templateUrl: 'checkout.component.html',
  providers:[AppComponent]
})

export class CheckoutComponent implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  subscription:any;
  routerSubscription:any;
  paymentSubscription:any;
  deleteSubscription:any;
  userSubscription:any;
  userInfoSubscription:any;
  updateSubscription:any;
  OrderSubscription:any;
  watchCartSubscription:any;
  loaded:boolean=false;
  items:any=[];
  quantities:any=[];
  order:any;
  zoomedPhoto:any;
  cartId:string;
  location:string;
  loggedIn:boolean;
  banned:boolean=false;
  error:boolean=false;
  usernameError:boolean=false;
  locked:boolean=false;
  emailError:boolean=false;
  token:string;
  cardInvalid:boolean=false;
  cardError:boolean=false;
  quantitySelected:number;
  currentEdit:number;
  currentUser:string;
  firstname:string;
  lastname:string;
  email:string;
  address:string;
  address_two:string;
  zip:string;
  city:string;
  state:string;
  phone:string;
  addedScipts:boolean;
  editQuantities:any=[];
  failedRequest:any;// this is the timeout.
  paying:boolean=false;
  ids:any=[];
  soldOutIds=[];
  soldOutQuantities=[];
  leaveTimeout:any;
  cardType:string;
  prices:any=[];
  taxes:any=[];
  shippings:any=[];
  totals:any=[];
  sub_totals:any=[];
  titles:any=[];
  colors:any=[];
  sizes:any=[];
  item_ids:any=[];
	constructor(private _http:Http, private _backend: BackendService, private _router: Router, private _cartService: CartService, private _app: AppComponent,private _sysMessages: SystemMessagesComponent,  private _auth:AuthService, private _fb: FormBuilder,private _modal: ModalComponent, private _location: Location){};
	ngOnInit(){
    this.loggedIn = this._auth.checkToken();
     this.shippingForm = this._fb.group({
        'firstname': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-.]*$')])],
        'lastname': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-.]*$')])],
        'email': [null, Validators.required],
        'phone': [null],
        'address': [null, Validators.required],
        'address_two': [null],
        'zip': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
        'city': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-.]*$')])],
        'state': [null, Validators.required],
     })
     this.paymentForm = this._fb.group({
        'number': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9 ]*$'),  Validators.maxLength(19),  Validators.minLength(19)])],
        'holder': [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-. ]*$')])],
        'month': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
        'year': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
        'security': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
        'zip': [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
     })
     this.currentUser = localStorage.getItem('username') || '';
     this.routerSubscription = this._router.events.subscribe(event => {
        
        if(event["state"]){
          let oldLocation = $('#checkout-bar').get(0).className;
          this.location = event["url"].split('#')[1];
          if(this.location === 'review' || (this.location === 'user' && this.loggedIn)) $('#btn-back').text('Edit')
          $(`#${this.location}-content`).slideDown();
          if(oldLocation === 'shipping' && this.location === 'success'){
            // I believe there is a bug in angular where if you route from a url that 
            // has skipLocationChange to another route with skipLocationChange, it will
            //redirect to the last known non skipLocationChange route. This patches that
            // by automatically skipping this state to the next
            this._location.forward(); 
          }
          if(oldLocation != this.location) $(`#${oldLocation}-content`).slideUp();
          this.setProgression(this.location);
        }
      })
      let hashLocation = window.location.hash.slice(1); // remove hash.
      if(hashLocation){
        this.location = hashLocation;
        this.setProgression(hashLocation);  
        $(`#${hashLocation}-content`).css({'display':'block'});
        if(this.location === 'payment'){
          // this.addScripts();
          this.watchPaymentButtons();
          $('#btn-continue').text('Pay');
        }
        // this is used due to the angular2 bug found above.
        if(this.location === 'success'){
          this._location.back();
        }
        if(this.location === 'review' || this.location === 'edit'){
          $('#btn-back').text('Edit')
        }
      } else {
        $(`#review-content`).css({'display':'block'});
        this._router.navigateByUrl('/cart#review');
      }
      this.getCart();
      if(this.currentUser) this.getUserInfo();
      this.addScripts();
      this.watchCart();
  };
  watchCart(){
    this.watchCartSubscription = this._cartService.cartChange.subscribe((values) => {
      
      
      this.items = values[0] ? values[0] : this.items;
      this.order = values[1] ? values[1] : this.order;
      for(let i =0; i < this.items.length; i++){
        this.item_ids.push(this.items[i].uuid);
      }
       this.setValues(this.order.properties)
    });
  }
  getCart(){
      this.cartId = this._auth.getCookie('_cart');
      var headers = new Headers();
      headers.append('cart', this.cartId);
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      let spinner, spinnerTimeout;
      spinnerTimeout = setTimeout(()=>{
        spinner = true;
        $("#loading-spinner-cart-checkout").fadeIn();
      },300)
      this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/cart`, {headers: headers}).subscribe(data => {
        
        if(data.json().success){
          this.items = data.json().order.products;
          for(let i =0; i < this.items.length; i++){
            this.item_ids.push(this.items[i].uuid);
          }
          
          this.order = data.json().order;
          this.setValues(data.json().order.properties)
          this.watchProgression();
          setTimeout(()=>{
              this.getImageWidth();
          },150 )
        } else {
          this.watchProgression();
        }
        setTimeout(()=>{
          if(spinnerTimeout) clearTimeout(spinnerTimeout);
          if(spinner) $("#loading-spinner-cart-checkout").css({'display':'none'});
          $("#cart-checkout-container").addClass('active-cart');
          $("#cart-checkout-totals").addClass("active-cart");
        },5)
      });
    }

  getUserInfo(){
    var headers = new Headers();
    headers.append('user', this.currentUser);
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
    this.userInfoSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/info`, {headers: headers}).subscribe(data => {
      if(data.json().success){
        if(data.json().firstname){
          this.firstname = data.json().firstname;
          this.shippingForm.patchValue({'firstname':data.json().firstname})
          $(`#firstname-checkout`).addClass('valid');
          $(`#firstname-checkout-label`).addClass('active');
        }
        if(data.json().lastname){
          this.lastname = data.json().lastname;
          this.shippingForm.patchValue({'lastname':data.json().lastname})
          $(`#lastname-checkout`).addClass('valid');
          $(`#lastname-checkout-label`).addClass('active');
        }
        if(data.json().email){
          this.email = data.json().email;
          this.shippingForm.patchValue({'email':data.json().email})
          $(`#email-checkout`).addClass('valid');
          $(`#email-checkout-label`).addClass('active'); 
        }
        if(data.json().address){
          this.address = data.json().address;
          this.shippingForm.patchValue({'address':data.json().address})
          $(`#address-checkout`).addClass('valid');
          $(`#address-checkout-label`).addClass('active'); 
        }
        if(data.json().address_two){
          this.address_two = data.json().address_two;
          this.shippingForm.patchValue({'address_two':data.json().address_two})
          $(`#address-two-checkout`).addClass('valid');
          $(`#address-two-checkout-label`).addClass('active'); 
        }
        if(data.json().zipcode){
          this.zip = data.json().zipcode;
          this.shippingForm.patchValue({'zip':data.json().zipcode})
          $(`#zip-checkout`).addClass('valid');
          $(`#zip-checkout-label`).addClass('active'); 
        }
        if(data.json().city){
          this.city = data.json().city;
          this.shippingForm.patchValue({'city':data.json().city})
          $(`#city-checkout`).addClass('valid');
          $(`#city-checkout-label`).addClass('active'); 
        }
        if(data.json().state){
          this.state = data.json().state;
          this.shippingForm.patchValue({'state':data.json().state})
          $(`#state-checkout`).addClass('valid');
          $(`#state-checkout-label`).addClass('active'); 
        }
        if(data.json().phone_number && data.json().phone_number != 'null'){
          this.phone = data.json().phone_number;
          this.shippingForm.patchValue({'phone':data.json().phone_number})
          $(`#phone-checkout`).addClass('valid');
          $(`#phone-checkout-label`).addClass('active'); 
        }
      } 
    })
  }
    
  setProgression(progression){
     $('#checkout-bar').get(0).className = progression;
  }
    
  watchProgression(){
     let component = this;
      $("#btn-continue, #btn-back").click(function() {
        let type = $(this).data('type');
        let classes;
        let beforeClassName = $('#checkout-bar').get(0).className;
        let className;
        if(type === 'next'){
          classes = component.loggedIn ? ['edit','review', 'shipping', 'payment', 'processing', 'success'] : ['edit','review', 'user', 'shipping', 'payment', 'processing', 'success'];
          className = classes[($.inArray(beforeClassName, classes) + 1)];
          $('#checkout-bar').get(0).className = className;
          if(component.location === 'review'){
            
            if(!component.loggedIn) component._modal.setModal('cart#shipping','cart');
            $('#btn-back').text('Back') 
          }
          if(component.location === 'shipping'){ 
            $('#btn-continue').text('Pay')
            component.watchPaymentButtons();
            component.watchProgressionPost();
          }
          if(component.location === 'payment'){
            component.proccessPayment();
            component.failedRequest = setTimeout(()=>{
              $('.waves-ripple').remove();
              Materialize.toast("Something failed on our end. You were not charged. Please try again.", 4500, 'rounded-failure');
              component.paying = false;
              component.location = 'payment'
              $(`#payment-content`).slideDown();
              $(`#processing-content`).slideUp();
            },20000);
          } 
        } else {
          if(component.location === 'user') $('#btn-back').text('Edit')
          if(component.location === 'shipping') $('#btn-continue').text('Next')
          classes = ['edit','review', 'shipping', 'payment', 'success'];
          className =  classes[($.inArray(beforeClassName, classes) - 1)];
          $('#checkout-bar').get(0).className = className;
          //fix the stupid modal bug.
          
          if(className === 'review'){
            component._router.navigateByUrl(`/cart#${className}`)
            component.location = className;
            $(`#${className}-content`).slideDown();
            $(`#${beforeClassName}-content`).slideUp();
            $('#btn-back').text('Edit')
            return
          }
            // component._router.navigateByUrl(`/cart#${className}`);
        }
        if(className != 'user' && className != 'payment' && className != 'processing') component._location.go(`/cart#${className}`)
        else component._router.navigateByUrl(`/cart#${className}`, { skipLocationChange: true }); // Navigates without pushing a new state into history. 
        component.location = className;
        $(`#${className}-content`).slideDown();
        $(`#${beforeClassName}-content`).slideUp();
      });
    }
    editItem(value,amount,initial){
      this.quantitySelected = initial;
      let id = this.ids[value];
      let index = this.item_ids.indexOf(id);
      let color = this.colors[value];
      let size = this.sizes[value];
      
      
      
      
      let properties = this.items[index]["properties"][size][color]
      let quantities = properties["quantity"];
      let array = [];
      for(let i = 1; i <= quantities; i++){
        array.push(i);
      }
      this.editQuantities = array;
      this.currentEdit = value; 
      setTimeout(()=>{
        $(`#quantity`).val(initial);
      },25)
    }
    quantityChange(value){
      
      this.quantitySelected = value;
      
    }
    updateItem(item,index){
      
      let id_index = this.soldOutIds.indexOf(`${this.ids[index].toString()}, ${this.sizes[index]}, ${this.colors[index]}`);
      if(id_index > -1 && this.items[this.item_ids.indexOf(this.ids[index])].quantity > 0){
        this.soldOutIds.splice(id_index,1)
        this.soldOutQuantities.splice(id_index,1)
        if(this.quantitySelected > this.items[index].quantity){
          Materialize.toast("Quantity Needs To Be Greater Than Amount Available.", 3500, 'rounded-failure');
          this.quantitySelected = this.items[index].quantity;
        }
        $(`#item-${this.items[index].uuid}`).css({'outline':'initial'})
        $(`#item-${this.items[index].uuid}-less`).css({'display':'none'});
      }
      this.quantities[index] = this.quantitySelected;
      this._cartService.itemChange(this.items[index], {quantity:this.quantitySelected,size:this.sizes[index],color:this.colors[index]});
      this.currentEdit = null;
    }
    deleteItem(item,index){
      
      
      let id_index = this.soldOutIds.indexOf(`${this.ids[index].toString()}, ${this.sizes[index]}, ${this.colors[index]}`);
      if(id_index > -1){
        this.soldOutIds.splice(id_index,1)
        this.soldOutQuantities.splice(id_index,1)
      }
      this._cartService.itemChange(this.items[this.item_ids.indexOf(this.ids[index])], {quantity:0,size:this.sizes[index],color:this.colors[index]});
      this.titles.splice(index,1);
      this.prices.splice(index,1)
      this.shippings.splice(index,1)
      this.taxes.splice(index,1)
      this.totals.splice(index,1)
      this.sub_totals.splice(index,1)
      this.quantities.splice(index,1)
      this.colors.splice(index,1);
      this.sizes.splice(index,1);
      this.ids.splice(index,1);
    }
    watchProgressionPost(){
       let changed = (this.firstname != this.shippingForm.value.firstname) || (this.lastname != this.shippingForm.value.lastname) || (this.email != this.shippingForm.value.email) || (this.address != this.shippingForm.value.address) || (this.address_two != this.shippingForm.value.address_two) || (this.phone != this.shippingForm.value.phone) || (this.zip != this.shippingForm.value.zip) || (this.city != this.shippingForm.value.city) || (this.state != this.shippingForm.value.state) ? true : false;
       if(this._auth.checkToken()){
         if(this.location === 'shipping' && changed){
          var headersInit = new Headers();
          headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
          let body = {firstname: this.shippingForm.value.firstname, lastname: this.shippingForm.value.lastname, email: this.shippingForm.value.email, phone: this.shippingForm.value.phone, address: this.shippingForm.value.address, address_two: this.shippingForm.value.address_two, city: this.shippingForm.value.city, zip: this.shippingForm.value.zip, state: this.shippingForm.value.state, cart:true };
          this.userSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/info/update`, body,{headers: headersInit}).subscribe(data => {
              
          });
        }
       }
       if(this.location === 'shipping' && changed){
          var headersInit = new Headers();
          headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
          headersInit.append("cart", this.cartId);
          let body = {update_zip:true, zip: this.shippingForm.value.zip, cart: this.cartId};
          this.userSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/cart/update`, body,{headers: headersInit}).subscribe(data => {
            if(data.json().success && data.json().order){
              this.order = data.json().order;
              this._cartService.change(data.json().products,this.order);
            } 
          });
        }
    }


    setValues(properties){
        this.titles = [];
        this.sizes = [];
        this.colors = [];
        this.ids = [];
        this.quantities = [];
        this.taxes = [];
        this.prices = [];
        this.totals = [];
        this.sub_totals = [];
        this.shippings = [];
        if(properties && Object.keys(properties).length){
          for(let i = 0; i < Object.keys(properties).length; i++){
              let id = Object.keys(properties)[i]
              for(let is = 0; is < Object.keys(properties[id]).length; is++){
                  let sizes = Object.keys(properties[id])[is]
                  for(let ic = 0; ic < Object.keys(properties[id][sizes]).length; ic++){
                      let colors = Object.keys(properties[id][sizes])[ic]
                      if(properties[id][sizes][colors]["quantity"]) this.quantities.push(properties[id][sizes][colors]["quantity"])
                      if(properties[id][sizes][colors]["price"]) this.prices.push(properties[id][sizes][colors]["price"])
                      if(properties[id][sizes][colors]["tax"]) this.taxes.push(properties[id][sizes][colors]["tax"])
                      if(properties[id][sizes][colors]["total"]) this.totals.push(properties[id][sizes][colors]["total"])
                      if(properties[id][sizes][colors]["shipping"]) this.shippings.push(properties[id][sizes][colors]["shipping"])
                      if(properties[id][sizes][colors]["sub_total"]) this.sub_totals.push(properties[id][sizes][colors]["sub_total"])
                      this.colors.push(colors);
                      this.sizes.push(sizes);
                      this.ids.push(id);
                      this.titles.push({i:i, title:`${this.items[this.item_ids.indexOf(id)].title}, ${sizes}, ${colors}`, index:this.item_ids.indexOf(id)})
                  }
              }
          }
      }
    }

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
    getImageWidth(){
        for(let id = 0; id < this.items.length;id++){
            // let container_width = $(`#main-photo-cart-edit-container-${id}`).width();
            // let image_object = new Image();
            // image_object.src = $(`#main-photo-cart-edit-${id}`).attr("src");
            
            // let native_width = image_object.width;
            // let native_height = image_object.height;

            // if(native_height > native_width && native_height > 148){
            //     let multiplier = 148 / native_height
            //     let new_width = native_width * multiplier;
            //     $(`#main-photo-cart-edit-${id}`).height(148).width(new_width)
            //     $(`#main-photo-cart-review-${id}`).height(148).width(new_width)
            // } else if (native_height > native_width && native_height <= 148) {
            //     $(`#main-photo-cart-edit-${id}`).height(native_height).width(native_width)
            //     $(`#main-photo-cart-review-${id}`).height(native_height).width(native_width)
            // } else if (native_width > native_height && native_width > 300){
            //     let multiplier = container_width / native_width;
            //     let new_height = (native_height * multiplier) < 149 ? (native_height * multiplier) : 148;
            //     $(`#main-photo-cart-edit-${id}`).height(new_height).width(container_width);
            //     $(`#main-photo-cart-review-${id}`).height(new_height).width(container_width);
            // } else {
            //     $(`#main-photo-cart-edit-${id}`).height(native_height).width(native_width)
            //     $(`#main-photo-cart-review-${id}`).height(native_height).width(native_width)
            // }
            // $(`#main-photo-cart-edit-${id}`).css({'display':'block'});
            // $(`#main-photo-cart-review-${id}`).css({'display':'block'});
        }
    }
    loadScript( url, callback ) {
      let script = document.createElement( "script" )
      script.type = "text/javascript";
      script.async = true;
      script.onload = function() {
          callback();
        };
      script.src = url;
      document.getElementsByTagName( "head" )[0].appendChild( script );
    }
    addPaypalButton(){
      let component = this;
      let env = this._backend.PRODUCTION ? 'production' : 'sandbox'
      paypal.Button.render({
    
        env: env, // Optional: specify 'sandbox' environment
    
        payment: function(resolve, reject) {
               
            var CREATE_PAYMENT_URL = `${component._backend.SERVER_URL}/api/v1/cart/paypal?cart=${component.cartId}`;
                
            return paypal.request.post(CREATE_PAYMENT_URL)
                .then(function(data) { 
                  
                  component.location = 'processing';
                  component._location.go('/cart#processing');
                  $(`#processing-content`).slideDown();
                  $(`#payment-content`).slideUp();
                  resolve(data.paymentID);
                 })
                .catch(function(err) {
                   
                   reject(err); 
                  });
        },
        style:{
          color:"silver",
          shape:"rect",
          size:"small"
        },
        onAuthorize: function(data) {
        
            // Note: you can display a confirmation page before executing
            
            var EXECUTE_PAYMENT_URL = `${component._backend.SERVER_URL}/api/v1/cart/payment`;

            return paypal.request.post(EXECUTE_PAYMENT_URL,
                    { paypal:true, firstname:component.shippingForm.value.firstname, lastname:component.shippingForm.value.lastname, address:component.shippingForm.value.address, address_two:component.shippingForm.value.address_two, city:component.shippingForm.value.city, state:component.shippingForm.value.state, zip:component.shippingForm.value.zip, email:component.shippingForm.value.email, paymentID: data.paymentID, payerID: data.payerID, cart:component.cartId, Authorization: `Bearer ${component._auth.getToken()}` })
                    
                .then(function(data) { 
                  
                 if(data.success){
                    component._router.navigateByUrl(`/cart#success`);
                    component.location = 'success';
                    component._cartService.itemChange('clear','clear');
                    $(`#success-content`).slideDown();
                    $(`#processing-content`).slideUp();
                    component._cartService.emptyCart();
                    component.leaveTimeout =  setTimeout(()=>{
                      if(component.currentUser) component._router.navigateByUrl(`/user/${component.currentUser}/orders`)
                      else component._router.navigateByUrl(`/`);
                    },7000)
                  } else if(data.status === 409){
                    // $(`#edit-content`).slideDown();
                    // component.location = 'edit';
                    // component._location.go('/cart#edit');
                    $(`#processing-content`).slideUp();
                    $('#btn-continue').text('Next');
                    component._router.navigateByUrl(`/cart#edit`);
                    component.soldOutProducts(data.sold_out);
                    component.paying = false;
                  } else {
                    component.paying = false;
                    component.location = 'payment';
                    component._location.go('/cart#payment');
                    $(`#payment-content`).slideDown();
                    $(`#processing-content`).slideUp();
                  }
                 })
                .catch(function(err) {
                  
                  
                  component.paying = false;
                    component.location = 'payment';
                });
        },
         onCancel: function(data, actions) {
           
            component.paying = false;
            component.location = 'payment';
            component._location.go('/cart#payment');
            $(`#payment-content`).slideDown();
            $(`#processing-content`).slideUp();
        }

    }, '#paypal-button');
      // paypal.Button.render({
    
      //         env: 'sandbox', // Specify 'sandbox' for the test environment

      //         client: {
      //           sandbox : 'AXAeLzanJPWSCkqZz_Zt0ArGNTusnMj689YFYqlhl6L_Ond3-pIPPfVwKdOrIBUaEBYx-U4WLYfomDIx'

      //         },
      //          payment: function() {
        
      //             var env    = this.props.env;
      //             var client = this.props.client;
      //             
      //             return paypal.rest.payment.create(env, client, {
      //                 transactions: [
      //                     {
      //                         amount: { total: parseInt(component.order.total.toString().replace('$','')), currency: 'USD' }
      //                     }
      //                 ]
      //             });
      //         },
      //         style:{
      //           color:"silver",
      //           shape:"rect",
      //           size:"small"
      //         },

      //         commit:false,

      //         onAuthorize: function(data, actions) {
      //             
      //             // console.log
      //       }
                  
      //     }, '#paypal-button');
    }
    addScripts(){
      if(!this.addedScipts){
        this.loadScript("https://js.stripe.com/v2/", ()=>{});
        this.loadScript("https://www.paypalobjects.com/api/checkout.js",()=>{
          this.addPaypalButton();  
        });
        if(!$(`#cart-scripts`).data('added')){
          $(`#cart-scripts`).data('added',true);
        }
        this.addedScipts = true;
      }
    }
    proccessPaymentServer(){
      
      var headersInit = new Headers();
      headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
      let body = {paypal:false,token:this.token, cart:this.cartId, firstname:this.shippingForm.value.firstname, lastname:this.shippingForm.value.lastname, address:this.shippingForm.value.address, address_two:this.shippingForm.value.address_two, city:this.shippingForm.value.city, state:this.shippingForm.value.state, zip:this.shippingForm.value.zip, email:this.shippingForm.value.email}
      this.paymentSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/cart/payment`, body,{headers: headersInit}).subscribe(data => {
        
        clearTimeout(this.failedRequest);
        if(data.json().success){
          this._router.navigateByUrl(`/cart#success`);
          this.location = 'success';
          this._cartService.itemChange('clear','clear');
          $(`#success-content`).slideDown();
          $(`#processing-content`).slideUp();
          this._cartService.emptyCart();
         this.leaveTimeout =  setTimeout(()=>{
            if(this.currentUser) this._router.navigateByUrl(`/user/${this.currentUser}/orders`)
            else this._router.navigateByUrl(`/`);
          },7000)
        } else if(data.json().status === 409){
          // $(`#edit-content`).slideDown();
          // this.location = 'edit';
          // this._location.go('/cart#edit');
          $(`#processing-content`).slideUp();
          $('#btn-continue').text('Next');
          this._router.navigateByUrl(`/cart#edit`);
          this.soldOutProducts(data.json().sold_out);
          this.paying = false;
        } else if(data.json().card_fail) {
          this.paying = false;
          this.location = 'payment';
          this._location.go('/cart#payment');
          $(`#payment-content`).slideDown();
          $(`#processing-content`).slideUp();
          this.cardError = true;
        } else {
          this.paying = false;
          this.location = 'payment';
          this._location.go('/cart#payment');
          $(`#payment-content`).slideDown();
          $(`#processing-content`).slideUp();
          Materialize.toast("Something failed on our end. You were not charged. Please try again.", 4500, 'rounded-failure');
        }
      });
    }
    proccessPayment(){
      let component = this;
      this.paying = true;
      Stripe.card.createToken({
        number:$('#number').val().replace(/ /g,''),
        cvc:$('#security').val(),
        exp_month:$('#month').val(),
        exp_year:$('#year').val(),
        name:$('#holder').val(),
        address_zip:$('#zip').val()
      }, function stripeResponseHandler(status, response) {
        if (response.error) { // Problem!
          // Show the errors on the form
          component._location.go('/cart#payment');
          $(`#payment-content`).slideDown();
          $(`#processing-content`).slideUp();
          component.cardInvalid = true;
          component.location = 'payment';
          $(`#checkout-bar`).get(0).className = 'payment'
          component.watchCard();
          clearTimeout(component.failedRequest);
          component.paying = false;

          // $form.find('.payment-errors').text(response.error.message);
          // $form.find('button').prop('disabled', false); // Re-enable submission
        } else { // Token was created!
          // Get the token ID:
          var token = response.id;
          component.token = token;

          component.proccessPaymentServer();
          // Insert the token into the form so it gets submitted to the server:
          // $form.append($('<input type="hidden" name="stripeToken" />').val(token));
          // Submit the form:
          // $form.get(0).submit();
        }
      });
    }
    watchCardType(){
      // this is really ugly, may want to either use stripe's version or use a case statement with fall through.
      $(`#number`).on('keyup', ()=>{
        let val = $(`#number`).val().toString();
        let type,string;
        if(val.length && val.length < 5 ){
          if(val[0]==='4'){
            type = 'visa';
          } else if(val[0] === '5'){
              type = 'master';
              if(val.length > 1 && (val[1] != '1' || val[1] != '2' || val[1] != '3' || val[1] != '4' || val[1] != '5')){
                type=null;
              } 
          } else if(val[0] === '3'){
              type = 'amex';
              if(val.length > 1  && (val[1] != '4' && val[1] != '7')){
                type = null;
              }
          } else if(val[0] === '6'){
              type = 'discover'
              let check;
              if(val.length > 1 && (val[1] != '0' && val[1] != '5' && val[1] != '4')){
                type = null;
              } else if(val.length > 1 && (val[1] === '4' || val[1] === '0')){
                // continue checking
               check = true; 
              }
              if(type === 'discover' && check && val.length > 2 && ((val[2] != '4' && val[1] === '4') || (val[2] != '1' && val[1]==='0'))){
                type = null;
                check = false;
              } else if(type === 'discover' && val.length > 2 && check && val[2] === '4'){
                check = false
              }
              if(type === 'discover' && check && val.length > 3 && val[3]!='1'){
                type = null;
              }
          } 
        } else if(!val.length && this.cardType){
            type = null;
          }
          if(type != this.cardType && val.length < 5){
            if(this.cardType) $(`#${this.cardType}-logo`).fadeOut();
            if(type) $(`#${type}-logo`).fadeIn();
            this.cardType = type;
          }
      });
    }
    watchCard(){
      $(`#number,#month,#year,#security`).on('keyup', ()=>{
        this.cardInvalid = false;
      })
    }
    watchCardInputs(){
      let component = this;
      let m,y;
      $(`#month,#year,#security,#holder,#zip,#number`).on('keyup', function(){
        let type = $(this).data('type');
        
        switch(type){
          case 'holder':
            $('.credit-card-box .card-holder div').html($(this).val());
            break;
          case 'number':
            $('.credit-card-box .number').html($(this).val())
            // var number = $(this).val();
            // number = number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1').trim().substring(0, 19);
            // $(this).val(number);
            break;
          case 'month':
            m = $('#month').val();
            m = (m < 10 && m[0] != 0) ? '0' + m : m;
            y = $('#year').val();
            $('.card-expiration-date div').html(m + '/' + y);
            break;
          case 'year':
            m = $('#month').val();
            m = (m < 10 && m[0] != 0) ? '0' + m : m;
            y = $('#year').val();
            $('.card-expiration-date div').html(m + '/' + y);
            break;
          case 'security':
            $('.cvc div').html($(this).val());
            break;
        }
      });
      $('#security').on('focus', function(){
        $('.credit-card-box').addClass('hover');
      }).on('blur', function(){
        $('.credit-card-box').removeClass('hover');
      });
    }
    watchPaymentButtons(){
      let component = this;
      $(`.payment-btn`).on('click', function(){
        let type = $(this).data('type');
        if(type === 'cc'){
          $(`#credit-card-container`).css({'display':'initial'})
          $(`.select-payment-type`).removeClass('active');
          $(`.select-payment-type-buttons`).removeClass('active');
          if(window.outerWidth > 374) $('#paypal-button').css({'margin-top':0});
          $('#number').on('keypress change', function () {
            $(this).val(function (index, value) {
              return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');
            });
          });
          
          component.watchCardInputs();
          component.watchCardType();
          let key = component._backend.PRODUCTION ? "pk_live_YkhyJSZtzYAbhKzfkYEYPmuu" : "pk_test_rDbUqm3vwXDwL7d9ITAtj5TF"
          Stripe.setPublishableKey(key);
        } else {
         
        }
      });
    }
    arrayUnique(array) {
        for(let i=0; i<array.length; ++i) {
            for(let j=i+1; j<array.length; ++j) {
                if(array[i] === array[j] && i != 0) array.splice(j--, 1);
            }
        }

        return array;
    }

    soldOutProducts(products){
      let ids  = [];
      for(let i = 0; i < Object.keys(products).length; i++){
        let id = Object.keys(products)[i]
        for(let is = 0; is < Object.keys(products).length; is++){
          let size = Object.keys(products[id])[is]
          for(let ic = 0; ic < Object.keys(products).length; ic++){
            let color = Object.keys(products[id][size])[ic]
            ids.push(`${id}, ${size}, ${color}`);
          }
        }
      }
      let quantities = [];
      for(let i = 0; i < ids.length; i++){
        quantities.push(products[ids[i]]);
      }
      let id_array = this.soldOutIds.concat(ids);
      let quant_array = this.soldOutQuantities.concat(quantities);
      if(ids)this.soldOutIds = this.arrayUnique(id_array);
      if(quantities) this.soldOutQuantities = this.arrayUnique(quant_array);
      if(ids){
        for(let i = 0; i < this.soldOutIds.length; i++){
          let product_index = this.ids.indexOf(this.soldOutIds[i].split(',')[0]);
          this.items[this.item_ids.indexOf(this.ids[product_index])].quantity = this.soldOutQuantities[i];
          $(`#item-${this.soldOutIds[i].replace(/(\s|,)/g, '-')}`).css({'outline':'1px solid red'})
          
          
          if(this.soldOutQuantities[i] > 0) $(`#item-${this.soldOutIds[i].replace(/ /g, '-')}-less`).text(`This item now only has ${this.soldOutQuantities[i]} left.`).css({'display':'initial'})
          else $(`#item-${this.soldOutIds[i].replace(/(\s|,)/g, '-')}-sold-out`).css({'display':'initial'})
        }
      }
    }
    photoZoom(i,type){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-cart-${type}-${i}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }

    redirectUser(){
      if(this.leaveTimeout) clearTimeout(this.leaveTimeout)
      if(this.currentUser) this._router.navigateByUrl(`/user/${this.currentUser}/orders`)
      else this._router.navigateByUrl('/')
    }

     private areEqual(group: FormGroup) {
      if(group.controls['password'].value === group.controls['confirmPassword'].value) return null;
      return {areEqual: true};
    }
  
    ngOnDestroy(){
        if(this.leaveTimeout) clearTimeout(this.leaveTimeout);
        if(this.zoomedPhoto) this.zoomedPhoto.destroy();
        if(this.subscription) this.subscription.unsubscribe();
        if(this.routerSubscription) this.routerSubscription.unsubscribe();
        if(this.OrderSubscription) this.OrderSubscription.unsubscribe();
        if(this.userSubscription) this.userSubscription.unsubscribe();
        if(this.userInfoSubscription) this.userInfoSubscription.unsubscribe();
        if(this.paymentSubscription) this.paymentSubscription.unsubscribe();
        if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
        if(this.updateSubscription) this.updateSubscription.unsubscribe();
        if(this.watchCartSubscription) this.watchCartSubscription.unsubscribe();
        // small memory leaks, but memory leaks none of the less
        $("#month,#year,#security,#holder,#zip,#number").unbind('keyup');
        $("#number").unbind('keypress change');
        $("#security").unbind('focus blur');
        $(`.payment-btn`).unbind('click');
    }
}
