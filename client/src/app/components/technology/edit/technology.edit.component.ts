import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import 'angular2-materialize';
import {ModalComponent} from '../../modal/modal.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';

declare let ActionCable:any;
declare var $;
declare var Selectize;
declare var marked;
declare var Materialize;

var computersList = [
    {
        text: 'Laptop',
        value: 'laptop'
    },
    {
        text: 'Desktop',
        value: 'desktop'
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
  selector: 'technology_edit',
  templateUrl: 'technology.edit.component.html',
  providers: [FormBuilder,AuthService,ModalComponent,SystemMessagesComponent]
})

export class TechnologyEditComponent implements OnInit {
    subscription:any;
    submitSubscription:any;
    deleteSubscription:any;
    deletePhotoSubscription:any;
    uploadTechnology: FormGroup;

    title:string;
    mainCategory:string;
    subCategory:string;
    originalCategory:string;
    id:string;
    postId:number;
    currentUser:string;
    description:string;
    link:string;
    marked:string;
    categories:any;
    selectize:any;
    subSelectize:any;
    loaded:boolean=false;

    sizeChoicesOpen:boolean=false;
    smallSizeOptionSelected:boolean=false;
    mediumSizeOptionSelected:boolean=false;
    largeSizeOptionSelected:boolean=false;
    xlSizeOptionSelected:boolean=false;
    xxlSizeOptionSelected:boolean=false;
    xxxlSizeOptionSelected:boolean=false;
    xxxxlSizeOptionSelected:boolean=false;
    sameSizeOptionSelected:boolean=false;
    clothSizes:any=['','Small','Medium', 'Large', 'XL', '2XL','3XL','4XL'];
    clothSizeValues:any=['','small','medium', 'large', 'xl', 'xxl','xxxl','xxxxl'];
    shoeSizes:any=['',4,4.5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5,20];
    conditions:any=['','New with box','New without box','New with defects', 'Pre-owened - Good', 'Pre-owened - Decent', 'Pre-owened - Bad', 'Broken'];
    conditionValues:any=['','nwb','nwob','nwd', 'pog', 'pod', 'pob', 'b'];
    returns:any=['','Returns Accepted', 'No Returns Accepted'];
    returnValues:any=['',true, false];
    sizes:any=this.clothSizes;
    sizeValues:any=this.clothSizeValues;
    shoeSizesOpen:boolean=false;
    hidden:boolean; // this is set to true if the category is 'accessories' as it will switch the product info layout to dimensions.
    shoesSizesSelectionOpen:boolean=false;
    clothSizesSelectionOpen:boolean=false;
    

    height:number;
    width:number;
    depth:number;
    color:string;
    quantity:number;
    size:string;
    price:number;

    submitted:boolean=false;
    technologyDelete:boolean=false;

    photosCount:number;

    //
    JSONObject:any={};
    totalPrices:any=[];
    lowestPrice:number;
    //data used for shoe sizes.
    shoesSizesAmount:number=0;
    shoesColorAmount:number=0;

    //data used for clothes sizes.
    clothesSizesAmount:number=0;
    clothesColorAmount:number=0;

    //data used for dimensions

    //monitor the no variation inputs. This is done to see if sizes change, if so, the object needs to be reset, and fill in a new object with the data.
    noVariationColor:string;
    noVariationQuantity:number;
    noVariationSize:any;
    photoClicked:boolean=false;
    imageFile:any;
    image:any;
    mainSelectize:any;
    photos:any=[];
    photoIds:any=[];
    imageCount:number=0;
    totalImageCount:number=0;
    uploadPhotoCount:number=0;
    watchingDelete:boolean=false;
    urls:any=[];

    sorted:boolean=false;
    sortedIds:any=[];

    url:string;

    insubmit:boolean=false;
    worked:boolean=false;

    has_variations:boolean;
    properties:any;
    noVartiaions:boolean=false;
    dimensionsWatching:boolean=false;
    noDimensionsWatching:boolean=false;
    Object:any=Object;
    maxPrice:number;
    uploadComplete:boolean=true;
    has_uploaded:boolean=false;

    hasSizes:boolean=false;
    hasColors:boolean=false;
    hasDimensions:boolean=false;
    hasSizesSelected:boolean=false;
    hasColorsSelected:boolean=false;
    hasDimensionsSelected:boolean=false;
    constructor(private _http: Http, private _auth: AuthService, private _backend: BackendService, private _fb: FormBuilder, private _router: Router, private _modal: ModalComponent, private _sysMessages:SystemMessagesComponent){};
	  ngOnInit(){
      this.uploadTechnology = this._fb.group({
          'title': [null, Validators.required],
          'creator': [null, Validators.required],
          'max_price': [{value:null,disabled:true}],
          'min_price': [{value:null,disabled:true}],
          'price': [{value:null,disabled:true}],
          'shipping': [null, Validators.required],
          'shipping_type': [null, Validators.required],
          'turnaround_time': [null, Validators.required],
          'has_variations': [null],
          'zip': [null, Validators.required],
          'condition': [null, Validators.required],
          'properties': [null],
          'category': [null],
          'sub_category': [null],
          'description': [null],
          'has_site': [null],
          'returns': [null, Validators.required],
          'link': [null]
        })
        this.url = this._backend.SERVER_URL;
        this.currentUser = localStorage.getItem('username') || '';
        let decoded = decodeURIComponent(window.location.search.substring(1))
        let params = decoded.split("&");
        for(let i = 0;i < params.length; i++){
            let key = params[i].split("=")[0]
            let value = params[i].split("=")[1]
            switch(key){
                case 'title':
                    this.title = value ? value : null;
                    if(this.title){this.uploadTechnology.patchValue({title:this.title})}
                    break;
                case 'category':
                    this.mainCategory = value ? value : null;
                    break;
                case 'subcategory':
                  this.subCategory = value ? value : null
                    break;
                case 'id':
                    this.id = value ? value : null;
                    break;
            }
        }
        setTimeout(()=>{
            this.selectizeInit();
            this.subSelectizeInit();
            this.watchFormattingButton();
            this.watchDescription();
            this.watchRadios();
            this.photoChange();
            this.watchHasSizes();
            this.watchHasColors();
            this.watchHasDimensions();
            if(this.id) this.pullPost();
        },10)
    };
    pullPost(){
        let headersInit = new Headers();
        headersInit.append('id', this.id);
        headersInit.append('maincategory', this.mainCategory);
        headersInit.append('subcategory', this.subCategory);
        headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/technology/post`,{headers: headersInit}).subscribe(data => {
            if(data.json().success){
                if(this.currentUser !=  data.json().post.submitted_by){
                    this._sysMessages.setMessages('unathorized');
  					        this._router.navigateByUrl(`/technology/${this.mainCategory}/${this.subCategory}/${this.id}`); 
                }
                this.description = data.json().post.description ? data.json().post.description : null;
                this.link = data.json().post.creator_link ? data.json().post.creator_link : null;
                this.marked = data.json().post.marked ? data.json().post.marked : null;
                this.photos = data.json().post.photos.reverse();
                this.photosCount = data.json().post.photos ? data.json().post.photos.length : 0;
                this.totalImageCount = data.json().post.photos ? data.json().post.photos.length: 0;
                if(data.json().post.photos){
                  this.imageCount = data.json().post.photos.length;
                  this.totalImageCount = this.imageCount;
                  if(!data.json().post.sorted){
                    for(let i = 0; i < data.json().post.photos.length; i++){
                        this.photoIds.unshift(this.photos[i].id);
                    }
                  }
                  else {
                      this.photoIds = data.json().post.sorting;
                      this.photos = this.sortPhotos(this.photos, data.json().post.sorting);
                  }
                }
                if(this.photos) setTimeout(()=>{this.watchPhotoDelete()},200);
                if(this.description){$('.description-box').addClass('valid');} //would add to both, but that doesn't really matter in this case - as one will be hidden.
                if(this.title){$('#post-title').addClass('active'); $('#title').addClass('valid');}
                if(this.link){$(`#post-link`).addClass('active'); $('#link').addClass('valid'); this.uploadTechnology.patchValue({link:this.link})}
                if(data.json().post.creator){$(`#post-creator`).addClass('active'); $('#creator').addClass('valid'); this.uploadTechnology.patchValue({creator:data.json().post.creator})}
                if(this.description){this.uploadTechnology.patchValue({description:this.description})}
                if(data.json().post.marked){ $('#output-container-link').css({'display':'block'}); $('#post-output-text').append(data.json().post.marked);}
                if(data.json().post.zip){$(`#post-zip`).addClass('active'); $('#technology-zip').addClass('valid'); this.uploadTechnology.patchValue({zip:data.json().post.zip})}
                if(data.json().post.has_site != null){this.uploadTechnology.patchValue({has_site:data.json().post.has_site})}
                if(data.json().post.has_site){ $(`#site-yes`).prop("checked", true); $('#link').prop('disabled',false); }
                else{$(`#site-no`).prop("checked", true); } 
                if(data.json().post.price){$('#post-price').addClass('active'); $('#price').addClass('valid'); this.uploadTechnology.patchValue({price:parseInt(data.json().post.price.split('$')[1].split('.')[0])}) }
                if(data.json().post.sale_price){$(`#post-price-sale`).addClass('active'); $('#sale-price').addClass('valid'); this.uploadTechnology.patchValue({sale_price:parseInt(data.json().post.sale_price.split('$')[1].split('.')[0])})}
                if(data.json().post.shipping){$("#post-shipping").addClass('active'); $('#shipping').addClass('valid'); this.uploadTechnology.patchValue({shipping:parseInt(data.json().post.shipping.split('$')[1].split('.')[0])})}
                if(data.json().post.shipping_type){$("#post-shipping-type").addClass('active'); $('#shipping-type').addClass('valid'); this.uploadTechnology.patchValue({shipping_type:data.json().post.shipping_type})}
                if(data.json().post.condition) this.uploadTechnology.patchValue({'condition':data.json().post.condition})
                if(data.json().post.turnaround_time){ $("#turnaround-time").addClass("valid"); $("#post-turnaround-time").addClass('active'); this.uploadTechnology.patchValue({'turnaround_time':data.json().post.turnaround_time})}
                this.worked = data.json().post.worked;
                if(data.json().post.returns != null){setTimeout(()=>{
                    this.uploadTechnology.patchValue({'returns':data.json().post.returns});
                },350)}
                if(data.json().post.upload_urls) this.urls = data.json().post.upload_urls;
                if(this.categories) this.categories = data.json().post.categories ? data.json().post.categories : null;
                if(this.selectize && this.selectize[0]) this.selectize[0].selectize.setValue(this.mainCategory); 
                if(this.subSelectize && this.subSelectize[0]) this.subSelectize[0].selectize.setValue(this.subCategory);
                // if(this.categories){this.uploadTechnology.patchValue({genre:this.categories})}
                this.originalCategory = this.mainCategory;
                $("#quantity").on('keyup change', ()=>{
                    this.quantity = parseFloat($("#quantity").val())
                })
                this.properties = data.json().post.properties;
                this.has_variations = data.json().post.has_variations;
                if(this.has_variations) $("#variations-yes").prop('checked',true);
                else $("#variations-no").prop('checked',true);
                $('#has-options').trigger('click');

                this.postId = data.json().post.uuid ? data.json().post.uuid : null;
                $("#quantity").change(()=>{
                    this.quantity = parseInt($("#quantity").val())
                })
                 $('#photos-technology-form').sortable({
                    stop : (event,ui) => { 
                        this.sorted = true;
                        this.sortedIds = $("#photos-technology-form").sortable('toArray', { attribute: 'data-id' })
                        
                     }
                });
                // may as well allow people to add more shit when they ready.
                // also have to code less so win win
                // let has_sizes = (Object.keys(this.properties).length > 1 || Object.keys(this.properties)[0] != 'default')
                let has_sizes = true;
                if(has_sizes) $("#sizes-yes").prop("checked",true).trigger('click');
                else $("#sizes-no").prop("checked",true).trigger('click');
                let colors = []
                let not_colors = ['width','height','depth']
                let sizes = [];
                let has_dimensions = false;

                for(let i = 0; i < Object.keys(this.properties).length; i++){
                    let size  = Object.keys(this.properties)[i]
                    sizes.push(size);
                    let all_colors = Object.keys(this.properties[size]);
                    for(let ic = 0; ic < Object.keys(this.properties[size]).length;ic++){
                        let color = Object.keys(this.properties[size])[ic]
                        if(color != 'width' && color != 'height' && color != 'depth') colors.push(color)
                        else has_dimensions = true;
                        
                    }   
                }
                let has_colors;
                setTimeout(()=>{
                    // has_colors = (colors.length > 1 || colors[0] != 'default')
                    has_colors = true;
                    if(has_colors) $("#colors-yes").prop('checked',true).trigger('click')
                    else $("#colors-no").prop('checked',true).trigger('click');
                },1)
                setTimeout(()=>{
                    if(has_dimensions) $("#dimensions-yes").prop('checked',true).trigger('click');
                    else $("#dimensions-no").prop('checked',true).trigger('click');
                },2)
                
                
                setTimeout(()=>{
                    if(has_sizes){
                        $(`#yes-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-size-count`).val(sizes.length).change();
                        setTimeout(()=>{
                            if(has_colors){
                                $(`#yes-sizes-yes-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-color-count`).val(colors.length).change();
                                for(let i =0; i < Object.keys(this.properties).length; i++){
                                    let size = Object.keys(this.properties)[i];
                                    let color_amount = Object.keys(this.properties[size]).length;
                                    let all_colors =  Object.keys(this.properties[size])
                                    console.log(size);
                                    let colors = all_colors.filter(function(i) {return not_colors.indexOf(i) === -1;});
                                    console.log(colors);
                                    $(`#yes-sizes-yes-colors-no-dimensions-size-${i}`).val(size);
                                    console.log(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-color-amount-${i}`)
                                    $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-color-amount-${i}`).val(colors.length).change()
                                    setTimeout(()=>{
                                        if(has_dimensions){
                                            $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-height-${i}`).val(this.properties[size]["height"])
                                            $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-width-${i}`).val(this.properties[size]["width"])
                                            $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-depth-${i}`).val(this.properties[size]["depth"])
                                        }
                                        for(let ic = 0; ic < colors.length; ic++){
                                            $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-input-color-${i}-${ic}`).val(colors[ic]).change()
                                            $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-input-quantity-${i}-${ic}`).val(this.properties[size][colors[ic]]["quantity"])
                                            $(`#${has_sizes ? 'yes' : 'no'}-sizes-${has_colors ? 'yes' : 'no'}-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-input-price-${i}-${ic}`).val(this.properties[size][colors[ic]]["price"].replace('$','')).change()
                                        }
                                    },20)
                                }
                        
                            } else {
                                let size = Object.keys(this.properties)[0];
                                let color = Object.keys(this.properties[size])[0];
                                $(`#yes-sizes-no-colors-yes-dimensions-color`).val(color);
                                for(let i = 0; i < Object.keys(this.properties).length; i++){
                                    $(`#yes-size-no-colors-yes`)
                                }

                            }
                            
                        },5)
                    } else if(has_colors){
                        $(`#no-sizes-yes-colors-${has_dimensions ? 'yes' : 'no'}-dimensions-color-count`).val(colors.length).change();
                    } else if(has_dimensions){

                    } else {

                    }
                },3) 
            }
        })
    }
    selectIcon(size,dimensions){
        // setTimeout(()=>{
            if(!dimensions) $(`#${size}-size`).trigger('click');
            else if(dimensions && !$("#dimension-size").is(':checked')) $(`#dimension-size`).trigger('click');
            // this.watchColorAmount(this.getSizes(size)); 
        // },7)    
    }
    sortPhotos(photos,sort){
        let temp = photos.map(function(el,i){
            return {index: sort.indexOf(el.uuid.toString()), value:i}
        })
        // 
        temp.sort(function(a,b){
            return a.index - b.index
        })
        
        let new_photos = temp.map(function(el){
            return photos[el.value]
        })
        return new_photos;
        // 
    }
    selectizeInit(){
        let TechnologyFormComponent = this; 
        this.selectize =  $('.category').selectize({
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
                {value: 'computers', text: 'Computers'},
                {value: 'phones', text: 'Phones'},
                {value: 'tablets', text: 'Tablets'},
                {value: 'wearables', text: 'Wearables'},
                {value: 'speakers', text: 'Speakers'},
                {value: 'televisions', text: 'Televisions'},
                {value: 'video-games', text: 'Video Games'},
                {value: 'miscellaneous', text: 'Miscellaneous'}
            ],
            create: function(input) {
                return {
                    value: input,
                    text: input
                }
            },
            onBlur(){
            TechnologyFormComponent.categories = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
            },
            onChange(value){
            TechnologyFormComponent.subSelectizeCategorize(value);                
            TechnologyFormComponent.mainCategory = value.split(",",1).toString().toLowerCase();
            }
        });
    }
    subSelectizeInit(){
        let TechnologyFormComponent = this; 
        $('#sub-category-input').prop('disabled', 'disabled');
        this.subSelectize = $('.sub_category').selectize({
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
            create: function(input) {
                return {
                    value: input,
                    text: input
                }
            },
            onBlur(){
            },
            onChange(value){
            TechnologyFormComponent.subCategorySelected(value);
            TechnologyFormComponent.subCategory = value.split(",",1).toString().toLowerCase();
            }
        });
    }
    subSelectizeCategorize(value){
        let selectize = this.subSelectize && this.subSelectize[0] ? this.subSelectize[0].selectize : null
        if(selectize){
            $('#sub-category-input').prop('disabled', false);
            selectize.enable();
            selectize.clear();
            selectize.clearOptions();
            switch(value){
                case 'computers': 
                    selectize.load(function(callback) {
                        callback(computersList);
                    }); 
                    if(this.sizeChoicesOpen && this.shoeSizesOpen){
                        $('#sub-category-selected-shoes').slideUp();
                        $('#sub-category-selected').slideDown();
                        this.shoeSizesOpen = false;
                    }
                    if(!this.hidden){
                        if(!this.sizeChoicesOpen){ //this second if is to check if the options are open, if so, don't open them, but still set the hidden value.
                            $('#no-variations-dimensions-selections').slideDown();
                            $('#no-variations-selections').slideUp();
                            $('#no-variations-selects').data('hidden',true);
                        }
                        this.hidden = true;
                    }
                    break;
                case 'phones':
                    this.sizes = this.clothSizes;
                    this.sizeValues = this.clothSizeValues;
                    selectize.load(function(callback) {
                            callback(phonesList);
                    }); 
                    if(this.sizeChoicesOpen && this.shoeSizesOpen){
                        $('#sub-category-selected-shoes').slideUp();
                        $('#sub-category-selected').slideDown();
                        this.shoeSizesOpen = false;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
                case 'tablets':
                    this.sizes = this.clothSizes;
                    this.sizeValues = this.clothSizeValues;
                    selectize.load(function(callback) {
                            callback(tabletList);
                    });
                    if(this.sizeChoicesOpen && this.shoeSizesOpen){
                        $('#sub-category-selected-shoes').slideUp();
                        $('#sub-category-selected').slideDown();
                        this.shoeSizesOpen = false;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
                case 'wearables':
                    this.sizes = this.clothSizes;
                    this.sizeValues = this.clothSizeValues;
                    selectize.load(function(callback) {
                            callback(wearablesList);
                    }); 
                    if(this.sizeChoicesOpen && this.shoeSizesOpen){
                        $('#sub-category-selected-shoes').slideUp();
                        $('#sub-category-selected').slideDown();
                        this.shoeSizesOpen = false;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
                case 'speakers':
                    this.sizes = this.shoeSizes;
                    this.sizeValues = this.shoeSizes;
                    selectize.load(function(callback) {
                            callback(speakerList);
                    });
                    if(this.sizeChoicesOpen && !this.shoeSizesOpen){
                        $('#sub-category-selected').slideUp();
                        $('#sub-category-selected-shoes').slideDown();
                        this.shoeSizesOpen = true;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
                case 'televisions':
                    this.sizes = this.shoeSizes;
                    this.sizeValues = this.shoeSizes;
                    selectize.load(function(callback) {
                            callback(televisionList);
                    });
                    if(this.sizeChoicesOpen && !this.shoeSizesOpen){
                        $('#sub-category-selected').slideUp();
                        $('#sub-category-selected-shoes').slideDown();
                        this.shoeSizesOpen = true;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
                case 'video-games':
                    this.sizes = this.shoeSizes;
                    this.sizeValues = this.shoeSizes;
                    selectize.load(function(callback) {
                            callback(videoGameList);
                    });
                    if(this.sizeChoicesOpen && !this.shoeSizesOpen){
                        $('#sub-category-selected').slideUp();
                        $('#sub-category-selected-shoes').slideDown();
                        this.shoeSizesOpen = true;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
                case 'miscellaneous':
                    this.sizes = this.shoeSizes;
                    this.sizeValues = this.shoeSizes;
                    if(this.sizeChoicesOpen && !this.shoeSizesOpen){
                        $('#sub-category-selected').slideUp();
                        $('#sub-category-selected-shoes').slideDown();
                        this.shoeSizesOpen = true;
                    }
                    if(this.hidden){
                        if(!this.sizeChoicesOpen){
                            $('#no-variations-selections').slideDown();
                            $('#no-variations-dimensions-selections').slideUp();
                            $('#no-variations-selects').data('hidden',false);
                        }
                        this.hidden = false;
                    }
                    break;
            }
        }
    }
    watchRadios(){
    let component = this;
    $('#link').prop('disabled','disabled');
        $('.has-site').click(function() {
            if($('#site-yes').is(':checked')) { $('#link').prop('disabled',false); }
            else if($('#site-no').is(':checked')) {$('#link').prop('disabled','disabled').val('').removeClass('valid'); $('#site-link').removeClass('active'); component.uploadTechnology.patchValue({'link':null})}
        });
    }
    watchHasSizes(){
        $(".has-sizes").click(()=>{
            this.hasSizesSelected = true;
            $(".has-colors").prop('disabled',false);
            this.hasSizes = $('#sizes-yes').is(':checked') ? true : false
            if(this.hasSizes != $("#technology-upload-form").data('sizes')){
                if(this.hasColorsSelected && this.hasDimensionsSelected) this.setSizesColorsDimensionsInputs();
                if(!this.hasSizes && !this.hasColors && this.hasColorsSelected){
                    $("#prices-container")
                    $("#price-container").slideDown();
                    $("#price").prop('disabled',false)
                } else if(this.hasColorsSelected) {
                    $("#prices-container").slideDown();
                    $("#price-container").slideUp();
                }
            }
        })
    }
    watchHasColors(){
        $(".has-colors").click(()=>{
            this.hasColorsSelected = true;
            $(".has-dimensions").prop('disabled',false)
            this.hasColors = $('#colors-yes').is(':checked') ? true : false
            if(this.hasColors != $("#technology-upload-form").data('colors')){
                if(this.hasDimensionsSelected) this.setSizesColorsDimensionsInputs();
                if(!this.hasSizes && !this.hasColors){
                    $("#prices-container").slideUp();
                    $("#price-container").slideDown();
                    $("#price").prop('disabled',false)
                } else {
                    $("#prices-container").slideDown();
                    $("#price-container").slideUp();
                }
            }
        })
    }
    watchHasDimensions(){
        $(".has-dimensions").click(()=>{
            this.hasDimensionsSelected = true;
            this.hasDimensions = $('#dimensions-yes').is(':checked') ? true : false
            if(this.hasDimensions != $("#technology-upload-form").data('dimensions')) this.setSizesColorsDimensionsInputs();
        })
    }
    setSizesColorsDimensionsInputs(){
            let $form = $("#technology-upload-form");
            $(`#${$form.data('sizes') ? 'yes' : 'no'}-sizes-${$form.data('colors') ? 'yes' : 'no'}-colors-${$form.data('dimensions') ? 'yes' : 'no'}-dimensions-selections`).slideUp();
            $(`.${$form.data('sizes') ? 'yes' : 'no'}-sizes-${$form.data('colors') ? 'yes' : 'no'}-colors-${$form.data('dimensions') ? 'yes' : 'no'}-dimensions-inputs`).unbind();
            $(`#${this.hasSizes ? 'yes' : 'no'}-sizes-${this.hasColors ? 'yes' : 'no'}-colors-${this.hasDimensions ? 'yes': 'no'}-dimensions-selections`).slideDown()
            $(`.${this.hasSizes ? 'yes' : 'no'}-sizes-${this.hasColors ? 'yes' : 'no'}-colors-${this.hasDimensions ? 'yes': 'no'}-dimensions-inputs`).prop('disabled',false)
            $form.data('sizes', this.hasSizes).data('colors', this.hasColors).data('dimensions', this.hasDimensions);
            // I call the watch functions!!!
            console.log('watch function')
            console.log(`watch${this.hasSizes ? 'Yes' : 'No'}Sizes${this.hasColors? 'Yes' : 'No'}Colors${this.hasDimensions ? 'Yes' : 'No' }Dimensions`)
            this[`watch${this.hasSizes ? 'Yes' : 'No'}Sizes${this.hasColors? 'Yes' : 'No'}Colors${this.hasDimensions ? 'Yes' : 'No' }Dimensions`]()
    }
    watchYesSizesYesColorsYesDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-yes-colors-yes-dimensions-inputs`).click(function(){
            let old_size_count = parseInt($(this).val())
        })
        $(`.yes-sizes-yes-colors-yes-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            if(times > old_size_count){
                for(let i = old_size_count; i < times; i++){
                    $("#yes-sizes-yes-colors-yes-dimensions").append(TechnologyFormComponent.getColorsDimensionsHTML('yes-sizes-yes-colors-yes-dimensions',i));
                    TechnologyFormComponent.watchColorInput('yes-sizes-yes-colors-yes-dimensions',true);
                }
            } else {
                for(let i = times; i < old_size_count; i++){
                    $(`#yes-sizes-yes-colors-yes-dimensions-sizing-choices-${i}`).remove();
                }
            }
            old_size_count = times;
        })
    }
     watchYesSizesYesColorsNoDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-yes-colors-no-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            old_size_count = parseInt($(this).data('amount'))
            if(times > old_size_count){
                for(let i = old_size_count; i < times; i++){
                    $("#yes-sizes-yes-colors-no-dimensions").append(TechnologyFormComponent.getColorsHTML('yes-sizes-yes-colors-no-dimensions',i));
                    TechnologyFormComponent.watchColorInput('yes-sizes-yes-colors-no-dimensions');
                }
            } else {
                for(let i = times; i < old_size_count; i++){
                    $(`#yes-sizes-yes-colors-no-dimensions-sizing-choices-${i}`).remove();
                }
            }
            $(this).data('amount',times);
        })
    }
    watchYesSizesNoColorsYesDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-no-colors-yes-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            old_size_count = parseInt($(this).val())
            if(times > old_size_count){
                for(let i = old_size_count; i < times; i++){
                    $("#yes-sizes-no-colors-yes-dimensions").append(TechnologyFormComponent.getSingleColorDimensionsHTML('yes-sizes-no-colors-yes-dimensions',i));
                    TechnologyFormComponent.WatchSizeInput('yes-sizes-no-colors-yes-dimensions');
                }
            } else {
                for(let i = times; i < old_size_count; i++){
                    $(`#yes-sizes-no-colors-yes-dimensions-sizing-choices-${i}`).remove();
                }
            }
            $(this).data('amount',times)
        })
    }
    watchYesSizesNoColorsNoDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-no-colors-no-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            if(times > old_size_count){
                for(let i = old_size_count; i < times; i++){
                    $("#yes-sizes-no-colors-no-dimensions").append(TechnologyFormComponent.getSizesHTML('yes-sizes-no-colors-no-dimensions',i));
                    TechnologyFormComponent.watchSizes('yes-sizes-no-colors-no-dimensions');
                }
            } else {
                for(let i = times; i < old_size_count; i++){
                    $(`#yes-sizes-no-colors-no-dimensions-sizing-choices-${i}`).remove();
                }
            }
            $(this).data('amount',times);
        })
    }
    watchNoSizesYesColorsYesDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.no-sizes-yes-colors-yes-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            if(times > old_size_count){
                for(let i = old_size_count; i < times; i++){
                    $("#no-sizes-yes-colors-yes-dimensions").append(TechnologyFormComponent.getColorsExtendedHTML('no-sizes-yes-colors-yes-dimensions',i));
                }
            } else {
                for(let i = times; i < old_size_count; i++){
                    $(`#no-sizes-yes-colors-yes-dimensions-color-choices-${i}`).remove();
                }
            }
            $(this).data('amount',times);
            TechnologyFormComponent.watchColorsExtended("no-sizes-yes-colors-yes-dimensions",null,true);
        })
    }
    watchNoSizesYesColorsNoDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.no-sizes-yes-colors-no-dimensions-inputs`).click(function(){
            old_size_count = parseInt($(this).val())
        })
        $(`.no-sizes-yes-colors-no-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            if(times > old_size_count){
                for(let i = old_size_count; i < times; i++){
                    $("#no-sizes-yes-colors-no-dimensions").append(TechnologyFormComponent.getColorsExtendedHTML('no-sizes-yes-colors-no-dimensions',i));
                }
            } else {
                for(let i = times; i < old_size_count; i++){
                    $(`#no-sizes-yes-colors-no-dimensions-color-choices-${i}`).remove();
                }
            }
            $(this).data('amount',times);
            TechnologyFormComponent.watchColorsExtended(`no-sizes-yes-colors-no-dimensions`)
        })
    }
    watchNoSizesNoColorsYesDimensions(){
        $("#price").unbind();
        $(`.no-sizes-no-colors-yes-dimensions-inputs, #price`).on('keyup',()=>{
            let width = parseFloat($('#no-sizes-no-colors-yes-dimensions-width').val())
            let height = parseFloat($('#no-sizes-no-colors-yes-dimensions-height').val())
            let depth = parseFloat($('#no-sizes-no-colors-yes-dimensions-depth').val())
            let quantity = parseInt($('#no-sizes-no-colors-yes-dimensions-quantity').val())
            let price = parseFloat($('#no-sizes-no-colors-yes-dimensions-price').val());
            let color = $('#no-sizes-no-colors-yes-dimensions-color').val()
            if(width && height && depth && (quantity || quantity === 0) && price && color){
                this.JSONObject = {}
                this.JSONObject["default"] = {}
                this.JSONObject["default"]["height"] = height
                this.JSONObject["default"]["width"] = width
                this.JSONObject["default"]["depth"] = depth
                this.JSONObject["default"][color]={}
                this.JSONObject["default"][color]["quantity"] = quantity
                this.JSONObject["default"][color]["price"]= price
                this.uploadTechnology.patchValue({'price':price})
            }
            
        })
    }
    watchNoSizesNoColorsNoDimensions(){
        $(`.no-sizes-no-colors-no-dimensions-inputs`).on('keyup',()=>{
            let quantity = parseInt($('#no-sizes-no-colors-no-dimensions-quantity').val())
            let color = $('#no-sizes-no-colors-no-dimensions-color').val()
            let size = $('#no-sizes-no-colors-no-dimensions-size').val()
            let price = parseFloat($('#no-sizes-no-colors-no-dimensions-price').val());
            if((quantity || quantity === 0) && price && color){
                this.JSONObject = {}
                this.JSONObject[size] = {}
                this.JSONObject[size][color]={}
                this.JSONObject[size][color]["quantity"] = quantity
                this.JSONObject[size][color]["price"]= price
                this.uploadTechnology.patchValue({'price':price})
            }
            
        })
    }

    /// ############### ///
    /// MIDDLE WATCHING ///
    /// ############### ///

    // watchYesSizesNoColorsNoDimensions(){
    //     let old_size_count = 0, TechnologyFormComponent = this;
    //     $(`.yes-sizes-no-colors-no-dimensions-inputs`).click(function(){
    //         let old_size_count = parseInt($(this).val())
    //     })
    //     $(`.yes-sizes-no-colors-no-dimensions-inputs`).on('change',function(){
    //         let times = parseInt($(this).val())
    //         if(times > old_size_count){
    //             for(let i = old_size_count; i < times; i++){
    //                 $("#yes-sizes-no-colors-no-dimensions").append(TechnologyFormComponent.getColorsHTML('yes-sizes-no-colors-no-dimensions',i));
    //             }
    //         } else {
    //             for(let i = times; i < old_size_count; i++){
    //                 $(`#yes-sizes-no-colors-no-dimensions-sizing-choices-${i}`).remove();
    //             }
    //         }
    //         old_size_count = times;
    //     })
    // }

    /// ############### ///
    /// BOTTOM WATCHING ///
    /// ############### ///

    WatchSizeInput(type,dimensions=false){
        $(`.${type}-color-input, #${type}-color`).on('keyup',()=>{
            
            let output = [];
            let sizes = parseInt($(`#${type}-size-count`).val());
            
            
            let color = $(`#${type}-color`).val()
            
            
            for(let i = 0; i < sizes; i++){
                let size = $(`#${type}-size-${i}`).val()
                let quantity = $(`#${type}-quantity-${i}`).val()
                let price = $(`#${type}-price-${i}`).val()
                let width = $(`#${type}-width-${i}`).val()
                let height = $(`#${type}-height-${i}`).val()
                let depth = $(`#${type}-depth-${i}`).val()
                
                
                
                
                
                
                if(size && (quantity || quantity === 0) && price && width && height && depth){
                    
                    output.push([size,width,height,depth,price,quantity]);
                }
            }
            
            if(output && output.length){
                this.JSONObject = {}
                for(let i =0; i < output.length; i++){
                    this.JSONObject[output[i][0]] = {}
                    this.JSONObject[output[i][0]]["width"] = output[i][1]
                    this.JSONObject[output[i][0]]["height"] = output[i][2]
                    this.JSONObject[output[i][0]]["depth"] = output[i][3]
                    this.JSONObject[output[i][0]][color] = {}
                    this.JSONObject[output[i][0]][color]["price"] = output[i][4]
                    this.JSONObject[output[i][0]][color]["quantity"] = output[i][5]
                }
            }
            
        });
    }

    
    watchColorInput(type,dimensions=false){
        let old_color_amount = 0, TechnologyFormComponent = this;
        
        $(`.${type}-color-input`).on('change',function(){
            console.log('color input change - ${type}')
            let times = parseInt($(this).val())
            console.log(times);
            if(times > 25){
                $(this).val(25)
                times = 25;
            }
            let old_color_amount = parseInt($(this).data('amount'))
            console.log(old_color_amount);
            let index = parseInt($(this).data('index'));
            console.log(index);
            if(times > old_color_amount){
                
                for(let i = old_color_amount; i < times; i++){
                    $(`#${type}-sizing-choices-${index}`).append(TechnologyFormComponent.getColorsExtendedHTML(type,i,index));
                }
            } else {
                
                for(let i = times; i < old_color_amount; i++){
                    $(`#${type}-color-choices-${index}-${i}`).remove()
                }
            }
            TechnologyFormComponent.watchColorsExtended(type,index,dimensions);
            $(this).data('amount',times);
        });
        $(`.${type}-size-input`).on('keyup', function(){
            if(!dimensions)TechnologyFormComponent.createJSONoutputExtended(type)
            else TechnologyFormComponent.createJSONoutputExtendedDimensions(type)
        })
    }

    watchColorsExtended(type,parentIndex=null,dimensions=false){
        $(`.${type}-color-choices-inputs${parentIndex != null ? `-` + parentIndex : ''}`).unbind().on('keyup change',()=>{
            
            if(parentIndex === null){
                this.createJSONoutput2(type);
            } else if(parentIndex != null && !dimensions) {
                this.createJSONoutputExtended(type);
            } else if(parentIndex != null && dimensions){
                this.createJSONoutputExtendedDimensions(type);
            }
        })
    }

    watchSizes(type){
        $(`.${type}-input`).unbind().on('change keyup', ()=>{
            this.JSONObject = {}
            let count = parseInt($(`#${type}-size-count`).val())
            let color = $(`#${type}-color`).val()
            for(let i =0; i < count; i++){
                let size = $(`#${type}-size-${i}`).val()
                let quantity = parseInt($(`#${type}-quantity-${i}`).val())
                let price = parseFloat($(`#${type}-price-${i}`).val())
                if(size && (quantity || quantity === 0) && price){
                    this.JSONObject[size]={}
                    this.JSONObject[size][color]={}
                    this.JSONObject[size][color]["quantity"] = quantity
                    this.JSONObject[size][color]["price"] = price
                }
            }
            
        })
    }


    createJSONoutputExtendedDimensions(type){
        
        let size_count = parseInt($(`#${type}-size-count`).val())
        let output = [];
        let totalSizes = [];
        this.totalPrices = [];
        let positions = [];
        for(let i = 0; i < size_count; i++){
            let size_output = [];
            let depth = parseFloat($(`#${type}-depth-${i}`).val())
            let height = parseFloat($(`#${type}-height-${i}`).val())
            let width = parseFloat($(`#${type}-width-${i}`).val())
            let total = width + height + depth;
            let prices = [];
            let quantity = 0;
            let color_count = parseInt($(`#${type}-color-amount-${i}`).val())
            
            for(let ic = 0; ic < color_count; ic++){
                let color = $(`#${type}-input-color-${i}-${ic}`).val();
                let quantity = parseInt($(`#${type}-input-quantity-${i}-${ic}`).val());
                let price = parseFloat($(`#${type}-input-price-${i}-${ic}`).val());
                
                
                
                if(color && (quantity || quantity === 0) && price) size_output.push([color,quantity,price]);
                if(price) prices.push(price)
                if(quantity) quantity += 1;
            }
            
            
            if(size_output.length) output.push([height,width,depth,size_output])
            if(total) totalSizes.push(total);
            if(total) positions.push(total);

            if(Math.min.apply(null, prices)) this.totalPrices.push(Math.min.apply(null, prices));
            if(Math.max.apply(null,prices)) this.totalPrices.push(Math.max.apply(null,prices));
            this.lowestPrice = Math.min.apply(null, this.totalPrices);
            this.maxPrice = Math.max.apply(null, this.totalPrices)

            
            if(this.lowestPrice) this.uploadTechnology.patchValue({min_price:this.lowestPrice});
            if(this.maxPrice) this.uploadTechnology.patchValue({max_price:this.maxPrice});
            
            
        }
        totalSizes.sort(function(a,b) { return a - b; });
        
        
        
        
        if(totalSizes && totalSizes.length){
            this.JSONObject = {};
            for(let i = 0; i < totalSizes.length; i++){
                let nameSize;
                switch(i){
                    case 0:
                        nameSize = 'small';
                        break;
                    case 1:
                        nameSize = 'medium';
                        break;
                    case 2:
                        nameSize = 'large';
                        break;
                    default:
                        nameSize = `${'x'.repeat(i-3)}l`
                        break;
                }
                let index = positions.indexOf(totalSizes[i])
                if(nameSize && output.length && output[index] && output[index][3]) {
                    this.JSONObject[nameSize] = {
                        height:output[index][0],
                        width:output[index][1],
                        depth:output[index][2],
                    }
                    for(let ic = 0;ic < output[index][3].length; ic++){
                        if(output[index][3][ic].length){
                            
                            // idk why the 1 and 2 need to be switched. (ie) the price should be [2] and the quantity should be [1]
                            // not the issue will continue this tomorrow
                            this.JSONObject[nameSize][output[index][3][ic][0]]={
                                quantity:output[index][3][ic][1],
                                price:output[index][3][ic][2]
                            }
                        }
                    }
                }
            }
        }
        
    }

    createJSONoutputExtended(type){
        
        let size_count = parseInt($(`#${type}-size-count`).val()), output = [];
        
        for(let i = 0; i < size_count; i++){
            let size_output = [];
            let size = $(`#${type}-size-${i}`).val() 
            let color_count = parseInt($(`#${type}-color-amount-${i}`).val())
            
            
            for(let ic = 0; ic < color_count; ic++){
                let color = $(`#${type}-input-color-${i}-${ic}`).val();
                let quantity = parseInt($(`#${type}-input-quantity-${i}-${ic}`).val());
                let price = parseFloat($(`#${type}-input-price-${i}-${ic}`).val());
                
                
                
                if(color && (quantity || quantity === 0) && price) size_output.push([color,quantity,price]);
            }
            
            
            if(size_output.length) output.push([size,size_output])
        }
        if(output && output.length){
            this.JSONObject = {}
            for(let i = 0; i < output.length; i++){
                if(Object.keys(this.JSONObject).indexOf(output[i][0]) === -1){
                    this.JSONObject[output[i][0]] = {}
                }
                for(let ic = 0; ic < output[i][1].length; ic++){
                    this.JSONObject[output[i][0]][output[i][1][ic][0]] = {}
                    this.JSONObject[output[i][0]][output[i][1][ic][0]]["quantity"] = output[i][1][ic][1];
                    this.JSONObject[output[i][0]][output[i][1][ic][0]]["price"] = output[i][1][ic][2];
                }
            }
        }
        
        
    }

    createJSONoutput2(type){
        let count = parseInt($(`#${type}-color-count`).val())
        
        let output = [];
        this.JSONObject = {};
        for(let i =0;i < count; i++){
            let color = $(`#${type}-input-color-${i}`).val()
            let quantity = parseInt($(`#${type}-input-quantity-${i}`).val())
            let price = parseFloat($(`#${type}-input-price-${i}`).val())
            if(color && (quantity || quantity === 0) && price) output.push([color,quantity,price])
        }
        if(output.length){
            for(let i = 0; i < output.length; i++){
                if(!Object.keys(this.JSONObject).length) this.JSONObject["default"] = {}
                this.JSONObject["default"][output[i][0]] = {}
                this.JSONObject["default"][output[i][0]]["quantity"] = output[i][1];
                this.JSONObject["default"][output[i][0]]["price"] = output[i][2];
            }
        }
        
    }


    getSizesHTML(type,index){
         return `
                <div class='${type}-sizing-choices row col m10 offset-m2' id='${type}-sizing-choices-${index}'>
                    <div class='row'>
                        <div class='col m4'> 
                            <label style='white-space:nowrap'>Size: (put 'default' if not applicable)</label>
                            <input class='${type}-input' id='${type}-size-${index}' type='text' data-index='${index}'/>
                        </div>
                        <div class='col m4'> 
                             <label>Quantity</label>
                            <input class='${type}-input' id='${type}-quantity-${index}' type='number'  data-index='${index}' min="0"/>
                        </div>
                        <div class='col m4'> 
                             <label>Price: ($)</label>
                            <input class='${type}-input' id='${type}-price-${index}' type='number' step="any" data-index='${index}'/>
                        </div>
                    </div>
                </div>
                `
    }

    getColorsHTML(type,index){
        return `
                <div class='${type}-sizing-choices row col m10 offset-m2' id='${type}-sizing-choices-${index}'>
                    <div class='row'>
                        <div class='col m4'> 
                            <label style='white-space:nowrap'>Size: (put 'default if not applicable'</label>
                            <input class='${type}-size-input' id='${type}-size-${index}' type='text' data-index='${index}'/>
                        </div>
                        <div class='col m4'> 
                             <label>How many colors?</label>
                            <input class='${type}-color-input' id='${type}-color-amount-${index}' type='number' min="1" max="25" data-index='${index}' value='0' data-amount="0" min="0"/>
                        </div>
                    </div>
                </div>
                `
    }
    getSingleColorDimensionsHTML(type,index){
         return `
                <div class='${type}-sizing-choices row col m11 offset-m1' id='${type}-sizing-choices-${index}' style='border: 1px solid rgba(0,0,0,0.1)'>
                    <div class='row'>
                        <div class='col m4'>
                            <label style='white-space:nowrap'>Size: (out 'default' if not applicable)</label>
                            <input class='${type}-color-input' id='${type}-size-${index}' type='text'/>
                        </div>
                        <div class='col m4'>
                            <label>Quantity:</label>
                            <input class='${type}-color-input' id='${type}-quantity-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Price: ($)</label>
                        <input class='${type}-color-input' id='${type}-price-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                    </div>
                    <hr>
                    <div class='row'>
                        <div class='col m4'>
                            <label>Height:</label>
                            <input class='${type}-color-input' id='${type}-height-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Width:</label>
                            <input class='${type}-color-input' id='${type}-width-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Depth:</label>
                            <input class='${type}-color-input' id='${type}-depth-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                    </div>
                </div>
        
                `
    }
    getColorsDimensionsHTML(type,index){
         return `
                <div class='${type}-sizing-choices row col m11 offset-m1' id='${type}-sizing-choices-${index}'>
                    <div class='col m3'>
                        <label>Number of Colors:</label>
                        <input class='${type}-color-input' id='${type}-color-amount-${index}' type='number' min='1' data-size='' data-index="${index}" value="0" min="0" data-amount="0"/>
                    </div>
                    <div class='col m9' style='border: 1px solid rgba(0,0,0,0.1)'>
                        <div class='col m4'>
                            <label>Height: (put 'default' if not applicable)</label>
                            <input class='${type}-color-input' id='${type}-height-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Width:</label>
                            <input class='${type}-color-input' id='${type}-width-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Depth:</label>
                            <input class='${type}-color-input' id='${type}-depth-${index}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                    </div>
                </div>
        
                `
    }
    getColorsExtendedHTML(type,index,parentIndex=null){
        return `
                <div class='${type}-color-choices${parentIndex != null ? `-` + parentIndex : ''} row col m12' id='${type}-color-choices${parentIndex != null ? `-` + parentIndex : ''}-${index}'>
                    <div class='col m3 offset-m3'>
                        <label style='white-space:nowrap'>Color: (put 'default' if not applicable)</label>
                        <input class='color-type ${type}-color-choices-inputs${parentIndex != null ? `-` + parentIndex : ''}' id='${type}-input-color${parentIndex != null ? `-` + parentIndex : ''}-${index}' type='text' data-index='${index}'/>
                    </div>
                    <div class='col m3'>
                        <label>Quantity:</label>
                        <input class='color-type  ${type}-color-choices-inputs${parentIndex != null ? `-` + parentIndex : ''}' id='${type}-input-quantity${parentIndex != null ? `-` + parentIndex : ''}-${index}' type='number' min="1"  data-index='${index}'/>
                    </div>
                    <div class='col m3'>
                        <label>Price: ($)</label>
                        <input class='color-type  ${type}-color-choices-inputs${parentIndex != null ? `-` + parentIndex : ''}' id='${type}-input-price${parentIndex != null ? `-` + parentIndex : ''}-${index}' type='number' min="0" step="any" data-index='${index}'/>
                    </div>
                </div>
                `
    }

    subCategorySelected(value){
        //Change everything to shoe sizes
        $('.has-variations').prop('disabled',false);
        $('#has-variations-text').removeClass('disabled-text');
        if(value == 'shoes'){
            this.sizes = this.shoeSizes;
            this.sizeValues = this.shoeSizes;

        //change everything to dimensions
        } else if (value == 'Backpacks') {
        
        //change everything to clothing sizes.
        } else {

        }
    }

  addImage(src,count,total,index,name){
        return `
                <div class='col m4 technology-form-photo-containers' style='padding:4px' id='technology-form-photo-container-${name}' data-count='${count}' data-total='${total}' data-name='${name}' data-index='${index}' data-id='0'>
                    <div class='progress-container' style='position: relative;top: 38px;left: -50px;'>
                        <div class='progress-bar' id="progress-${name}">
                            <div class='inner-progress-bar' id='inner-progress-${name}'></div>
                        </div>
                        <span class='progress-text-container'><span id='progress-text-${name}'>0</span>/100</span>
                    </div>
                    <div class='photo-border'>
                        <div>
                            <div class='delete-photo' id='delete-photo-${name}' style='float:right;padding-top:5px;cursor:pointer;display:none' data-index='${index}' data-total='${total}' data-name='${name}'>
                                <div class='notification-close-button-first' style='background-color:black'></div>
                                <div class='notification-close-button-second' style='background-color:black'></div>
                            </div>
                        </div>
                        <div class='photo-border-top'>
                            <img src='${src}' alt='image' width='100%' id='technology-form-photo-${total}' data-index='${index}'/>
                        </div>
                    </div>
                </div>
                
                `
    }
    loopPhoto(total,fileSelector,count=0){
        if(count < total){
            let file = fileSelector[0].files[count];
            let name = `${file.name.replace(/[^\w]/gi, '-')}-${file.lastModified}-${file.size}`
            if(!$(`#technology-form-photo-container-${name}`).length){
                this.imageCount += 1;
                this.imageFile = file;
                if (FileReader && file) {
                    let fr = new FileReader();
                    fr.onload = ()=> {
                        this.totalImageCount += 1; // this needs to stay be here or it will just add all of I at once - and not increment.
                        $('#photos-technology-form').append(this.addImage(fr.result,this.imageCount,this.totalImageCount,count,`${file.name.replace(/[^\w]/gi, '-')}-${file.lastModified}-${file.size}`));
                        this.loopPhoto(total,fileSelector,count+1)
                    //this.image = fr.result;
                    }
                    fr.readAsDataURL(file);
                } else { //no FileReader support

                }
            } else {
                this.loopPhoto(total,fileSelector,count+1)
            }
        } else {
             $('#photo-upload').unbind();
                $.cleanData( $('#photo-upload') ); //remove jquery file upload events. We then add them back on.
                $("#photo-upload").replaceWith($("#photo-upload").val('').clone(true));

                setTimeout(()=>{
                    this.photoChange();
                    // $( "#photos-technology-form" ).disableSelection();
                },200)
        }
        setTimeout(()=>{ this.watchPhotoDelete() },200)
    }
    photoChange(){
      $(`#photo-upload`).click(()=>{
          if(!this.photoClicked){
            this.photoClicked = true;
            this.photoUpload();    
            var fileSelector = $("#photo-upload").on('change', ()=>{
                this.photoClicked = false;
                
                let count = fileSelector[0].files.length < 5 ? fileSelector[0].files.length : 4;
                count = (count + this.imageCount  >= 4) ?  4 - this.imageCount : count;
                this.loopPhoto(count,fileSelector,0)
            });
          }
      });
  }
    photoUpload(){
       var self = this;
       $(`#photo-upload`).fileupload({
        url: `${self._backend.SERVER_URL}/api/v1/photos/create`,
        formData: {'authorization': `Bearer ${self._auth.getToken()}`, 'photo_upload':1, 'id':self.id},
        dataType: 'json',
        sequentialUploads: true,
        add: function (e, data) {
            let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
            if(!$(`#technology-form-photo-container-${name}`).length) data.submit();
            else Materialize.toast("Image has already been added", 3500, 'rounded-info');
            self.uploadComplete=false;
        },
        progress: (e, data) => {
          let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
          var progress = Math.floor(((parseInt(data.loaded)*0.9)  / (parseInt(data.total))) * 100);
          $(`#inner-progress-${name}`).css({'transform':`translateX(${progress}%)`});
          $(`#progress-text-${name}`).text(progress);
          self.uploadPhotoCount += 1;
        },
        done: function (e, data) {
            // $.each(data.result.files, function (index, file) {
            //     $('<p/>').text(file.name).appendTo(document.body);
            // });
             let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
            $(`#inner-progress-${name}`).css({'transform':`translateX(100%)`});
            $(`#progress-text-${name}`).text(100);
            if(e) 
            if(data.result.id) self.id = data.result.id;
            if(data.result.photos){
                self.uploadComplete=true;
                self.has_uploaded = true;
                let length = data.result.photos.length - 1;
                let id = data.result.photos[length].uuid;
                self.photoIds.push(id);
                $(`#technology-form-photo-container-${name}`).attr('data-id',id.toString());
                $(`#delete-photo-${name}`).attr('data-id',id.toString()).css({'display':'block'});
                $('#photos-technology-form').sortable({
                    stop : (event,ui) => { 
                        self.sorted = true;
                        self.sortedIds = $("#photos-technology-form").sortable('toArray', { attribute: 'data-id' })
                     }
                });
            }
        }
      });    
  }
  deleteTechnology(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        var creds = {"id": this.id, "upload":true}
        this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/technology/delete`, creds, {headers: headers}).subscribe(data => {
             this.technologyDelete=true;
             if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
        });
    }
   watchPhotoDelete(){
        // if(this.watchingDelete) $(`.delete-photo`).unbind('click');
        $(`.delete-photo`).unbind('click');
        this.watchingDelete = true;
        let TechnologyFormComponent = this;
        $(`.delete-photo`).on('click', function(){
            let index = TechnologyFormComponent.photoIds.indexOf($(this).data('id'));
            let totalId = $(this).data('total');
            let id = TechnologyFormComponent.photoIds[parseInt(index)];
            let name = $(this).data('name');
            TechnologyFormComponent.deletePhoto(id,index,totalId);
        });
    }
    deletePhoto(id,index,totalId){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        var creds = {"photo": id, "product":this.id}
        this.deletePhotoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/photos/delete`, creds, {headers: headers}).subscribe(data => {
            if(data.json().success){
                let count = parseInt($('#appare-form-photo-container').data('count'));
                $('.apprel-form-photo-containers').removeClass(`m${count}`)
                $('.apprel-form-photo-containers').addClass(`m${12/(count-1)}`)
                $('#appare-form-photo-container').data('count', (count-1))
                $(`#technology-form-photo-container-${totalId}`).remove();
                this.photoIds.splice(index,1);
                this.imageCount -= 1;
            }
        });
    }
        addGuide(){
    return `
            <div class='row col ps12 m8 offset-m2' style='border:1px solid rgba(0,0,0,0.1);margin-top:10px' id='formatting-guide'>
              <span class='center'>Guide</span>
              <hr>
              <div class='input col ps6' style='padding:0px !important'>
                <div class='format-box'>Input</div>
                <div class='format-box'>*italics* or _italics_</div>
                <div class='format-box'>**bold** or __bold__</div>
                <div class='format-box'>[link to waydope.com](https://waydope.com)</div>
                <div class='format-box'>![image name](https://img.com/img.png)</div>
                <div class='format-box'># h1 ## h2 ### h3</div>
              </div>
              <div class='output col ps6' style='padding:0px !important'>
                <div class='format-box'>Output</div>
                <div class='format-box'><i>italics</i></div>
                <div class='format-box'><b>bold</b></div>
                <div class='format-box'><a href='https://waydope.com'>link to waydope.com</a></div>
                <div class='format-box'><img src='https://waydope.com/assets/images/favicon.ico' alt='image name'/></div>
                <div class='format-box'><h1 style='display:inline'>h1</h1> <h2 style='display:inline'>h2</h2> <h3 style='display:inline'>h3</h3></div>
              </div>
            </div>
            `
  }
watchFormattingButton(){
    let component = this;
    $('#formatting-guide-link').on('click',function(e){
        if(!$('#add-formatting-guide').data('open')){
          $('#add-formatting-guide').append(component.addGuide());
          $('#add-formatting-guide').data('open',true);
          $('#formatting-guide-link').addClass('active');
        } else {
          $(`#formatting-guide`).remove();
          $('#add-formatting-guide').data('open',false);
          $('#formatting-guide-link').removeClass('active')
        }
    });
  }
  watchDescription(){
    $('#description').keyup(function(e) {
          let type = $(this).data('type')
          if(type === 'link'){
            $('#output-container-link').css({'display':'block'});
            $('#post-output-link').html(marked($(this).val()));
          } else {
            $('#output-container').css({'display':'block'});
            $('#post-output').html(marked($(this).val()));
          }
    });
  }
    cancelUpload(){
        this._router.navigateByUrl(`/technology/${this.mainCategory}/${this.subCategory}/${this.id}`);
    }
    submitTechnology(values){
        this.insubmit = true;
        let fadein = setTimeout(()=>{
            $(`#submit-technology-edit`).fadeIn().css("display","inline-block");
        },750)
        var headers = new Headers();
        let object;
        let form;
        object = this.JSONObject;
        
        let markedBody = values.description ? marked(values.description) : null;
        let creds = {"id":this.postId, "title": values.title, "creator": values.creator, "main_category": this.mainCategory, "sub_category": this.subCategory, 'color': this.color, "size":this.size, "quantity":this.quantity, "height":this.height, "width":this.width, "depth": this.depth, "form": form, 'description':values.description, "marked":markedBody,'properties':object, 'zip':values.zip, 'has_site':values.has_site, 'link':values.link, 'condition':values.condition, 'shipping':values.shipping, 'shipping_type': values.shipping_type, 'price': values.price, 'sale_price': values.sale_price,'turnaround_time':values.turnaround_time, 'returns':values.returns, 'has_variations':values.has_variations, 'sorted':this.sorted, 'sorted_ids': this.sortedIds} 
        
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.submitSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/technology/update`, creds, {headers: headers}).subscribe(data => {
                if(data.json().success){
                    clearInterval(failedRequest);
                    if(fadein) clearTimeout(fadein);
                    this.submitted = true;
                    this._sysMessages.setMessages('updatedTechnology');
                    if(this.has_uploaded) Materialize.toast("Please allow a minute for the photo to upload/change", 3500, 'rounded');
                    this._router.navigateByUrl(`/technology/${this.mainCategory}/${this.subCategory}/${data.json().url}`);
                } else if (data.json().error) {
                    // this.unsupported = true;
                } else if(data.json().status === 401){
                this._modal.setModal('technology','form');
                clearInterval(failedRequest);
                if(fadein) clearTimeout(fadein);
            } else {
            // this.error = true;
            }
            $(`#submit-technology-edit`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.submitted = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $('#submit-technology-edit').css({'display':'none'});
        },15000);
    }
     

    

    ngOnDestroy(){
      if(this.subscription) this.subscription.unsubscribe();
    }
}
