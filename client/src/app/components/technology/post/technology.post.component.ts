import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {CartService} from '../../../services/cart.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {ModalComponent} from '../../modal/modal.component';
import {CommentsLoopComponent} from '../../comments/loop/comments.loop.component';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {VoteService} from '../../../services/vote.service';
import {AdminGuard} from '../../../services/admin.guard.service';
import {SystemPostsModalComponent} from '../../system/posts/modal.component'
import {BackendService} from '../../../services/backend.service';
import {AdminPostsModalComponent} from '../../system/admin/admin.posts.modal.component'
import {CommentsComponent} from '../../comments/comments.component';

declare var $;
declare var CloudZoom;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'technology_post',
  templateUrl: 'technology.post.component.html',
  providers: [ModalComponent,SystemMessagesComponent],
  entryComponents:[CommentsComponent]
})

export class TechnologyPostComponent implements OnInit {
    reportForm: FormGroup;
    rating: FormGroup;
    subscription:any;
    routeSubscription:any;
    ratingSubscription:any;
    likeSubscription:any;
    voteSubscription:any;
    lockSubscription:any;
    routerSubscription:any;
    watchVoteSubscription:any;
    removeSubscription:any;
    post:any;
    id:any;
    technology:any=[];
    postId:number;
    title:string;
    submitted_by:string;
    created_at:string;
    average_vote:string;
    marked:string;
    user_voted:number;
    user_liked:boolean;
    likes_count:number;
    category:string;
    sub_category:string;
    average_rating_count:number;
    average_rating:number;
    upvotes:number;
    downvotes:number;
    votes_count:number;
    average_vote_width:number;
    has_reported:boolean;
    photos:any=[];
    photos_nsfw:any=[];
    myInstance:any;
    price:any;
    sale_price:number;
    quantity:any;
    color:string;
    size:number;
    post_type:string;
    showReportForm:boolean=false;
    passedParams:boolean=false;
    advancedStatisticsShow:boolean=false;
    rateOpen:boolean=false;
    currentUser:string;
    has_rated:boolean=false;
    average_fit:number;
    average_fit_count:number;
    ratingError:boolean=false;
    quantities:any=[];
    quantitySelected:number=1;
    addedToCart:boolean=false;
    locked:boolean;
    archived:boolean;
    options:any=['Small','A little small', 'Perfect', 'A little big', 'Big'];
    isAdmin:boolean;
    datanotify:any;
    math:any=Math;
    window:any=window;
    specific:string; //uid of a comment that's being viewed.
    worked:boolean=false;
    cart_quantities:any=[];
    cart_ids:any=[];
    dataadmin:any;
    loaded:boolean=true;
    routed:boolean=false;
    route_time:any;
    flagged:boolean=false;
    nsfw:boolean=false;
    nsfw_ok:boolean=false;
    shipping:any;
    showDeleteForm:boolean=false;
    width:any;
    height:any;
    depth:any;
    showSocialsFlag:boolean=false;
    description:string='';
    sizes:any=[];
    colors:any=[];
    prices:any=[];
    quants:any=[];
    sizeSelected:any;
    colorSelected:any;
    properties:any;
    quantityLookUps:any=[];
    sold_out:boolean=false;
    approved:boolean=false;
    constructor(private _auth: AuthService, private _voteService: VoteService, private _backend: BackendService, private _admin: AdminGuard, private _fb:FormBuilder, private _sysMessages: SystemMessagesComponent, private _cart: CartService, private _route: ActivatedRoute, private _http: Http, private _modal: ModalComponent, private _router: Router){
      this.routerSubscription = _router.events.subscribe(s => {
        
        if(s && s["state"] && this.loaded){
          let url_bits = s["url"].split('/')
          if(url_bits.length === 5 && url_bits[4] != this.id){
            this.category = decodeURI(url_bits[2]);
            this.sub_category = decodeURI(url_bits[3]);
            this.id = url_bits[4];
            this.addedToCart = false;
            this.sizes = [];
            this.colors = [];
            this.width = null;
            this.height = null;
            this.depth = null;
            this.colorSelected = null;
            this.sizeSelected = null;
            this.quantities = [];
            this.quantitySelected = null;
            this.quantitySelected = 1;
            if(this.myInstance) this.myInstance.destroy();
            this.routed = true;
					  this.route_time = new Date();
            $("#technology-post-container").removeClass('active-post');
            this.getTechnologyPost();
          }
        }
      })
    };
	  ngOnInit(){
      let quantity = this._cart.getQuantity();
      this.cart_quantities = [];
      this.cart_ids = [];
      for(let i = 0; i < quantity.length;i++){
          this.cart_ids.push(quantity[i][0]);
          this.cart_quantities.push(quantity[i][3]);
          this.quantityLookUps.push(`${quantity[i][0]}, ${quantity[i][1]}, ${quantity[i][2]}`);
      }
      this.rating = this._fb.group({
        'rating': [null],
        'fit': [null]
      })
      this.reportForm = this._fb.group({
          'foul': [null, Validators.required]
      })  
      this.currentUser = localStorage.getItem('username') || '';
      this.isAdmin = this._admin.isAdmin();
      this.routeSubscription = this._route.params.subscribe(params => {this.category = params['category']});
      this.routeSubscription = this._route.params.subscribe(params => {this.sub_category = params['subcategory']});
      this.routeSubscription = this._route.params.subscribe(params => {this.id = params['post']});
      this.routeSubscription = this._route.params.subscribe(params => {this.specific = params['comment']});
      this.getTechnologyPost();
      this.voteCheck();
      if(window.outerWidth < 451) $("#share-button-technology-post").removeClass("horizontal btn-large").addClass("btn-medium");
    };
    getTechnologyPost(){
      var headersInit = new Headers();
      headersInit.append('id', this.id);
      headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
      headersInit.append('maincategory', this.category)
      headersInit.append('subcategory', this.sub_category)
      let spinner,spinnerTimeout;
      spinnerTimeout = setTimeout(()=>{
        spinner = true;
        $("#loading-spinner-technology-post").fadeIn().css("display","inline-block");
      },300)
      this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/technology/${this.category}/${this.sub_category}/${this.id}`,{headers: headersInit}).subscribe(data => {
          this.technology = data.json().post;
          this.postId = data.json().post.uuid;
          this.title = data.json().post.title;
                    this.post_type = data.json().post.post_type;
            // this.link = data.json().post.link;
            // this.post_type = data.json().post.post_type;
            let nonColors = ['width','height','depth']
            this.properties = data.json().post.properties;
            let sizes;
            if(this.category === 'shoes'){
              sizes = Object.keys(this.properties).sort()
            } else {
              let sort=['small','medium','large','xl','xxl','xxxl','same-size']
              sizes = Object.keys(this.properties).map(function(size){
                let n = sort.indexOf(size) 
                // setting the sort value to '' doesn't really do anything - assuming we don't get duplicate sizes! - but we shall leave it there anyways.
                sort[n] = ''
                return [n,size]
              }).sort().map(function(j){return j[1]})
            }
            let first_value = null;
            for(let i = 0; i < Object.keys(this.properties).length; i++){
              let size = sizes[i]
                for(let ic = 0; ic < Object.keys(this.properties[size]).length; ic++){
                  let colors = Object.keys(this.properties[size]).sort()
                  let color = colors[ic]
                  if((first_value === null || first_value === i) && (nonColors.indexOf(color) > -1 || parseInt(this.properties[size][color]["quantity"]) > 0)){
                    if(color === 'width') this.width = this.properties[size][color]
                    else if (color === 'depth') this.depth = this.properties[size][color]
                    else if (color === 'height') this.height = this.properties[size][color]
                    first_value = i;
                  }
                  if(nonColors.indexOf(color) === -1 && i === first_value && parseInt(this.properties[size][color]["quantity"]) > 0) this.colors.push(color);
                  if(this.sizes.indexOf(size) === -1 && parseInt(this.properties[size][color]["quantity"]) > 0) this.sizes.push(sizes[i])
                }
            }
          if(this.sizes.length){
              this.sizeSelected = this.sizes[0];
              this.colorSelected = this.colors[0];
              if(this.cart_ids.indexOf(this.postId) > -1){ 
                let index = this.quantityLookUps.indexOf(`${this.postId}, ${this.sizeSelected}, ${this.colorSelected}`)
                if(index > -1){
                  this.quantitySelected = this.cart_quantities[index]
                  this.addedToCart = true;
                }
              }
            } else {
              this.sold_out = true;
            }
            
            
            
          this.price = !this.colors.length ? '-' : this.properties[this.sizeSelected][this.colorSelected]["price"]
          this.quantity = !this.colors.length ? '-' : this.properties[this.sizeSelected][this.colorSelected]["quantity"]
          this.submitted_by = data.json().post.submitted_by;
          this.created_at = data.json().post.time_ago;		
          this.average_vote = data.json().post.average_vote;
          this.marked = data.json().post.marked;
          this.user_voted = data.json().post.user_voted;
          this.user_liked = data.json().post.user_liked;
          this.likes_count = data.json().post.likes_count;
          this.post_type = data.json().post.post_type;
          this.category = data.json().post.main_category;
          this.sub_category = data.json().post.sub_category;
          this.shipping = !this.sold_out ? data.json().post.shipping : '-';
          this.average_rating_count = data.json().post.ratings_count;
          this.average_rating = data.json().post.average_rating;
          this.upvotes = data.json().post.upvotes;
          this.downvotes = data.json().post.downvotes;
          this.votes_count = data.json().post.votes_count;
          this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
          this.shipping = data.json().post.shipping;
          this.has_reported = data.json().post.user_flagged;
          this.photos = data.json().post.upload_urls;
          this.photos_nsfw = data.json().post.upload_urls_nsfw;
          this.archived = data.json().post.archived;
          this.locked = data.json().post.locked;
          this.quantities = [];
          for(let i = 0;i < this.quantity; i++){ this.quantities.push((i+1)) }// this is done for the quantity select
          this.color = data.json().post.color;
          this.worked = data.json().post.worked;
          this.flagged = data.json().post.flagged;
          this.nsfw = data.json().post.nsfw;
          this.description = data.json().post.description;
          this.loaded = true;
          this.approved = data.json().post.approved;
          let newTime;
          if(this.routed) this.post = ['reset'];
          if(this.routed) this.passedParams = false;
          if(this.routed) newTime = new Date();
          let time = this.routed && this.route_time && newTime && (newTime - this.route_time < 250)  ? (250 - (newTime - this.route_time)) : 50; 
          this.routed = false;
          this.quantities = [];
          for(let i = 0;i < this.quantity; i++){ this.quantities.push((i+1)) }// this is done for the quantity select
          if(spinnerTimeout) clearTimeout(spinnerTimeout);
          setTimeout(()=>{
                  if(spinner) $("#loading-spinner-technology-post").css({'display':'none'}); $("#technology-post-container").addClass('active-post');
                  if(!this.nsfw) $("#sfw-images-container").css({'display':'block'});
                  else $("#nsfw-images-container").css({'display':'block'});
                  $("#technology-post-container").addClass('active-post');
                  if(this.worked){
                    let options = {disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}
                  // $('#myImage').CloudZoom(options);                  // jQuery way.
                    if(this.photos.length && $('#main-photo-technology').length) this.myInstance = new CloudZoom($('#main-photo-technology'),options);
                  }
                  if(this.specific) {
                      this.post = ['technology', this.postId, this.category, this.specific]  //this is passed to the comments component;
                      this.passedParams = true;
                      setTimeout(()=>{
                        $(".view-all-comments").get(0).scrollIntoView(true);
                      },5)
                    }
                  else this.watchScroll();
                  this.checkMainPhoto();
                  this.getImageWidth();
                  _setMeta.setPost(data.json().post.title,`${data.json().post.description.substring(0,30)}...`,'technology',data.json().post.main_category)
              },time);
          // this.form = data.json().post.form;
          // this.hidden = data.json().post.hidden;
          // this.categories = data.json().post.categories;
        
      }, errors => {
        if(errors.status === 404) {
          this._sysMessages.setMessages('noTechnology');
          this._router.navigateByUrl('/technology',{ replaceUrl: true });
        } else if(errors.status === 410){
          this._sysMessages.setMessages('removedPost');
          this._router.navigateByUrl('/technology',{ replaceUrl: true });
        } else {
          // this.error = true;
        }
      });
    }
    buyNow(){
      if(this.approved){
        if(this.technology && this.quantitySelected ){
          // fourth variable (true) is to indicate that it's buy it now.
          // the third variable is for the edit
          this._cart.itemChange(this.technology, {quantity:this.quantitySelected,size:this.sizeSelected,color:this.colorSelected},false,true);
        }
      } else {
        Materialize.toast("Can't add an item to the cart that hasn't been approved.", 3500, 'rounded-failure')
      }
    }
    submitRating(value,type){
    // Try an outline on the photos instead of a border
    // see how orange text looks for the artist.


      let body;
      if(value.rating === null){
        Materialize.toast("Rating value is required", 3000, 'rounded-failure')
        return false;
      }
      let headers = new Headers({
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
        });

        body = {"id":this.postId,"type":type,"category":this.category, "subcategory":this.sub_category,"rating":value.rating,"fit":value.fit}
        this.ratingSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/ratings/new`, body, {headers: headers}).subscribe(data => {
          if(data.json().success){
            this.rateOpen = false;
            this.has_rated = true;
            this.average_rating = data.json().average_rating;
            this.average_rating_count = data.json().average_rating_count;
            this.average_fit = data.json().average_fit;
            this.average_fit_count = data.json().average_fit;
          }
          if(data.json().status === 401){
              this._modal.setModal('technology', this.category, this.sub_category, this.id);
          }  else if (data.json().locked){
            this.datanotify=[this.postId,'technology','locked'];
          } else if(data.json().archived){
            this.datanotify=[this.postId,'technology','archived'];
          } else if(data.json().poor_rating){
            Materialize.toast("<i class='fa fa-lock'></i> It can't be that bad...", 3000, 'rounded-failure')
          } else if(data.json().flagged){
            this.datanotify=[this.postId,'technology','flagged'];
          }
      })
    }
    showSocials(){
      if(this.showSocialsFlag){
        $(".hidden-socials").fadeOut(175,()=>{
          $("#show-socials-icon").css({'transform':'rotate(0deg)'})
          $(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '-96px' : '9px'} !important`)
        });
      } else {
        $("#show-socials-icon").css({'transform':'rotate(180deg)'})
        $(".share-button-container").prop('style',`left:${window.outerWidth > 450 ? '65px' : '9px'} !important`)
        $(".hidden-socials").fadeIn();

      }
      this.showSocialsFlag = !this.showSocialsFlag;
    }
    voteChange(id,vote,user_voted){
      if(id === this.postId){
        this.average_vote = vote;
        this.user_voted = user_voted;
      }
    }

  sizeChange(e){
    
    this.price = '-';
    this.quantity = '-';
    this.quantities = [];
    let size = $("#sizes").val();
    let nonColors = ['width','height','depth'];
    this.colors = [];
    for(let i =0; i < Object.keys(this.properties[size]).length;i++){
      let color = Object.keys(this.properties[size])[i]
      if(nonColors.indexOf(color) === -1 && parseInt(this.properties[size][color]["quantity"]) > 0) this.colors.push(color);
      else this[color] = this.properties[size][color];
    }
  
    this.colorSelected = null;
    this.addedToCart = false;
  }
  colorChange(e){
    let size = this.sizeSelected;
    let color = this.colorSelected;
    this.addedToCart = false;
    this.quantity = this.properties[size][color]["quantity"];
    this.quantities = [];
    for(let i = 0;i < this.quantity; i++){ this.quantities.push((i+1)) }
      this.price = this.properties[size][color]["price"];
      if(this.cart_ids.indexOf(this.postId) > -1){ 
        let index = this.quantityLookUps.indexOf(`${this.postId}, ${this.sizeSelected}, ${this.colorSelected}`)
        if(index > -1){
          this.quantitySelected = this.cart_quantities[index]
          this.addedToCart = true;
        } else if(this.quantities.length) {
          this.quantitySelected = this.quantities[0];
        }
      }
    }
    hoverNSFWButton(){
      if(this.myInstance) this.myInstance.closeZoom();
    }
    toggleNSFW(type){
      let index = $('.rest-photos.active-photo').data('index');
      let $technology = $('#technology-post-images-container');
      let height = $technology.height()
      $technology.css({'min-height':height})
      this.nsfw_ok = type;
      setTimeout(()=>{
        this.changePhoto(parseInt(index));
        this.getImageWidth();
        this.checkMainPhoto();
        if(type === false) $("#nsfw-images-container").fadeIn(250);
        else $("#sfw-images-container").fadeIn(250);
      },1)
    }
    setVote(vote){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":this.postId, "type":this.post_type, "category":this.category, "subcategory": this.sub_category, "vote":vote}
        this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
	           let change;
				    if(vote === 1 && this.user_voted) change = this.user_voted === 1 ? -1 : 2;
				    else if(vote === 1 && !this.user_voted) change = 1;
				    else if(vote === -1 && this.user_voted) change = this.user_voted === -1 ? +1 : -2;
				    else if(vote === -1 && !this.user_voted) change = -1;
	          this.voteChange(this.postId,this.average_vote+change,data.json().user_vote)
            this._voteService.change('technology',this.postId,this.average_vote+change,data.json().user_vote);
            this.upvotes = data.json().upvotes;
            this.downvotes = data.json().downvotes;
            this.votes_count = data.json().votes_count;
            this.average_vote_width = this.votes_count ? Math.round(((this.upvotes)/(this.votes_count)*100)) : 0;
	        }
	        if(data.json().status === 401){
	              this._modal.setModal('technology', this.category, this.sub_category, this.id);
	        }  else if (data.json().locked){
            this.datanotify=[this.postId,'technology','locked'];
          } else if(data.json().archived){
            this.datanotify=[this.postId,'technology','archived'];
          } else if(data.json().flagged){
            this.datanotify=[this.postId,'technology','flagged'];
          }
	      });
	      // upVoteSubscription.unsubscribe();
	  }
    voteCheck(){
      this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
        if(value.length){
         this.voteChange(value[0],value[1],value[2]);
        }
      });
    }
    like(id,value,category,subcategory,type){
	    let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.postId,"type":type,"category":category, "subcategory":subcategory}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      if(data.json().success){  
	      	this.likes_count = data.json().likes_count;    
	        if(!data.json().user_liked){
	        	$(`#icon-likes-${id}`).addClass(' liked-icon');
	        	$(`#likes-button-${id}`).addClass(' liked');
	        }
	        else if(data.json().user_liked){
	        	$(`#icon-likes-${id}`).removeClass('likes-icon');
	        	$(`#likes-button-${id}`).removeClass('liked');
	        } 
	        this.user_liked = !this.user_liked;

	      }
	      if(data.json().status === 401){
	          this._modal.setModal('technology', this.category, this.sub_category, this.id);
        } else if (data.json().locked){
          this.datanotify=[this.postId,'technology','locked'];
        } else if(data.json().archived){
          this.datanotify=[this.postId,'technology','archived'];
        } else if(data.json().flagged){
          this.datanotify=[this.postId,'technology','flagged'];
        }
	    });
	}
      getImageWidth(){
        for(let id = 0; id < this.photos.length;id++){
          // let image_object = new Image();
          // image_object.src = $(`#rest-photos-technology-${id}`).attr("src");
          // let native_width = image_object.width;
          // let native_height = image_object.height;
          // if(native_height > native_width && native_height > 148){
          //     let multiplier = 148 / native_height
          //     let new_width = native_width * multiplier;
          //     $(`#rest-photos-technology-${id}`).height(148).width(new_width)
          // } else if (native_height > native_width && native_height <= 148) {
          //     $(`#rest-photos-technology-${id}`).height(native_height).width(native_width)
          // } else if (native_width > native_height && native_width > 300){
          //     let multiplier = 300 / native_width;
          //     let new_height = (native_height * multiplier) < 149 ? (native_height * multiplier) : 148;
          //     $(`#rest-photos-technology-${id}`).height(new_height).width(300);
          // } else {
          //     $(`#rest-photos-technology-${id}`).height(native_height).width(native_width)
          // }
          $(`#rest-photos-technology-${id}`).css({'display':'initial'});
        }
    }
    checkMainPhoto(){
        // let image_object = new Image();
        // image_object.src = $("#main-photo-technology").attr("src");
        
        // let native_width = image_object.width;
        // let native_height = image_object.height;
        // if(native_height > native_width && native_height > 400){
        //     let multiplier = 400 / native_height
        //     let new_width = native_width * multiplier;
        //     $("#main-photo-technology").height(400).width(new_width)
        // } else if (native_height > native_width && native_height <= 400) {
        //     $("#main-photo-technology").height(native_height).width(native_width)
        // } else if (native_width > native_height && native_width > 500){
        //     let multiplier = 500 / native_width;
        //     let new_height = native_height * multiplier;
        //     $("#main-photo-technology").height(new_height).width(500);
        // } else {
        //     $("#main-photo-technology").height(native_height).width(native_width)
        // }
        $("#main-photo-technology").css({'display':'initial'});
        $("#main-photo-technology").data('scaled',true);
    }
    showAdvancedStatistics(){
      this.advancedStatisticsShow = !this.advancedStatisticsShow;
      this.showReportForm = false;
    }
    encode(string){
		  return encodeURIComponent(string);
	  }
    removeFromCart(){
      if(this.technology) this._cart.itemChange(this.technology, {quantity:0,size:this.sizeSelected,color:this.colorSelected});
      this.addedToCart = false;
      let index = this.quantityLookUps.indexOf(`${this.postId}, ${this.sizeSelected}, ${this.colorSelected}`)
      
      this.quantityLookUps.splice(index,1)
      this.cart_quantities.splice(index,1);
      this.cart_ids.splice(index,1);
    }
    addToCart(){
      if(this.approved){
        if(this.addedToCart) Materialize.toast("Updated Quantity", 3000, 'rounded-success')
        if(this.technology && this.quantitySelected ) this._cart.itemChange(this.technology, {quantity:this.quantitySelected,size:this.sizeSelected,color:this.colorSelected});
        this.addedToCart = true;
        let index = this.quantityLookUps.indexOf(`${this.postId}, ${this.sizeSelected}, ${this.colorSelected}`)
        if(index > -1){
          this.cart_quantities[index] = this.quantitySelected;
        } else {
          this.cart_ids.push(this.postId);
          this.cart_quantities.push(this.quantitySelected);
          this.quantityLookUps.push(`${this.postId}, ${this.sizeSelected}, ${this.colorSelected}`);
        }
      } else {
        Materialize.toast("Can't add an item to the cart that hasn't been approved.", 3500, 'rounded-failure')
      }
    }
    watchScroll(){
      let component = this;
      $(window).scroll(function(){
        if(!component.passedParams){
          if ($('.comments') && $(this).scrollTop() > ($('.comments').offset().top - 500)) {
            if(!component.passedParams){component.post = ['technology', component.postId, component.category, component.sub_category, component.specific] } //this is passed to the comments component;
            component.passedParams = true;
          }
        }
      });
    }
    toggleReportForm(){
		  this.showReportForm = !this.showReportForm;
	  }
    toggleRateForm(){
		  this.rateOpen = !this.rateOpen;
		  this.showReportForm = false;
	  }
    toggleDeleteForm(){
      this.showDeleteForm = !this.showDeleteForm;
    }
    editPost(){
		  this._router.navigateByUrl(`/technology/edit?title=${this.title}&category=${this.category}&subcategory=${this.sub_category}&id=${this.id}`);
	  }
        lockInit(){
      this.datanotify=[this.postId,'technology','check','lock'];
    }
    removeInit(){
      this.datanotify=[this.postId,'technology','check','remove'];
    }
    adminInit(){
		  this.dataadmin=[this.postId,this.post_type,this.category,null];
	  }
    lockPost(event){
       let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":this.postId,"type":'technology'}
	    this.lockSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/lock`, body, {headers: headers}).subscribe(data => {
          if(data.json().success){
            this.locked = true;
            Materialize.toast("<i class='fa fa-lock'></i> Post Successfully Locked", 3000, 'rounded-success')
          }
      });
    }
    removePost(event){
      let headers = new Headers({
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
      });
      let body = {"id":this.postId,"type":'apparel'}
      this.removeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/posts/remove`, body, {headers: headers}).subscribe(data => {
            if(data.json().success){
              this.locked = true;
              Materialize.toast("<i class='fa fa-close'></i> Post Successfully Removed", 3000, 'rounded-success')
            }
        });
    }
    changePhoto(index){
        let currentActive = $('.rest-photos.active-photo');
        let newActive = $(".rest-photos-containers").find(`[data-index='${index}']`).find('img');
        let src = newActive.attr('src');
        currentActive.removeClass('active-photo');
        newActive.addClass('active-photo');
        this.myInstance.destroy();
        $('#main-photo-technology').attr('src', src);
        let options = {disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}
        this.myInstance = new CloudZoom($('#main-photo-technology'),options);
    }
    transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
    ngOnDestroy(){
      if(this.myInstance) this.myInstance.destroy();
      this.passedParams = true; // the binding to the scroll is never truly unbound. - need to fix this. But still need the to top.
      if(this.subscription) this.subscription.unsubscribe();
      if(this.routeSubscription) this.routeSubscription.unsubscribe();
      // if(this.addToCartSubscription) this.addToCartSubscription.unsubsribe();
      if(this.likeSubscription) this.likeSubscription.unsubscribe();
      if(this.voteSubscription) this.voteSubscription.unsubscribe();
      if(this.ratingSubscription) this.ratingSubscription.unsubscribe();
      if(this.lockSubscription) this.lockSubscription.unsubscribe();
      if(this.routerSubscription) this.routerSubscription.unsubscribe();
      if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
      if(this.removeSubscription) this.removeSubscription.unsubscribe();
    }
}
