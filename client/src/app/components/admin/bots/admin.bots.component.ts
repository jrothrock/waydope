import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';

declare var $;
declare var marked;
declare var Materialize;

var apparelCategories = [
    {value: 'accessories', text: 'Accessories'},
    {value: 'outerwear', text: 'Outerwear'},
    {value: 'shirts', text: 'Shirts'},
    {value: 'pants', text: 'Pants'},
    {value: 'shoes', text: 'Shoes'}
]
var technologyCategories = [
    {value: 'computers', text: 'Computers'},
    {value: 'phones', text: 'Phones'},
    {value: 'tablets', text: 'Tablets'},
    {value: 'wearables', text: 'Wearables'},
    {value: 'speakers', text: 'Speakers'},
    {value: 'televisions', text: 'Televisions'},
    {value: 'video-games', text: 'Video Games'},
    {value: 'miscellaneous', text: 'Miscellaneous'}
]
var accessoryList = [
    {
        text: 'Backpacks',
        value: 'backpacks'
    },
    {
        text: 'Belts',
        value: 'belts'
    },
    {
        text: 'Hats',
        value: 'hats'
    },
    {
        text: 'Watches',
        value: 'watches'
    }
];
var outerwearList = [
    {
        text: 'Coats',
        value: 'coats'
    },
    {
        text: 'Heavy',
        value: 'heavy'
    },
    {
        text: 'Jackets',
        value: 'jackets'
    },
    {
        text: 'Rain coats',
        value: 'rain coats'
    },
    {
        text: 'Sweatshirt',
        value: 'sweatshirt'
    },
    {
        text: 'Throwovers',
        value: 'throwovers'
    }
];
var pantList = [
    {
        text: 'Athletic',
        value: 'athletic'
    },
    {
        text: 'Dress',
        value: 'dress'
    },
    {
        text: 'Jeans',
        value: 'jeans'
    },
    {
        text: 'Shorts',
        value: 'shorts'
    },
    {
        text: 'Sweatpants',
        value: 'sweatpants'
    }
];
var shirtList = [
    {
        text: 'Athletic',
        value: 'athletic'
    },
    {
        text: 'Dress',
        value: 'dress'
    },
    {
        text: 'Long Sleeve',
        value: 'long-sleeve'
    },
    {
        text: 'Short Sleeve',
        value: 'short-sleeve'
    },
    {
        text: 'Tank',
        value: 'tank'
    }
];
var shoeList = [
    {
        text: 'Athletic',
        value: 'athletic'
    },
    {
        text: 'Casual',
        value: 'casual'
    },
    {
        text: 'Dress',
        value: 'dress'
    },
    {
        text: 'Flip-Flops/Sandals',
        value: 'flip-flops/sandals'
    }
];
var computersList = [
    {
        text: 'Laptop',
        value: 'laptop'
    },
    {
        text: 'Desktop',
        value: 'Desktop'
    },
    {
        text: 'Parts',
        value: 'parts'
    }
];
var phonesList = [
    {
        text: 'Cell Phones',
        value: 'cell-phones'
    },
    {
        text: 'Cell Phone Cases',
        value: 'cell-phone-cases'
    },
    {
        text: 'Cell Phone Accessories',
        value: 'cell-phone-accessories'
    }
];
var tabletList = [
    {
        text: 'Tablets',
        value: 'tablets'
    },
    {
        text: 'Tablet Cases',
        value: 'tablet-cases'
    },
    {
        text: 'Tablet Accessories',
        value: 'tablet-accessories'
    }
];
var wearablesList = [
    {
        text: 'Watches',
        value: 'watches'
    },
    {
        text: 'Fitness',
        value: 'fitness'
    },
    {
        text: 'Other',
        value: 'other'
    }
];
var speakerList = [
    {
        text: 'Home Audio',
        value: 'home'
    },
    {
        text: 'Car Audio',
        value: 'car'
    }
];
var televisionList = [
    {
        text: 'HD',
        value: 'hd'
    },
    {
        text: '3D',
        value: '3d'
    },
    {
        text: '4K',
        value: '4k'
    },
    {
        text: 'Projectors',
        value: 'projectors'
    }
];
var videoGameList = [
    {
        text: 'Xbox',
        value: 'xbox'
    },
    {
        text: 'Playstation',
        value: 'playstation'
    },
    {
        text: 'PC',
        value: 'pc'
    },
    {
        text: 'Handheld',
        value: 'handheld'
    }
];


@Component({
  selector: 'admin_bots',
  templateUrl: 'admin.bots.component.html',
})

export class AdminBotsComponent implements OnInit {
    routeSubscription:any;
    votesSubscription:any;
    commentsSubscription:any;
    likesSubscription:any;
    ratingsSubscription:any;
    usersSubscription:any;
    updateUserSubscription:any;
    postSelectize:any;
    subSelectize:any;
    dropDownSelectize:any;
    post_types:any=['news','music','videos','apparel','technology','users','comments'];
    post_types_comments:any=['news','music','videos','apparel','technology']; // this is for finding the correct post type when comment is selected.
    types:any=['votes', 'likes', 'ratings', 'comments'];
    categories:any;
    mainCategory:string;
    id:number;
    subCategory:string;
    type:string='news';
    selectize:any;
    comment_type:string;
    comment:boolean=false;
    url:string=`${this._backend.SERVER_URL}/api/v1/categories/boards/search/`;
    post_url:string=`${this._backend.SERVER_URL}/api/v1/categories/boards/search/post`;
    comment_url:string=`${this._backend.SERVER_URL}/api/v1/categories/comments/search`;
	constructor(private _http: Http, private _backend: BackendService, private _router: Router, private _route : ActivatedRoute, private _sysMessages:SystemMessagesComponent, private _auth:AuthService){};
	ngOnInit(){
        this.routeSubscription = this._route.params.subscribe(params => {this.id = params['id']});
        this.watchTypeInputs();
        this.watchPostType();
        setTimeout(()=> {
            this.selectizeInit();
        }, 300);
        this.postSelectizeInit();
	};
    watchPostType(comment=false){
        let $watch = comment ? $('#pt2') : $('#pt');
        $watch.on('change', ()=>{
            
            let value = $watch.val()
            if(comment) this.comment_type = value;
            
            switch(value){
                case 'news':
                    this.dropDownSelectize = null;
                    this.selectize = null;
                    this.type = 'news';
                    this.url = `${this._backend.SERVER_URL}/api/v1/categories/boards/search/`;
                    this.post_url=`${this._backend.SERVER_URL}/api/v1/categories/boards/search/post`;
                    if(!this.selectize) this.selectizeInit();
                    
                    setTimeout(()=>{
                        if(this.selectize && this.selectize[0]) this.selectize[0].selectize.clearOptions()
                        else this.selectizeInit();
                    },300)
                    $('#sub-category-container').css({'display':'none'});
                    $('#post-search-container').css({'display':'initial'});
                    $('#category').val('');
                    break;
                case 'music':
                    this.dropDownSelectize = null;
                    this.selectize = null;
                    this.type = 'music';
                    this.url = `${this._backend.SERVER_URL}/api/v1/categories/music/search/`;
                    this.post_url=`${this._backend.SERVER_URL}/api/v1/categories/music/search/post`;
                    if(!this.selectize) this.selectizeInit();
                    
                    setTimeout(()=>{
                        if(this.selectize && this.selectize[0]) this.selectize[0].selectize.clearOptions()
                        else this.selectizeInit();
                    },300)
                    $('#sub-category-container').css({'display':'none'});
                    $('#post-search-container').css({'display':'initial'});
                    $('#category').val('');
                    break;
                case 'videos':
                    this.dropDownSelectize = null;
                    this.selectize = null;
                    this.type = 'videos';
                    this.url = `${this._backend.SERVER_URL}/api/v1/categories/videos/search/`;
                    this.post_url=`${this._backend.SERVER_URL}/api/v1/categories/videos/search/post`;
                    if(!this.selectize) this.selectizeInit();
                    
                    setTimeout(()=>{
                         if(this.selectize && this.selectize[0]) this.selectize[0].selectize.clearOptions()
                        else this.selectizeInit();
                    },300)
                    $('#sub-category-container').css({'display':'none'});
                    $('#post-search-container').css({'display':'initial'});
                    $('#category').val('');
                    break;
                case 'apparel':
                    this.selectize = null;
                    this.dropDownSelectize = null;
                    this.type = 'apparel';
                    this.post_url=`${this._backend.SERVER_URL}/api/v1/categories/apparel/search/post`;
                    $('#sub-category-container').css({'display':'initial'});
                    $('#post-search-container').css({'display':'initial'});
                    // this.selectize[0].load = null;
                    $('#category').val('');
                    setTimeout(()=>{
                        if(!this.dropDownSelectize) this.dropDownSelectizeInit();
                        setTimeout(()=>{
                            this.dropDownSelectize[0].selectize.load(function(callback) {
                                callback(apparelCategories);
                            }); 
                        },200)
                    },300)
                    break;
                case 'technology':
                    this.selectize = null;
                    this.dropDownSelectize = null;
                    this.post_url=`${this._backend.SERVER_URL}/api/v1/categories/technology/search/post`;
                    $('#sub-category-container').css({'display':'initial'});
                    $('#post-search-container').css({'display':'initial'});
                    $('#category').val('');
                    this.type = 'technology';
                    // this.selectize[0].load = null;
                    setTimeout(()=>{
                        if(!this.dropDownSelectize) this.dropDownSelectizeInit();
                        setTimeout(()=>{
                            this.dropDownSelectize[0].selectize.load(function(callback) {
                                callback(technologyCategories);
                            }); 
                        },200)
                    },300)
                    break;
                case 'users':
                    this.selectize = null;
                    this.dropDownSelectize = null;
                    this.type = 'users';
                    $('#category-container').css({'display':'none'});
                    $('#sub-category-container').css({'display':'none'});
                    $('#post-search-container').css({'display':'none'});
                    $('#content').append(this.addUsersHtml());
                    $('#content').data('type', 'users');
                    this.watchUsersHtml();
                    break;
                case 'comments':
                    this.selectize = null;
                    this.dropDownSelectize = null;
                    this.type = 'comments';
                    this.comment = true;
                    $('#content').data('type', 'comments');
                    this.commentSelectizeInit();
                    setTimeout(()=>{
                        this.watchPostType(true);
                    },200)
                    break;
            }
        });
    }
    watchTypeInputs(){
        $(`#type`).on('change', ()=>{
            let value = $(`#type`).val();
            if($('#content').data('type')) $('#content').children('div:first').remove();
            switch(value){
                case 'votes':
                    $(`#content`).append(this.addVotesHtml())
                    $('#content').data('type', 'votes');
                    setTimeout(()=>{
                         this.watchVotesHtml();
                    },100)
                    break;
                case 'likes':
                    $('#content').append(this.addLikesHtml())
                    $('#content').data('type', 'likes');
                    this.watchLikesHtml();
                    break;
                case 'ratings':
                    $('#content').append(this.addRatingsHtml());
                    $('#content').data('type', 'ratings');
                    this.watchRatingsHtml();
                    break;
                case 'comments':
                    $('#content').append(this.addCommentsHtml());
                    $('#content').data('type', 'comments');
                    this.watchCommentsHtml();
                    break;
            }
        })
    }
  selectizeInit(){
        var self=this;
        this.selectize = $('#category').selectize({
        plugins: ['restore_on_backspace','remove_button','drag_drop'],
        delimiter: ',',
        persist: false,
        openOnFocus: true,
        hideSelected:true,
        selectOnTab:true,
        addPrecedence:true,
        // maxItems: 5,
        closeAfterSelect:true,
        valueField: 'title',
        labelField: 'title',
        searchField: 'title',
        options: [],
        create: false,
        render: {
            option: function (item, escape) {
                return '<div>' + escape(item.title) + '</div>';
            }
        },
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: self.url,
                type: 'GET',
                headers:{'search':encodeURIComponent(query)},
                error: function() {
                    callback();
                },
                success: function(res) {
                  // 
                    // if(res && res.results && res.results.length > 1){
                    //   let length = res && res.results && res.results.length > 11 ? 10 : res.results.length;
                    //   
                    //   callback(res.results.slice(0, length));
                    // } else {
                    //   callback(res.results);
                    // }
                    callback(res.results);

                }
            });
        },
        onBlur(){
          self.categories = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
          
        },
        onChange(value){
          
          self.mainCategory = value.split(",",1).toString().toLowerCase();
          
          $('#post-search-container').css({'display':'initial'});
          
        }
    });
  }
  dropDownSelectizeInit(){
        let self = this; 
        this.dropDownSelectize = $('#category-dropdown').selectize({
            plugins: ['hidden_textfield'],
            delimiter: ',',
            persist: false,
            openOnFocus: true,
            hideSelected:true,
            selectOnTab:true,
            // addPrecedence:true,
            maxItems: 1,
            closeAfterSelect:true,
            options: [
            ],
            create: false,
            onBlur(){
            // 
            // 
            },
            onChange(value){
            self.subSelectizeInit();
            self.mainCategory = value.split(",",1).toString().toLowerCase();
            setTimeout(()=>{
                self.subCategorySelected();
            },200)
            // 
            }
        });
  }
  subSelectizeInit(){
        let self = this; 
        this.subSelectize = $('#sub-category').selectize({
            plugins: ['hidden_textfield'],
            delimiter: ',',
            persist: false,
            openOnFocus: true,
            hideSelected:true,
            selectOnTab:true,
            // addPrecedence:true,
            maxItems: 1,
            closeAfterSelect:true,
            options: [
            ],
            create: false,
            onBlur(){
            // 
            // 
            },
            onChange(value){
            // ApparelFormComponent.subCategorySelected(value);
            self.subCategory = value.split(",",1).toString().toLowerCase();
            // 
            }
        });
    }
    postSelectizeInit(){
        var self=this;
        this.selectize = $('#post-search').selectize({
        plugins: ['restore_on_backspace','remove_button','drag_drop'],
        delimiter: ',',
        persist: false,
        openOnFocus: true,
        hideSelected:true,
        selectOnTab:true,
        addPrecedence:true,
        maxItems: 1,
        closeAfterSelect:true,
        valueField: 'id',
        labelField: 'title',
        searchField: 'title',
        options: [],
        create: false,
        render: {
            option: function (item, escape) {
                return '<div>' + '<span>Title:</span>' + escape(item.title) + ' | ' + escape(item.id) + ' | ' + escape(item.submitted_by) + '</div>' ;
            }
        },
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: self.post_url,
                type: 'GET',
                headers:{'search':encodeURIComponent(query), 'category': self.mainCategory, 'subcategory': self.subCategory, 'comment_type': self.comment_type},
                error: function() {
                    callback();
                },
                success: function(res) {
                  // 
                    // if(res && res.results && res.results.length > 1){
                    //   let length = res && res.results && res.results.length > 11 ? 10 : res.results.length;
                    //   
                    //   callback(res.results.slice(0, length));
                    // } else {
                    //   callback(res.results);
                    // }
                    callback(res.results);
                }
            });
        },
        onBlur(){
          self.categories = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
          
          
        },
        onChange(value){
          
          self.id = value.split(",",1).toString().toLowerCase();
          $('#post-search-container').css({'display':'initial'});
          if(!self.comment) $('#bot-type').css({'display':'initial'});
          if(self.comment) $('#comment-search-container').css({'display':'initial'})
        }
    });
  }
  commentSelectizeInit(){
        var self=this;
        this.selectize = $('#comment-search').selectize({
        plugins: ['restore_on_backspace','remove_button','drag_drop'],
        delimiter: ',',
        persist: false,
        openOnFocus: true,
        hideSelected:true,
        selectOnTab:true,
        addPrecedence:true,
        maxItems: 1,
        closeAfterSelect:true,
        valueField: 'id',
        labelField: 'title',
        searchField: 'title',
        options: [],
        create: false,
        render: {
            option: function (item, escape) {
                return '<div>' + '<span>Body:</span>' + escape(item.body) + ' | ' + escape(item.id) + ' | ' + escape(item.submitted_by) + '</div>' ;
            }
        },
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: self.comment_url,
                type: 'GET',
                headers:{'search':encodeURIComponent(query), 'category': self.mainCategory, 'subcategory': self.subCategory, 'comment_type': self.comment_type, 'id':self.id},
                error: function() {
                    callback();
                },
                success: function(res) {
                  // 
                    // if(res && res.results && res.results.length > 1){
                    //   let length = res && res.results && res.results.length > 11 ? 10 : res.results.length;
                    //   
                    //   callback(res.results.slice(0, length));
                    // } else {
                    //   callback(res.results);
                    // }
                    
                    callback(res.results);
                }
            });
        },
        onBlur(){
          self.categories = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
          
          
        },
        onChange(value){
          
          self.id = value.split(",",1).toString().toLowerCase();
          $('#post-search-container').css({'display':'initial'});
          $('#content').append(self.addVotesHtml());
          self.watchVotesHtml();
        }
    });
  }
    subCategorySelected(){
        
        switch(this.mainCategory){
            case 'accessories':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(accessoryList);
                }); 
                break;
            case 'shoes':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(shoeList);
                }); 
                break;
            case 'pants':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(pantList);
                }); 
                break;
            case 'shirts':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(shirtList);
                }); 
                break;
            case 'outerwear':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(outerwearList);
                }); 
                break;
            case 'computers':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(computersList);
                }); 
                break;
            case 'phones':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(phonesList);
                }); 
                break;
            case 'tablets':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(tabletList);
                }); 
                break;
            case 'wearables':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(wearablesList);
                }); 
                break; 
            case 'speakers':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(speakerList);
                }); 
                break;
            case 'televisions':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(televisionList);
                }); 
                break;
            case 'video-games':
                this.subSelectize[0].selectize.load(function(callback) {
                    callback(videoGameList);
                }); 
                break;
            case 'miscellaneous':
                $('#sub-category-container').css({'display':'none'});
                this.subCategory = null;
                break;
        }
    }
    addVotesHtml(){
        return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='votes-html'>
                        <h6 class='center'>Update Votes</h6>
                        <div>
                            <div class='col m4'>
                                <label>Count:</label>
                                <input type='text' id='votes-count'/>
                            </div>
                            <div class='col m4'>
                                <label>Average:</label>
                                <input type='text' id='average-vote'>
                            </div>
                            <div class='col m4'>
                                <label>Time:</label>
                                <input type='text' id='votes-time'>
                            </div>
                        </div>
                        <div id='submit-votes-html' style='text-align:center'>
                            <button id='submit-votes-button' class='btn' disabled>Submit</button>
                        </div>
                    </div>
                `
    }
    watchVotesHtml(){
        let count, average, time;
        $('#votes-count').on('change', ()=>{
            count = $('#votes-count').val();
            if(count && average && time) $('#submit-votes-button').prop('disabled',false);
        });
        $('#average-vote').on('change', ()=>{
            average = $('#average-vote').val();
            if(count && average && time) $('#submit-votes-button').prop('disabled',false);
        });
        $('#votes-time').on('change', ()=>{
            time = $('#votes-time').val();
            if(count && average && time) $('#submit-votes-button').prop('disabled',false);
        });
        $('#submit-votes-button').on('click', ()=>{
            this.submitVotes(count,average,time);
        });
    }
    submitVotes(count,average,time){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let type = this.comment ? 'comments' : this.type;
        let creds = {'id': this.id, 'type':type,'category': this.mainCategory, 'subcategory': this.subCategory, count:count, average:average,time:time}
  		this.votesSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/votes`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  this._sysMessages.setMessages('update-votes');
                  Materialize.toast("Votes Successfully Submitted", 3000, 'rounded-success')
              } else if(data.json().users){
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
              } else {
                //   $('#content').children('div:first').remove();
              }
        });
    }
    addLikesHtml(){
        return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='likes-html'>
                        <h6 class='center'>Update Likes</h6>
                        <div>
                            <div class='col m6'>
                                <label>Count:</label>
                                <input type='text' id='likes-count'/>
                            </div>
                            <div class='col m6'>
                                <label>Time:</label>
                                <input type='text' id='likes-time'>
                            </div>
                        </div>
                        <div id='submit-likes-html' style='text-align:center'>
                            <button id='submit-likes-button' class='btn' disabled>Submit</button>
                        </div>
                    </div>
                `
    }
    watchLikesHtml(){
       let count, time;
        $('#likes-count').on('change', ()=>{
            count = $('#likes-count').val();
            if(count && time) $('#submit-likes-button').prop('disabled',false);
        });
        $('#likes-time').on('change', ()=>{
            time = $('#likes-time').val();
            if(count && time) $('#submit-likes-button').prop('disabled',false);
        });
        $('#submit-likes-button').on('click', ()=>{
            this.submitLikes(count,time);
        });
    }
    submitLikes(count,time){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.id, 'type':this.type,'category': this.mainCategory, 'subcategory': this.subCategory, count:count,time:time}
        Materialize.toast("This may take awhile", 3000, 'rounded')
  		this.likesSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/likes`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  this._sysMessages.setMessages('update-votes');
                  Materialize.toast("Likes Successfully Submitted", 3000, 'rounded-success')
              } else if(data.json().users){
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
              } else {
                  $('#content').children('div:first').remove();
              }
        });
    }
    addRatingsHtml(){
        return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
                        <h6 class='center'>Update Ratings</h6>
                        <div>
                            <div class='col m12'>
                                <label>Time:</label>
                                <input type='text' id='ratings-time'/>
                            </div>
                            <hr>
                            <div class='col m3'>
                                <label>Simple Count:</label>
                                <input type='text' id='simple-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Advanced Count:</label>
                                <input type='text' id='advanced-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Hater Count:</label>
                                <input type='text' id='hater-ratings-count'/>
                            </div>
                             <div class='col m3'>
                                <label>Fan Count:</label>
                                <input type='text' id='fan-ratings-count'/>
                            </div>
                        </div>
                        <button id='submit-ratings-button' class='btn'>Submit</button>
                    </div>
                `
    }
    watchRatingsHtml(){
        let count, average,advanced, simple;
        $('#simple-ratings-count').on('change', ()=>{
            simple = true;
           $('#content').append(this.addSimpleRatingsHtml());
        //    this.watchSimpleRatingsHtml();
        });
        $('#advanced-ratings-count').on('change', ()=>{
            advanced = true;
            $('#content').append(this.addAdvancedRatingsHtml());
            // this.watchAdvancedRatingsHtml();
        });
        $('#submit-ratings-button').on('click', ()=>{
            this.submitRatings(count,average);
        });
    }
    addAdvancedRatingsHtml(){
         return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
                        <h6 class='center'>Update Ratings</h6>
                        <div>
                            <div class='col m3'>
                                <label>Lyrics:</label>
                                <input type='text' id='lyrics-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Production:</label>
                                <input type='text' id='production-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Originality:</label>
                                <input type='text' id='originality-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Deviation:</label>
                                <input type='text' id='advanced-ratings-deviation-count'/>
                            </div>
                        </div>
                    </div>
                `
    }
    addSimpleRatingsHtml(){
         return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
                        <h6 class='center'>Update Ratings</h6>
                        <div>
                            <div class='col m6'>
                                <label>Average:</label>
                                <input type='text' id='simple-ratings-average'/>
                            </div>
                            <div class='col m6'>
                                <label>Deviation:</label>
                                <input type='text' id='simple-ratings-deviation'/>
                            </div>
                        </div>
                    </div>
                `
    }
    // addHaterRatingsHtml(){
    //     return `
    //                 <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
    //                     <h6 class='center'>Update Ratings</h6>
    //                     <div>
    //                         <div class='col m6'>
    //                             <label>Simple Count:</label>
    //                             <input type='text' id='simple-ratings-count'/>
    //                         </div>
    //                         <div class='col m6'>
    //                             <label>Advanced Count:</label>
    //                             <input type='text' id='advanced-ratings-count'/>
    //                         </div>
    //                     </div>
    //                 </div>
    //             `
    // }
    // addFansRatingsHtml(){
    //     return `
    //                 <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
    //                     <h6 class='center'>Update Ratings</h6>
    //                     <div>
    //                         <div class='col m6'>
    //                             <label>Simple Count:</label>
    //                             <input type='text' id='simple-ratings-count'/>
    //                         </div>
    //                         <div class='col m6'>
    //                             <label>Advanced Count:</label>
    //                             <input type='text' id='advanced-ratings-count'/>
    //                         </div>
    //                     </div>
    //                 </div>
    //             `
    // }
    
    submitRatings(count,average){
        let simple_count = $('#simple-ratings-count').val();
        let advanced_ratings_count = $("#advanced-ratings-count").val();   

        let simple = $('#simple-ratings-average').val();
        let simple_deviation = $('#simple-ratings-deviation').val();

        let lyrics = $('#lyrics-ratings-count').val();
        let production =  $('#production-ratings-count').val();
        let originality = $('#originality-ratings-count').val();
        let advanced_deviation = $('#advanced-ratings-deviation-count').val();
        let advanced = Math.ceil((parseInt(lyrics) + parseInt(production) + parseInt(originality)) / 3)
        
        let time = $('#ratings-time').val();

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.id, 'type':this.type,'category': this.mainCategory, 'subcategory': this.subCategory,simple_count:simple_count,advanced_count:advanced_ratings_count,time:time,
        simple:simple,simple_deviation:simple_deviation,
        advanced:advanced,lyrics:lyrics,production:production,originality:originality,advanced_deviation:advanced_deviation}
  		this.ratingsSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/ratings`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  this._sysMessages.setMessages('update-votes');
                  Materialize.toast("Ratings Successfully Submitted", 3000, 'rounded-success')
              } else if(data.json().users){
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
              } else {
                  $('#content').children('div:first').remove();
              }
        });
    }
    addCommentsHtml(){
        return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='comments-html'>
                        <h6 class='center'>Update Comments</h6>
                        <div>
                            <div class='col m6'>
                                <label>Count:</label>
                                <input type='number' id='comment-count'/>
                            </div>
                            <div class='col m6'>
                                <label>Time:</label>
                                <input type='text' id='comments-time'>
                            </div>
                        </div>  
                        <div id='comment-info' style='display:none'>
                            <h6>Comment Info</h6>
                        </div>
                        <div id='submit-comments' style='text-align:center'>
                            <button id='submit-comments' class='btn' style='border:1px solid rgba(0,0,0,0.3)'>Submit</button>
                        </div>
                    </div>
                `

    }
    watchCommentsHtml(){
        $('#comment-count').on('keyup change', ()=>{
            let count = $('#comment-count').val();
            $('#comment-info').css({'display':'initial'});
            $(`#comment-info`).children().remove();
            $('#comment-info').data('count', count);
            for(let i=0; i < count; i++){
                $("#comment-info").append(this.addIndCommentHtml(i))
            }
        })
        $('#submit-comments').on('click', ()=>{
            this.jsonify();  
        })
    }
    submitComments(female_count,comments){
        let headers = new Headers();
        let count =  $('#comment-info').data('count');
        let time = $('#comments-time').val();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.id,'type':this.type,'time':time,'count':count,'category':this.mainCategory,'subcategory':this.subCategory,comments:comments,'female_count':female_count}
  		this.commentsSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/comments`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  this._sysMessages.setMessages('update-comments');
                  Materialize.toast("Comments Successfully Submitted", 3000, 'rounded-success')
              } else if(data.json().users) {
                  Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
                //   $('#content').children('div:first').remove();
              }
        });
    }
    jsonify(){
        let count = parseInt($('#comment-info').data('count'));
        let female_count = 0;
        let jsonObject = {};
        for(let i=0;i<count;i++){
            let body =  $(`#comment-body-${i}`).val()
            jsonObject[i]={body: body,
                           reply_to:$(`#reply-to-${i}`).val(),
                           user:$(`#user-${i}`).val(),
                           female:$(`#user-gender-${i}`).val(),
                           marked: marked(body),
                           votes: $(`#votes-comment-${i}`).val(),
                           average: $(`#average-comment-${i}`).val(),
                           time: $(`#time-comment-${i}`).val() }
            if($(`#user-gender-${i}`).val() === 'true') female_count += 1;
        }
        this.submitComments(female_count,jsonObject);
    }
    addIndCommentHtml(index){
        return `
                    <hr style='border:${index === 0 ? 1 : 0}px solid rgba(0,0,0,0.5)'>
                    <div id='comment-html-${index}' data-index='${index}' class='row col m12'>
                        <p>${index}:</p>   
                        <div class='row'>
                            <div class='col m4'>Reply to:
                                <input id='reply-to-${index}' class='col m12'></input>
                            </div>
                            <div class='col m4'>User:
                                <input id='user-${index}' class='col m12'></input>
                            </div>
                             <div class='col m4'>Female?
                                <select id='user-gender-${index}' class='col m12' style='display:block'>
                                    <option value="false">False</option>
                                    <option value="true">True</option>
                                </select>
                            </div>
                        </div>
                        <div class='row'>
                            Comment Votes:
                            <div>
                                <div class='col m4'>
                                    <label>Count:</label>
                                    <input type='text' id='votes-comment-${index}'/>
                                </div>
                                <div class='col m4'>
                                    <label>Average:</label>
                                    <input type='text' id='average-comment-${index}'>
                                </div>
                                <div class='col m4'>
                                    <label>Time:</label>
                                    <input type='text' id='time-comment-${index}'>
                                </div>
                            </div>
                        </div>
                        <div class='row'>
                            <label for='link' id='song-description'>Body - (Markdown and HTML; styling disabled)</label>
                            <textarea [ngClass]="{ 'has-error-body' : uploadText.controls.description.errors?.required && uploadText.controls.description.touched}" id='comment-body-${index}' [formControl]="uploadText.controls['description']" class="validate" type='text' data-type='text'></textarea>
                        </div>
                    </div>
                    <hr style='width:100%;border:1px solid rgba(0,0,0,0.3)'>
                `
    }
    addUsersHtml(){
        return `
                    <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='votes-html'>
                        <h6 class='center'>Add Users</h6>
                        <div class='row'>
                            <div class='col m6'>
                                <label>Count:</label>
                                <input type='text' id='user-count'/>
                            </div>
                            <div class='col m6' style='text-align:center;margin-top: 32px;'>
                                <button id='submit-users-button' class='btn' disabled>Submit</button>
                            </div>
                        </div>
                    </div>
                `
    }  
    watchUsersHtml(){
        let count;
        $('#user-count').on('change', function(){
            count = $(this).val();
            $('#submit-users-button').prop('disabled',false);
        })
        $('#submit-users-button').on('click', ()=>{
            this.submitUsers(count);   
        })
    }
    submitUsers(count){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.id, count:count}
        Materialize.toast("This may take awhile...", 3000, 'rounded-success')
        $('#submit-users-button').prop({disabled:'disabled'})
  		this.usersSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/users`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  this._sysMessages.setMessages('added-users');
                  Materialize.toast("Successfully Submitted Users", 3000, 'rounded-success')
                  $('#submit-users-button').prop({disabled:false})
                  let users = data.json().users
                  for(let i = 0; i < users.length; i++){
                    $('#content').append(this.addIndUserHtml(data.json().users[i]));
                  }
                  this.watchChangeUsername()
              } else {
                //   $('#content').children('div:first').remove();
              }
        });
    }
    addIndUserHtml(user){
        return `
                    <div id='user-${user.uuid}' class='col m8 offset-m2'>
                        <div class='row'>
                            <p id='current-username-${user.uuid}'>Current Username: ${user.username}</p>
                        </div>
                        <div class='row'>
                            <div class='col m6'>
                                <input type='text' value="${user.username}" id="username-${user.uuid}">
                            </div>
                            <div class='col m3'>
                                <select id='username-gender-${user.uuid}'>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div class='col m3'>
                                <button class='btn submit-username' id='submit-username-${user.uuid}' data-id='${user.uuid}'>Update Username</button>
                            </div>
                        </div>
                    </div>
                    <hr>
                `
    }
    watchChangeUsername(){
        let self = this;
        $('.submit-username').on('click', function(){
            let id = $(this).data('id');
            let gender = $(`#username-gender-${id}`).val();
            let username = $(`#username-${id}`).val();
            self.submitUsernameChange(id,username,gender);
        });
    }
    submitUsernameChange(id,username,gender){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': id, 'username':username,'gender':gender}
  		this.updateUserSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/users/update`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  this._sysMessages.setMessages('updated-users');
                  Materialize.toast("Successfully Updated User", 3000, 'rounded-success')
                  $(`#username`).val(username);
                  $(`#current-username-${id}`).text(`Current Username: ${username}`);
              } else {
                //   $('#content').children('div:first').remove();
              }
        });
    }
    ngOnDestroy(){
        if(this.votesSubscription) this.votesSubscription.unsubscribe();
        if(this.usersSubscription) this.usersSubscription.unsubscribe();
        if(this.updateUserSubscription) this.updateUserSubscription.unsubscribe();
        if(this.routeSubscription) this.routeSubscription.unsubscribe();
        if(this.commentsSubscription) this.commentsSubscription.unsubscribe();
        if(this.likesSubscription) this.likesSubscription.unsubscribe();
        if(this.ratingsSubscription) this.ratingsSubscription.unsubscribe();
    }
}
