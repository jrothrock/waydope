/*
    WARNING: To the unfortunate programmer who has stumbled into this nest of fuckery. Be warned. The road ahead is nothing but
    trying to make stuff look pretty, while fighting everything else along the way. With eyes tiered and every line looking 
    fucking yellow, we shall perceiver and relish in the fact that this site is now, well, kinda gorgeous - and works well too, I guess.
*/

/*
    Honestly, it may have been easier to just break these out into component factories. That switch statement makes me question everything.
    Honestly, this is the epitome of shit code.
*/
import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import 'angular2-materialize';
import {ModalComponent} from '../../modal/modal.component';
import {ModalUpdateComponent} from '../../modal/update/modal.update.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {BackendService} from '../../../services/backend.service';

declare let ActionCable:any;
declare var $;
declare var Selectize;
declare var marked;
declare var Materialize;

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
        value: 'rain-coats'
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
        text: 'Boots',
        value: 'boots'
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
        text: 'Flip-Flops',
        value: 'flip-flops'
    },
    {
        text: 'Sandals',
        value:'sandals'
    }
];

Selectize.define('hidden_textfield', function(options) {
        var self = this;
        this.showInput = function() {
            this.$control.css({cursor: 'pointer'});
            this.$control_input.css({opacity: 0, position: 'relative', left: self.rtl ? 10000 : -10000 });
            this.isInputHidden = false;
        };

        this.setup_original = this.setup;

        this.setup = function() {
            self.setup_original();
            this.$control_input.prop("disabled","disabled");
        }
});

@Component({
  selector: 'apparel_form',
  templateUrl: 'apparel.form.component.html',
  providers: [FormBuilder,AuthService,ModalComponent, ModalUpdateComponent, SystemMessagesComponent]
})

export class ApparelFormComponent implements OnInit {
    initiateSubscription:any;
    submitSubscription:any;
    deleteSubscription:any;
    deletePhotoSubscription:any;
    uploadApparel: FormGroup;
    mainCategory:string;
    subCategory:string;
    categories:any=[];
    subSelectize:any;
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
    shoeSizes:any=['',4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5,20];
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
    apparelDelete:boolean=false;

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
    dimensionsJsonObject:any={};

    //monitor the no variation inputs. This is done to see if sizes change, if so, the object needs to be reset, and fill in a new object with the data.
    noVariationColor:string;
    noVariationQuantity:number;
    noVariationSize:any;
    id:number;
    photoClicked:boolean=false;
    imageFile:any;
    image:any;
    imageCount:number=0;
    watchingDelete:boolean=false; 
    photoIds:any=[];
    totalImageCount:number=0;
    uploadPhotoCount:number=0;

    sorted:boolean=false;
    sortedIds:any=[];

    insubmit:boolean=false;
    maxPrice:number;

    noVartiaions:boolean=false;
    dimensionsWatching:boolean=false;
    noDimensionsWatching:boolean=false;
    Object:any=Object;
    constructor(private _http: Http, private _backend: BackendService, private _auth: AuthService, private _mu: ModalUpdateComponent, private _fb: FormBuilder, private _router: Router, private _modal: ModalComponent, private _sysMessages:SystemMessagesComponent){};
	ngOnInit(){
        this.uploadApparel = this._fb.group({
            'title': [null, Validators.required],
            'creator': [null, Validators.required],
            'shipping': [null, Validators.required],
            'shipping_type': [null, Validators.required],
            // 'free_shipping': [null, Validators.required],
            // 'free_shipping_price': [{value: null, disabled:true}],
            'turnaround_time': [null, Validators.required],
            'max_price': [{value:null,disabled:true}],
            'min_price': [{value:null,disabled:true}],
            'price':[{value:null,disabled:true}],
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
        this.initiateApparelPost();
        this.selectizeInit();
        this.subSelectizeInit();
        this.watchRadios();
        this.watchHasOptions();
        this.photoChange();
        this.watchFormattingButton();
        this.watchDescription();
    };
    initiateApparelPost(){
        var headers = new Headers();
        let object;
        let form;
        if(this.sameSizeOptionSelected || (this.mainCategory === 'accessories' && !this.sizeChoicesOpen)){
            object = this.dimensionsJsonObject;
            form = 1;
        } else {
            object = this.JSONObject;
            form = 0;
        }
        let creds = {};
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.initiateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/apparel/new`, creds, {headers: headers}).subscribe(data => {
            if(data.json().success){
                this.id = data.json().id;
                // this should be cleaned up on the backend
                if(data.json().stage != 3){
                    this._mu.setBox('apparel');
                }
            } else if (data.json().error) {
                // this.unsupported = true;
            } else if(data.json().status === 401){
                this._modal.setModal('apparel','form');
            } else {
            // this.error = true;
            }
        });
    }
    selectizeInit(){
        let ApparelFormComponent = this; 
        $('.category').selectize({
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
                {value: 'accessories', text: 'Accessories'},
                {value: 'outerwear', text: 'Outerwear'},
                {value: 'shirts', text: 'Shirts'},
                {value: 'pants', text: 'Pants'},
                {value: 'shoes', text: 'Shoes'}
            ],
            create: function(input) {
                return {
                    value: input,
                    text: input
                }
            },
            onBlur(){
            ApparelFormComponent.categories = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
            },
            onChange(value){
            ApparelFormComponent.subSelectizeCategorize(value);                
            ApparelFormComponent.mainCategory = value.split(",",1).toString().toLowerCase();
            }
        });
    }
    subSelectizeInit(){
        let ApparelFormComponent = this; 
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
            ApparelFormComponent.subCategorySelected(value);
            ApparelFormComponent.subCategory = value.split(",",1).toString().toLowerCase();
            }
        });
    }
    subSelectizeCategorize(value){
        // 
        let selectize = this.subSelectize && this.subSelectize[0] ? this.subSelectize[0].selectize : null
        if(selectize){
            $('#sub-category-input').prop('disabled', false);
            selectize.enable();
            selectize.clear();
            selectize.clearOptions();
            switch(value){
                case 'accessories': 
                    selectize.load(function(callback) {
                        callback(accessoryList);
                    }); 
                    if(!this.clothSizesSelectionOpen){$('#sub-category-selected').append(this.getClothesSizeHTML());  this.clothSizesSelectionOpen = true }
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
                    if(this.noVartiaions && !this.dimensionsWatching){ this.watchNoVariationDimensionsInputs();  this.dimensionsWatching = true; }
                    break;
                case 'outerwear':
                    this.sizes = this.clothSizes;
                    this.sizeValues = this.clothSizeValues;
                    selectize.load(function(callback) {
                            callback(outerwearList);
                    }); 
                    if(!this.clothSizesSelectionOpen){$('#sub-category-selected').append(this.getClothesSizeHTML()); this.clothSizesSelectionOpen = true }
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
                    if(this.noVartiaions && !this.noDimensionsWatching){ this.watchNoVariationInputs();  this.noDimensionsWatching = true; }
                    break;
                case 'shirts':
                    this.sizes = this.clothSizes;
                    this.sizeValues = this.clothSizeValues;
                    selectize.load(function(callback) {
                            callback(shirtList);
                    });
                    if(!this.clothSizesSelectionOpen){$('#sub-category-selected').append(this.getClothesSizeHTML()); this.clothSizesSelectionOpen = true }
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
                    if(this.noVartiaions && !this.noDimensionsWatching){ this.watchNoVariationInputs();  this.noDimensionsWatching = true; }
                    break;
                case 'pants':
                    this.sizes = this.clothSizes;
                    this.sizeValues = this.clothSizeValues;
                    selectize.load(function(callback) {
                            callback(pantList);
                    }); 
                    if(!this.clothSizesSelectionOpen){$('#sub-category-selected').append(this.getClothesSizeHTML()); this.clothSizesSelectionOpen = true }
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
                    if(this.noVartiaions && !this.noDimensionsWatching){ this.watchNoVariationInputs();  this.noDimensionsWatching = true; }
                    break;
                case 'shoes':
                    this.sizes = this.shoeSizes;
                    this.sizeValues = this.shoeSizes;
                    selectize.load(function(callback) {
                            callback(shoeList);
                    });
                    if(!this.shoesSizesSelectionOpen){ $('#sub-category-selected-shoes').append(this.howManySizesHTML()); this.watchShoeSizeCount(); this.shoesSizesSelectionOpen = true; }
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
                    if(this.noVartiaions && !this.noDimensionsWatching){ this.watchNoVariationInputs();  this.noDimensionsWatching = true; }
                    break;
            }
        }
    }
    watchRadios(){
    let component = this;
    $('#link').prop('disabled','disabled');
        $('.has-site').click(function() {
            if($('#site-yes').is(':checked')) { $('#link').prop('disabled',false); }
            else if($('#site-no').is(':checked')) {$('#link').prop('disabled','disabled').val('').removeClass('valid'); $('#site-link').removeClass('active'); component.uploadApparel.patchValue({'link':null})}
        });
    }
    watchHasOptions(){
        $('.has-variations').prop('disabled','disabled');
        $('#has-variations-text').addClass('disabled-text');
        $('#price').prop('disabled','disabled');
        $('#has-options').click(()=>{
            if($('#variations-yes').is(':checked')) { 
                if(!this.sizeChoicesOpen){
                    $('.no-variations-containers').data('hidden',true);
                    $('.no-variations-containers').slideUp();
                    if(this.mainCategory != 'shoes'){
                        if(!this.clothSizesSelectionOpen){$('#sub-category-selected').append(this.getClothesSizeHTML()); this.clothSizesSelectionOpen = true } 
                        $('#sub-category-selected').slideDown();
                    } else {
                        if(!this.shoesSizesSelectionOpen){ $('#sub-category-selected-shoes').append(this.howManySizesHTML()); this.watchShoeSizeCount(); this.shoesSizesSelectionOpen = true;}
                        $('#sub-category-selected-shoes').slideDown();
                        this.shoeSizesOpen = true;
                    }
                }
                this.noVartiaions = false;
                this.sizeChoicesOpen = true; 
                $('#price').prop('disabled','disabled');
                $('#price').val('');
                this.JSONObject = {};
                this.dimensionsJsonObject = {};
                setTimeout(()=>{this.watchSizeSelections();},20); 
            }
            else if($('#variations-no').is(':checked')) {
                if(this.sizeChoicesOpen){
                    if(this.mainCategory != 'shoes'){
                        $('#sub-category-selected').slideUp(()=>{
                            $('#sub-category-selected-container').remove();
                            this.clothSizesSelectionOpen = false;
                            
                        }); 
                    } else {
                        $('#sub-category-selected-shoes').slideUp(()=>{
                            $('#shoe-sizes-count-choice').remove();
                            this.shoesSizesSelectionOpen = false;
                        }); 
                    }
                    this.sizeChoicesOpen = false;
                }
                $('#no-variations-size').addClass('enabled');
                if(this.hidden){
                    $('#no-variations-dimensions-selections').slideDown();
                }
                else if(!this.hidden){$('#no-variations-selections').slideDown();}
                $('.no-variations-sizes-inputs').prop('disabled',false);
                $('.no-variations-sizes-inputs-dimensions').prop('disabled',false);
                this.JSONObject = {};
                this.dimensionsJsonObject = {};
                this.smallSizeOptionSelected=false;
                this.mediumSizeOptionSelected=false;
                this.largeSizeOptionSelected=false;
                this.xlSizeOptionSelected=false;
                this.xxlSizeOptionSelected=false;
                this.xxxlSizeOptionSelected=false;
                this.xxxxlSizeOptionSelected=false;
                this.sameSizeOptionSelected=false;
                this.noVartiaions = true;
                if(this.mainCategory != 'accessories'){
                    this.watchNoVariationInputs();
                    this.noDimensionsWatching = true;
                } else {
                    this.watchNoVariationDimensionsInputs();
                    this.dimensionsWatching = true;
                }
            }
        })
    }
    getClothesHTML(type){
        return `
                <div class='${type}-sizing-choices' id='${type}-sizing-choices' class='row'>
                    <h6 class='capitalize' style='width:100%; float:left'>${type}</h6>
                    <div class='row'>
                        <div class='col m2'> 
                             <label>How many colors</label>
                            <input class='${type}-color-amount' type='number' min="1" max="25" data-type='${type}' value='1' data-amount="1"/>
                        </div>
                        <div class='col m10' id='${type}-colors-inputs'>
                        </div>
                    </div>
                    <hr>
                </div>
                `
    }
    noVariationsDimensionsHTML(){
        return ` 
                <div id='no-variations-dimensions' class='row'>
                    <div class='col m8'>
                        <div class='col m4'>
                            <label>Height:</label>
                            <input class='color-type' type='number' data-type='same-type' step="any" disabled/>
                        </div>
                        <div class='col m4'>
                            <label>Width:</label>
                            <input class='color-type' type='number' data-type='same-type' step="any" disabled/>
                        </div>
                        <div class='col m4'>
                            <label>Depth:</label>
                            <input class='color-type' type='number' data-type='same-type' step="any" disabled/>
                        </div>
                    </div>
                    <div class='col m4'>
                        <label>Quantity:</label>
                        <input class='color-type' type='number' data-type='same-type' disabled/>
                    </div>
            </div>
        
                `
    }
    howManyDimensionsHTML(){
        return `
                 <div id='dimension-count-choice' class='row col m12'>
                    <div class='col m4'>
                        <label>How many dimensions?</label>
                        <input class='dimensions-count' type='number' min='1' max='7' data-type='same-type' value="1" data-amount="1"/>
                    </div>
                </div>
                `
    }
    //occurs when the dimensions checkbox is checked and the user adds how many different dimensions they have
    dimensionsHTML(i){
        return `
                <div class='dimension-size-choices row col m12' id='dimension-size-choices-${i}'>
                    <div class='col m3'>
                        <label>Number of Colors:</label>
                        <input class='color-dimensions-type-${i}' type='number' min='1' data-size='' data-index="${i}" value="1" data-amount="1"/>
                    </div>
                    <div class='col m9' style='border: 1px solid rgba(0,0,0,0.1)'>
                        <div class='col m4'>
                            <label>Height:</label>
                            <input class='dimensions-type' id='dimensions-height-${i}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Width:</label>
                            <input class='dimensions-type' id='dimensions-width-${i}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                        <div class='col m4'>
                            <label>Depth:</label>
                            <input class='dimensions-type' id='dimensions-depth-${i}' type='number' min='0' step="any" data-type='same-type'/>
                        </div>
                    </div>
                </div>
                `
    }
    dimensionsExtendedHTML(index,parentIndex){
        return `
                <div class='${parentIndex}-color-choices row col m12' id='${parentIndex}-color-choices-${index}'>
                    <div class='col m3 offset-m3'>
                        <label>Color:</label>
                        <input class='color-type dimension-inputs-${parentIndex}' id='dimensions-input-color-${parentIndex}-${index}' type='text' data-color='${index}'/>
                    </div>
                    <div class='col m3'>
                        <label>Quantity:</label>
                        <input class='color-type dimension-inputs-${parentIndex}' id='dimensions-input-quantity-${parentIndex}-${index}' type='number' min="1"  data-color='${index}'/>
                    </div>
                    <div class='col m3'>
                        <label>Price: ($)</label>
                        <input class='color-type dimension-inputs-${parentIndex}' id='dimensions-input-price-${parentIndex}-${index}' type='number' min="0" step="any" data-color='${index}'/>
                    </div>
                </div>
                `
    }
    howManySizesHTML(){
        return `
                 <div id='shoe-sizes-count-choice' class='row col m12'>
                    <div class='col m4'>
                        <label>How many shoe sizes?</label>
                        <input id='shoe-size-count' type='number' min='1' data-type='same-type' data-amount="0"/>
                    </div>
                    <div style='float:left;width:100%;margin-bottom:40px;margin-left:10px'><span style='font-weight:500'>Note:</span> You can remove a shoe size, on submission, by setting the "size" selector to the blank option at the top.</span>
                </div>
                `
    }
    getShoeChoicesHTML(index){
        return `
                <div class='shoe-choices row col m12' id='shoe-choices-${index ? index : 0}'>
                    <div class='col m3'>
                        <label>Size:</label>
                        <select class='shoe-sizes-select-${index ? index : 0}' style='display: block'>
                            <option value=""></option>
                            <option value="4">4</option>
                            <option value="4.5">4.5</option>
                            <option value="5">5</option>
                            <option value="5.5">5.5</option>
                            <option value="6">6</option>
                            <option value="6.5">6.5</option>
                            <option value="7">7</option>
                            <option value="7.5">7.5</option>
                            <option value="8">8</option>
                            <option value="8.5">8.5</option>
                            <option value="9">9</option>
                            <option value="9.5">9.5</option>
                            <option value="10">10</option>
                            <option value="10.5">10.5</option>
                            <option value="11">11</option>
                            <option value="11.5">11.5</option>
                            <option value="12">12</option>
                            <option value="12.5">12.5</option>
                            <option value="13">13</option>
                            <option value="13.5">13.5</option>
                            <option value="14">14</option>
                            <option value="14.5">14.5</option>
                            <option value="15">15</option>
                            <option value="15.5">15.5</option>
                            <option value="16">16</option>
                            <option value="16.5">16.5</option>
                            <option value="17">17</option>
                            <option value="17.5">17.5</option>
                            <option value="18">18</option>
                            <option value="18.5">18.5</option>
                            <option value="19">19</option>
                            <option value="19.5">19.5</option>
                        </select>
                    </div>
                    <div class='col m3'>
                        <label>How many colors?</label>
                        <input class='shoe-color-type shoe-color-type-${index ? index : 0}' type='number' min="1" max="25" data-index='${index ? index : 0}' value=1 data-amount="1" />
                    </div>
                </div>

                `
    }
    getShoeColorHTML(index,parentIndex){
        return `
                <div class='${parentIndex}-shoe-color-choices row col m12' id='${parentIndex}-shoe-color-choices-${index}'> 
                    <div class='col m3 offset-m3'>
                        <label>Color:</label>
                        <input class='color-type shoe-inputs' id='${parentIndex}-${index}-shoe-color-value' type='text'/>
                    </div>
                    <div class='col m3'>
                        <label>Quantity:</label>
                        <input class='color-type shoe-inputs' id='${parentIndex}-${index}-shoe-quantity-value' type='number' min="1" />
                    </div>
                    <div class='col m3'>
                        <label>Price: ($)</label>
                        <input class='color-type shoe-inputs' id='${parentIndex}-${index}-shoe-price-value' type='number' step="any" min="0"/>
                    </div>
                </div>
        
                `
    }
    getClothesSizeHTML(){
        return `
                <div class="row" id='sub-category-selected-container'>
                    <div class='row col m12' id='size-selectors'>
                            <p style='display:inline-block'>
                                <input class="size-selection" type="checkbox" data-value="small" name="small" id="small-size" [value]="true">
                                <label for="small-size">Small</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="medium" data-value="medium"  id="medium-size" [value]="true">
                                <label for="medium-size">Medium</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="large" data-value="large"  id="large-size" [value]="true">
                                <label for="large-size">Large</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="XL" data-value="XL"  id="xl-size" [value]="true">
                                <label for="xl-size">XL</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="2XL" data-value="2XL" id="xxl-size" [value]="true">
                                <label for="xxl-size">2XL</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="3XL" id="xxxl-size" data-value="3XL" [value]="true">
                                <label for="xxxl-size">3XL</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="4XL" id="xxxxl-size" data-value="4XL" [value]="true">
                                <label for="xxxxl-size">4XL</label>
                            </p>
                            <p style='display:inline-block;margin-left:20px'>
                                <input class="size-selection" type="checkbox" name="dimension-size" id="dimension-size" data-value="dimension-size" [value]="true">
                                <label for="dimension-size">Dimensions</label>
                            </p>
                        </div>
                </div>
        `
    }
    getColorHTML(index,parentType){
        return `
                <div class='${parentType}-color-choices row col m12' id='${parentType}-color-choices-${index}'>
                    <div class='col m4'>
                        <label>Color:</label>
                        <input class='color-type clothes-inputs-${parentType}' id='${parentType}-${index}-clothes-color-value' type='text' data-size='${parentType}'/>
                    </div>
                    <div class='col m4'>
                        <label>Quantity:</label>
                        <input class='color-type clothes-inputs-${parentType}'  id='${parentType}-${index}-clothes-quantity-value' type='number' min="1"  data-size='${parentType}'/>
                    </div>
                    <div class='col m4'>
                        <label>Price: ($)</label>
                        <input class='color-type clothes-inputs-${parentType}' id='${parentType}-${index}-clothes-price-value' type='number' min="0" step="any" data-size='${parentType}'/>
                    </div>
                </div>
                `
    }
    watchDimensionsInputs(index){
        $(`.dimension-inputs-${index}`).on('keyup change',()=>{
            this.dimensionsOutput();
        })
    }
    watchDimensionColorAmount(parentIndex){
        let old_color_amount, ApparelFormComponent = this;
        $(`.color-dimensions-type-${parentIndex}`).on('change',function(){
            let times = parseInt($(this).val());
            old_color_amount = parseInt($(this).data('amount'))
            if(times != old_color_amount){
                let index = $(this).data('index');
                let size = $(this).data('size');
                if(old_color_amount > times){
                    for(let i = times; i < old_color_amount; i++){
                        $(`#${parentIndex}-color-choices-${i}`).remove();
                    }
                } else {
                    for(let i = old_color_amount;i < times;i++){
                        $(`#dimension-size-choices-${index}`).append(ApparelFormComponent.dimensionsExtendedHTML(i,parentIndex));
                    }
                }
                if(size) ApparelFormComponent.removeDimensionsJSONObjectProperty(size);
                ApparelFormComponent.dimensionsOutput();
                ApparelFormComponent.watchDimensionsInputs(index);
            }
            $(this).data('amount',times)
        })
    } 
    watchNoVariationDimensionsInputs(){
        $('.no-variations-sizes-inputs-dimensions').on('keyup change',()=>{
            this.noVariationDimensionsOutput();
        });
    } 
    watchNoVariationInputs(){
        $('.no-variations-sizes-inputs').on('keyup change',()=>{
            
            this.noVariationOutput();
        });
        $('#no-variations-color').on('keyup change',()=>{
            this.noVariationColor = $('#no-variations-color').val()
            if(this.noVariationSize && this.noVariationQuantity){
                this.JSONObject = {}
                this.noVariationOutput();
            }
        });
        $('#no-variations-size').on('keyup change',()=>{
            this.noVariationSize = $('#no-variations-color').val()
            if(this.noVariationColor && this.noVariationQuantity){
                this.JSONObject = {}
                this.noVariationOutput();
            }
        });
        $('#no-variations-quantity').on('keyup change',()=>{
            this.noVariationQuantity = $('#no-variations-color').val()
            if(this.noVariationSize && this.noVariationQuantity){
                this.JSONObject = {}
                this.noVariationOutput();
            }
        });
    }
    watchShoeSizeCount(){
        let old_size_count = 0; 
        let ApparelFormComponent = this;

        $('#shoe-size-count').on('change', function(){
            let times = parseInt($(this).val())
            ApparelFormComponent.shoesSizesAmount = times + 1;
            old_size_count = parseInt($(this).data('amount'));
            if(old_size_count > times){
                for(let i = times; i < old_size_count; i++){
                     $(`#shoe-choices-${i}`).remove();
                }
            } else {
                for(let i=old_size_count; i < times; i++){
                    
                    
                    $('#shoe-sizes-count-choice').append(ApparelFormComponent.getShoeChoicesHTML(i));
                    $(`#shoe-choices-${i ? i : 0}`).append(ApparelFormComponent.getShoeColorHTML(0,i))
                    ApparelFormComponent.watchShoeColorChange(i);
                } 
            }
            ApparelFormComponent.watchShoeColorInputValues();
            $(this).data('amount',times)
        })
    }
    watchShoeColorChange(parentIndex){
        let old_color_count, ApparelFormComponent = this;
        $(`.shoe-sizes-select-${parentIndex}`).on('change', function(){
             ApparelFormComponent.JSONObject = {};
             ApparelFormComponent.shoeOutput();
        })
        $(`.shoe-color-type-${parentIndex}`).on('change',function(){
            let times = parseInt($(this).val())
            old_color_count = parseInt($(this).data('amount'))
            if(old_color_count != times){
                ApparelFormComponent.shoesColorAmount = times + 1;
                let index = $(this).data('index')
                
                if(old_color_count > times){
                    for(let i = times; i < old_color_count; i++){
                        $(`#${parentIndex}-shoe-color-choices-${i}`).remove();
                    }
                } else {
                    for(let i = old_color_count;i < times;i++){
                        $(`#shoe-choices-${index}`).append(ApparelFormComponent.getShoeColorHTML(i,parentIndex))
                    }
                }
                ApparelFormComponent.shoeOutput();
                ApparelFormComponent.watchShoeColorInputValues();
            }
            $(this).data('amount',times)
        });
    }
    watchShoeColorInputValues(){
        $(`.shoe-inputs`).unbind();
        $(`.shoe-inputs`).on('keyup change',()=>{
            this.shoeOutput();
        });
    }
    watchClothesColorInputValues(type){
        let ApparelFormComponent = this;
        $(`.clothes-inputs-${type}`).on('keyup change',function(){
            let size = $(this).data('size')
            ApparelFormComponent.clothesOutput(size);
        })
    }
    watchColorAmount(parentType){
        /* THIS CAUSES A LOT OF DOM TRAVERSAL. DEFINITELY SHOULD BE IMPROVED ON.*/
        let old_color_count, ApparelFormComponent = this;
        old_color_count = 0;
        $(`.${parentType}-color-amount`).on('change',function(){
            let times = parseInt($(this).val())
            old_color_count = $(this).data('amount');
            if(times != old_color_count){
                let type = $(this).data('type');
                old_color_count = $(this).data('amount')
                ApparelFormComponent.removeJSONObjectProperty(type);
                ApparelFormComponent.clothesColorAmount = times + 1;
                if(old_color_count > times){
                    for(let i = times; i < old_color_count; i++){
                    $(`#${type}-color-choices-${i}`).remove();
                    } 
                } else {
                    for(let i = old_color_count;i < times;i++){
                        $(`#${type}-colors-inputs`).append(ApparelFormComponent.getColorHTML(i,parentType))
                    }
                }
                ApparelFormComponent.shoeOutput();
                ApparelFormComponent.watchClothesColorInputValues(type);
            }
            $(this).data('amount',times)
        });
    }
    watchDimensionsCount(){
        let old_times_count, ApparelFormComponent = this;
        old_times_count = 0;
        $('.dimensions-count').on('change', function(){
            let times = parseInt($(this).val())
            old_times_count = parseInt($(this).data('amount'))
            if(times != old_times_count){
                ApparelFormComponent.dimensionsJsonObject = {};
                if(old_times_count > times){
                    for(let i = times; i < old_times_count; i++){
                        $(`#dimension-size-choices-${i}`).remove();
                    }
                } else {
                    for(let i = old_times_count;i < times;i++){
                        $(`#dimension-count-choice`).append(ApparelFormComponent.dimensionsHTML(i))
                        $(`#dimension-size-choices-${i}`).append(ApparelFormComponent.dimensionsExtendedHTML(0,i))
                        ApparelFormComponent.watchDimensionColorAmount(i);
                    }
                }
            }
            $(this).data('amount',times);
        });
    }
    watchSizeSelections(){
        let ApparelFormComponent = this;
        let x = 0;
        $('.size-selection').click(function(){
            let data = $(this).data('value');
            // 
            x += 1; //for some reason, a click is being activated three times when the checkbox is clicked. So, this is me being lazy and just throwing setTimeout on x to prevent this.
            if(x === 1){
                switch(data){
                    case 'small':
                        // 
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.smallSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('small'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#small-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'small')); // this is done to add an initial 'getColorHTML' as the default select value is 1.
                            ApparelFormComponent.smallSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('small'); 
                            ApparelFormComponent.watchClothesColorInputValues('small');
                            ApparelFormComponent.clothesSizesAmount -=1;
                        } else {
                            $(`#small-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('small')
                            ApparelFormComponent.smallSizeOptionSelected = false;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case 'medium':
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.mediumSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('medium'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#medium-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'medium'));
                            ApparelFormComponent.mediumSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('medium');  
                            ApparelFormComponent.watchClothesColorInputValues('medium');
                            ApparelFormComponent.clothesSizesAmount +=1;
                        } else {
                            $(`#medium-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('medium')
                            ApparelFormComponent.mediumSizeOptionSelected = false;
                            ApparelFormComponent.clothesSizesAmount -=1;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case 'large':
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.largeSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('large'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#large-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'large'));
                            ApparelFormComponent.largeSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('large'); 
                            ApparelFormComponent.watchClothesColorInputValues('large');
                            ApparelFormComponent.clothesSizesAmount +=1;
                        } else {
                            $(`#large-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('large')
                            ApparelFormComponent.largeSizeOptionSelected = false;
                            ApparelFormComponent.clothesSizesAmount -=1;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case 'XL':
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.xlSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('xl'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#xl-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'xl'));
                            ApparelFormComponent.xlSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('xl'); 
                            ApparelFormComponent.watchClothesColorInputValues('xl');
                            ApparelFormComponent.clothesSizesAmount +=1;
                        } else {
                            $(`#xl-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('xl')
                            ApparelFormComponent.xlSizeOptionSelected = false;
                            ApparelFormComponent.clothesSizesAmount -=1;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case '2XL':
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.xxlSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('xxl'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#xxl-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'xxl'));
                            ApparelFormComponent.xxlSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('xxl'); 
                            ApparelFormComponent.watchClothesColorInputValues('xxl');
                            ApparelFormComponent.clothesSizesAmount +=1;
                        } else {
                            $(`#xxl-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('xxl')
                            ApparelFormComponent.xxlSizeOptionSelected = false;
                            ApparelFormComponent.clothesSizesAmount -=1;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case '3XL':
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.xxxlSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('xxxl'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#xxxl-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'xxxl'));
                            ApparelFormComponent.xxxlSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('xxxl'); 
                            ApparelFormComponent.watchClothesColorInputValues('xxxl');
                            ApparelFormComponent.clothesSizesAmount +=1;
                        } else {
                            $(`#xxxl-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('xxxl')
                            ApparelFormComponent.xxxlSizeOptionSelected = false;
                            ApparelFormComponent.clothesSizesAmount -=1;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case '4XL':
                        if($(this).is(":checked")){
                            if(!ApparelFormComponent.xxxxlSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.getClothesHTML('xxxxl'));
                            if(ApparelFormComponent.sameSizeOptionSelected === true){ $(`#dimension-count-choice`).remove(); $('#dimension-size').prop('checked', false); ApparelFormComponent.sameSizeOptionSelected = false;}
                            $(`#xxxxl-colors-inputs`).append(ApparelFormComponent.getColorHTML(0, 'xxxxl'));
                            ApparelFormComponent.xxxxlSizeOptionSelected = true;
                            ApparelFormComponent.watchColorAmount('xxxxl'); 
                            ApparelFormComponent.watchClothesColorInputValues('xxxxl');
                            ApparelFormComponent.clothesSizesAmount +=1;
                        } else {
                            $(`#xxxxl-sizing-choices`).remove();
                            ApparelFormComponent.removeJSONObjectProperty('xxxxl')
                            ApparelFormComponent.xxxxlSizeOptionSelected = false;
                            ApparelFormComponent.clothesSizesAmount -=1;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                    case 'dimension-size':
                        if($(this).is(":checked")){
                            // if(!ApparelFormComponent.sameSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.sameSizeHTML());
                            if(!ApparelFormComponent.sameSizeOptionSelected) $('#sub-category-selected-container').append(ApparelFormComponent.howManyDimensionsHTML());
                            $(`#dimension-count-choice`).append(ApparelFormComponent.dimensionsHTML(0))
                            $(`#dimension-size-choices-0`).append(ApparelFormComponent.dimensionsExtendedHTML(0,0))
                            ApparelFormComponent.watchDimensionsCount();
                            ApparelFormComponent.watchDimensionColorAmount(0); 
                            ApparelFormComponent.watchDimensionsInputs(0);
                            //may just want to give each of them a class and remove and uncheck them.
                            if(ApparelFormComponent.smallSizeOptionSelected === true){ $(`#small-sizing-choices`).remove(); $('#small-size').prop('checked', false); ApparelFormComponent.smallSizeOptionSelected = false;}
                            if(ApparelFormComponent.mediumSizeOptionSelected === true){ $(`#medium-sizing-choices`).remove(); $('#medium-size').prop('checked', false); ApparelFormComponent.mediumSizeOptionSelected = false;}
                            if(ApparelFormComponent.largeSizeOptionSelected === true){ $(`#large-sizing-choices`).remove(); $('#large-size').prop('checked', false); ApparelFormComponent.largeSizeOptionSelected = false;}
                            if(ApparelFormComponent.xlSizeOptionSelected === true){ $(`#xl-sizing-choices`).remove(); $('#xl-size').prop('checked', false); ApparelFormComponent.xlSizeOptionSelected = false;}
                            if(ApparelFormComponent.xxlSizeOptionSelected === true){ $(`#xxl-sizing-choices`).remove(); $('#xxl-size').prop('checked', false); ApparelFormComponent.xxlSizeOptionSelected = false;}
                            if(ApparelFormComponent.xxxlSizeOptionSelected === true){ $(`#xxxl-sizing-choices`).remove(); $('#xxxl-size').prop('checked', false); ApparelFormComponent.xxxlSizeOptionSelected = false;}
                            if(ApparelFormComponent.xxxxlSizeOptionSelected === true){ $(`#xxxxl-sizing-choices`).remove();  $('#xxxxl-size').prop('checked', false); ApparelFormComponent.xxxxlSizeOptionSelected = false;}
                            ApparelFormComponent.sameSizeOptionSelected = true;
                            // ApparelFormComponent.watchColorAmount(); 
                        } else {
                            $(`#dimension-count-choice`).remove();
                            ApparelFormComponent.sameSizeOptionSelected = false;
                        }
                        setTimeout(()=>{
                            x = 0;
                        },5)
                    break;
                }
            }
        })
    }
    subCategorySelected(value){
        //Change everything to shoe sizes
        $('.has-variations').prop('disabled',false);
        $('#has-variations-text').removeClass('disabled-text');
        // 
        if(value == 'shoes'){
            this.sizes = this.shoeSizes;
            this.sizeValues = this.shoeSizes;

        //change everything to dimensions
        } else if (value == 'Backpacks') {
        
        //change everything to clothing sizes.
        } else {

        }
    }
    removeDimensionsJSONObjectProperty(size){
        if(this.dimensionsJsonObject[`${size}`]) delete this.dimensionsJsonObject[`${size}`]
        if(this.dimensionsJsonObject[`${size}_height`]) delete this.dimensionsJsonObject[`${size}_height`]
        if(this.dimensionsJsonObject[`${size}_width`]) delete this.dimensionsJsonObject[`${size}_width`]
        if(this.dimensionsJsonObject[`${size}_depth`]) delete this.dimensionsJsonObject[`${size}_depth`]
        if(this.dimensionsJsonObject[`${size}_values`]) delete this.dimensionsJsonObject[`${size}_values`]
        if(this.dimensionsJsonObject[`${size}_price`]) delete this.dimensionsJsonObject[`${size}_price`]
        if(this.dimensionsJsonObject[`${size}_total`]) delete this.dimensionsJsonObject[`${size}_total`]
        if(this.dimensionsJsonObject[`${size}_colors`]) delete this.dimensionsJsonObject[`${size}_colors`]
    }
    // The removeJSONOobjectProperty and createJsonObject can definitely be combined.
    removeJSONObjectProperty(size){

        if(size && this.JSONObject[`${size}`]) delete this.JSONObject[`${size}`]
        if(size && this.JSONObject[`${size}_values`]) delete this.JSONObject[`${size}_values`]
        if(size && this.JSONObject[`${size}_total`]) delete this.JSONObject[`${size}_total`]
        if(size && this.JSONObject[`${size}_colors`]) delete this.JSONObject[`${size}_colors`]
        if(size && this.JSONObject[`${size}_price`]){ 
            let index= this.totalPrices.indexOf(parseFloat(this.JSONObject[`${size}_price`])); 
            
            
            if(index > -1){
                
                this.totalPrices.splice(index, 1);
                
                this.lowestPrice = Math.min.apply(null, this.totalPrices);
                this.maxPrice = Math.max.apply(null, this.totalPrices);
                this.uploadApparel.patchValue({min_price:this.lowestPrice});
                this.uploadApparel.patchValue({max_price: this.maxPrice})
            };
             
        }
        if(size && this.JSONObject[`${size}_price`]) delete this.JSONObject[`${size}_price`]

    }
    // The removeJSONOobjectProperty and createJsonObject can definitely be combined.
    createJsonObject(size,type,value){
        
        
        
        size = size.toString().toLowerCase();
        // An example of what the object will/should look like. 
        //
        // let JsonObject = {
        //     small:{
        //         red:{
        //             quantity:1,
        //             price:5.00
        //         },
        //         green:{
        //             quantity:2, 
        //             price:10.00
        //         },
        //         blue:{
        //             quantity:7,
        //             price:19.00
        //         }
        //     },
        //     medium:{
        //          red:{
        //             quantity:1,
        //             price:5.00
        //         },
        //         green:{
        //             quantity:2, 
        //             price:10.00
        //         },
        //         blue:{
        //             quantity:7,
        //             price:19.00
        //         }
        //     },
        //     large:{
        //         red:{
        //             quantity:1,
        //             price:5.00
        //         },
        //         green:{
        //             quantity:2, 
        //             price:10.00
        //         },
        //         blue:{
        //             quantity:7,
        //             price:19.00
        //         }
        //     },
        //     meta:{
        //         sizes:['small','medium','large'],
                
        //     }
        // }
        if(size) this.JSONObject[`${size}`] = {};
        if(type === 'values' && size){
            if (value.length){
                if(value[0].constructor === Array){
                    for(let i = 0; i < value.length; i++){
                        if(value[i].length){
                            this.JSONObject[`${size}`][value[i][0]] = {
                                quantity:value[i][1],
                                price:value[i][2]
                            }
                        }
                    }
                } else {
                    this.JSONObject[`${size}`][value[0]] = {
                        quantity:value[1],
                        price: value[2]
                    }
                }
            }
        }
        // if(type === 'values' && size) this.JSONObject[`${size}_values`] = value;
        // else if(type === 'total' && size) this.JSONObject[`${size}_total`] = value;
        // else if (type === 'colors' && size)this.JSONObject[`${size}_colors`] = value;
        // else if (type === 'price' && size) this.JSONObject[`${size}_price`] = value; 
        // 

    }
    // The removeJSONOobjectProperty and createJsonObject can definitely be combined.
    addImage(src,count,total,index,name){
        return `
                <div class='col m4 apparel-form-photo-containers' style='padding:4px' id='apparel-form-photo-container-${name}' data-count='${count}' data-total='${total}' data-name='${name}' data-index='${index}' data-id='0'>
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
                            <img src='${src}' alt='image' width='100%' id='apparel-form-photo-${total}' data-index='${index}'/>
                        </div>
                    </div>
                </div>
                
                `
    }
    loopPhoto(total,fileSelector,count=0){
        if(count < total){
            let file = fileSelector[0].files[count];
            let name = `${file.name.replace(/[^\w]/gi, '-')}-${file.lastModified}-${file.size}`
            if(!$(`#apparel-form-photo-container-${name}`).length){
                this.imageCount += 1;
                
                this.imageFile = file;
                if (FileReader && file) {
                    let fr = new FileReader();
                    fr.onload = ()=> {
                        this.totalImageCount += 1; // this needs to stay be here or it will just add all of I at once - and not increment.
                        $('#photos-apparel-form').append(this.addImage(fr.result,this.imageCount,this.totalImageCount,count,`${file.name.replace(/[^\w]/gi, '-')}-${file.lastModified}-${file.size}`));
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
                    // $( "#photos-apparel-form" ).disableSelection();
                },200)
        }
        setTimeout(()=>{ this.watchPhotoDelete() },200)
    }
    photoChange(){
      $(`#photo-upload`).click(()=>{
        if(!this.photoClicked){
            this.photoClicked = true;
            this.photoUpload();    
            var fileSelector = $("#photo-upload").on('change',()=>{
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
        url: `${this._backend.SERVER_URL}/api/v1/photos/create`,
        formData: {'authorization': `Bearer ${self._auth.getToken()}`, 'photo_upload':1, 'id':self.id},
        dataType: 'json',
        sequentialUploads: true,
        add: function (e, data) {
            // data.context = $('<p/>').text('Uploading...').appendTo(document.body);
            //test
            let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
            if(!$(`#apparel-form-photo-container-${name}`).length) data.submit();
            else Materialize.toast("Image has already been added", 3500, 'rounded-info');
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
                
                let length = data.result.photos.length - 1;
                let id = data.result.photos[length].uuid;
                self.photoIds.push(id);
                $(`#apparel-form-photo-container-${name}`).attr('data-id',id.toString());
                $(`#delete-photo-${name}`).attr('data-id',id.toString()).css({'display':'block'});
                $('#photos-apparel-form').sortable({
                    stop : (event,ui) => { 
                        self.sorted = true;
                        self.sortedIds = $("#photos-apparel-form").sortable('toArray', { attribute: 'data-id' })
                        console.log(self.sortedIds);
                     }
                });
                
                
            }
        }
      });    
    }
    deleteApparel(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        var creds = {"id": this.id, "upload":true}
        this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/apparel/delete`, creds, {headers: headers}).subscribe(data => {
             this.apparelDelete=true;
             if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
        });
    }
    watchPhotoDelete(){
        // if(this.watchingDelete) $(`.delete-photo`).unbind('click');
        $(`.delete-photo`).unbind('click');
        this.watchingDelete = true;
        let ApparelFormComponent = this;
        $(`.delete-photo`).on('click', function(){
            console.log('clicked')
            console.log($(this).data('id'));
            let index = ApparelFormComponent.photoIds.indexOf($(this).data('id'));
            console.log(index);
            let totalId = $(this).data('total');
            
            let id = ApparelFormComponent.photoIds[parseInt(index)];
            
            let name = $(this).data('name');
            
            ApparelFormComponent.deletePhoto(id,index,totalId,name);
        });
    }
    deletePhoto(id,index,totalId,name){
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        var creds = {"photo": id, "product":this.id}
        this.deletePhotoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/photos/delete`, creds, {headers: headers}).subscribe(data => {
            if(data.json().success){
                $(`#apparel-form-photo-container-${name}`).remove();
                console.log(this.photoIds);
                this.photoIds.splice(index,1);
                console.log(this.photoIds);
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
        this._router.navigateByUrl('/apparel');
    }
    submitApparel(values){
        this.insubmit = true;
        let fadein = setTimeout(()=>{
            $(`#submit-apparel`).fadeIn().css("display","inline-block");
        },750)
        var headers = new Headers();
        let object;
        let form;
        if(this.sameSizeOptionSelected || (this.mainCategory === 'accessories' && !this.sizeChoicesOpen)){
            object = this.dimensionsJsonObject;
            form = 1;
        } else {
            object = this.JSONObject;
            form = 0;
        }
        if(!this.sorted){
            let self = this;
           $(".apparel-form-photo-containers").each(function(){self.sortedIds.push($(this).data('id'))})
           this.sorted = true;
        }
        let markedBody = values.description ? marked(values.description) : null;
        let creds = {"id":this.id, "title": values.title, "creator": values.creator, "main_category": this.mainCategory, "sub_category": this.subCategory, 'color': this.color, "size":this.size, "quantity":this.quantity, "height":this.height, "width":this.width, "depth": this.depth, "form": form, 'description':values.description, "marked":markedBody,'properties':object, 'zip':values.zip, 'has_site':values.has_site, 'link':values.link, 'condition':values.condition, 'shipping':values.shipping, 'shipping_type': values.shipping_type, 'max_price': values.max_price, 'turnaround_time':values.turnaround_time, 'returns':values.returns, 'has_variations':values.has_variations, 'min_price': values.min_price, sorted: this.sorted, sorted_ids:this.sortedIds} 
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.submitSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/apparel/update`, creds, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
                if(data.json().success){
                    this.submitted = true;
                    if(!this._auth.check('_waydope_seller')) this._auth.setCookie('_waydope_seller', 'randomstring', 3);
                    this._sysMessages.setMessages('submittedApparel');
                    this._router.navigateByUrl(`/apparel/${this.mainCategory}/${this.subCategory}/${data.json().url}`);
                } else if (data.json().error) {
                    // this.unsupported = true;
                } else if(data.json().status === 401){
                this._modal.setModal('apparel','form');
            } else {
            // this.error = true;
            }
            if(fadein) clearTimeout(fadein);
            $("#submit-apparel").css({'display':'none'});
            $('.waves-ripple').remove();
            this.insubmit = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-apparel`).css({'display':'none'});
        },15000);
    }
    // noVariationDimensionsOutput(){
    //     this.width = parseInt($('#no-variations-dimensions-width').val())
    //     this.height = parseInt($('#no-variations-dimensions-height').val())
    //     this.depth = parseInt($('#no-variations-dimensions-depth').val())
    //     this.quantity = parseInt($('#no-variations-dimensions-quantity').val())
    //     this.price = $('#price').val();
    //     this.color = $('#no-variations-dimensions-color').val()
    // }
    // noVariationOutput(){
    //     this.color = $('#no-variations-color').val()
    //     this.size = $('#no-variations-size').val()
    //     this.quantity = $('#no-variations-quantity').val()
    //     this.price = $('#price').val();
    // }
    noVariationDimensionsOutput(){
        let width = parseFloat($('#no-variations-dimensions-width').val())
        let height = parseFloat($('#no-variations-dimensions-height').val())
        let depth = parseFloat($('#no-variations-dimensions-depth').val())
        let quantity = parseInt($('#no-variations-dimensions-quantity').val())
        let price = parseFloat($('#no-variations-dimensions-price').val());
        let color = $('#no-variations-dimensions-color').val()
        if(width && height && depth && (quantity || quantity === 0) && price && color){
            this.dimensionsJsonObject["default"] = {}
            this.dimensionsJsonObject["default"]["height"] = height
            this.dimensionsJsonObject["default"]["width"] = width
            this.dimensionsJsonObject["default"]["depth"] = depth
            this.dimensionsJsonObject["default"][color]={}
            this.dimensionsJsonObject["default"][color]["quantity"] = quantity
            this.dimensionsJsonObject["default"][color]["price"]= price
        }
        
        
    }
    dimensionsOutput(){
        let times = parseInt($('.dimensions-count').val())
        
        
        let output = [];
        let totalSizes = [];
        this.totalPrices = [];
        let positions = [];
        for(let a = 0; a < times; a++){
            let width = parseFloat($(`#dimensions-width-${a}`).val())
            let height = parseFloat($(`#dimensions-height-${a}`).val())
            let depth = parseFloat($(`#dimensions-depth-${a}`).val())
            let total = width + height + depth;
            let quantity = 0; //basically the total size for the object.
            let color_amount = $(`.color-dimensions-type-${a}`).val();
            let colors = [];
            let jsonOutput = [];
            let prices = [];
            // if(width && height && depth && )
            for(let b =0; b < color_amount; b++){
                
                
                let colorData = $(`#dimensions-input-color-${a}-${b}`).val();
                let quantityData = parseInt($(`#dimensions-input-quantity-${a}-${b}`).val());
                let priceData = parseFloat($(`#dimensions-input-price-${a}-${b}`).val())
                
                
                
                
                if(priceData) prices.push(priceData);
                if(colors) colors.push(colorData)
                if(colorData && (quantityData || quantityData === 0) && priceData) jsonOutput.push([colorData,quantityData,priceData])
                if(quantityData) quantity += 1;
            }
            if(jsonOutput.length) output.push([width,height,depth,colors,jsonOutput,prices,quantity,a])
            if(total) totalSizes.push(total);
            if(total) positions.push(total);

            if(Math.min.apply(null, prices)) this.totalPrices.push(Math.min.apply(null, prices));
            if(Math.max.apply(null,prices)) this.totalPrices.push(Math.max.apply(null,prices));
            this.lowestPrice = Math.min.apply(null, this.totalPrices);
            this.maxPrice = Math.max.apply(null, this.totalPrices)

            
            if(this.lowestPrice)this.uploadApparel.patchValue({min_price:this.lowestPrice});
            if(this.maxPrice)this.uploadApparel.patchValue({max_price:this.maxPrice});
                    
            

        }
        
        
        
        
        //basically what is happening is, the width depth and height are being added together to create a general 'size.' This size is then placed in totalSizes and positions.
        //Totalsizes gets sorted from lowest to highest. We then loop through totalSizes and use indexOf to find the position of the totalSizes current size in the output array.
        
        
        totalSizes.sort(function(a,b) { return a - b; });
        
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
            let index = positions.indexOf(totalSizes[i]) //get the index of where the 'size' is in the output.
            if(output && output.length){
                if(nameSize) this.dimensionsJsonObject[`${nameSize}`] = {};
                if(nameSize && output[index] && output[index][4]) {
                    this.dimensionsJsonObject[`${nameSize}`]={
                        height:output[index][0],
                        width:output[index][1],
                        depth:output[index][2]
                    }
                    for(let i = 0;i < output[index][4].length; i++){
                        if(output[index][4][i].length){
                            this.dimensionsJsonObject[`${nameSize}`][output[index][4][i][0]]={
                                quantity:output[index][4][i][1],
                                price:output[index][4][i][2]
                            }
                        }
                    }
                }
            }
            
            
            // if(nameSize && output && output[index] && output[index][0]) this.dimensionsJsonObject[`${nameSize}_height`] = output[index][0]
            // if(nameSize && output && output[index] && output[index][1]) this.dimensionsJsonObject[`${nameSize}_width`] = output[index][1]
            // if(nameSize && output && output[index] && output[index][2]) this.dimensionsJsonObject[`${nameSize}_depth`] = output[index][2]
            // if(nameSize && output && output[index] && output[index][4]) this.dimensionsJsonObject[`${nameSize}_values`] = output[index][4]
            // if(nameSize && output && output[index] && output[index][3]) this.dimensionsJsonObject[`${nameSize}_colors`] = output[index][3]
            // if(nameSize && output && output[index] && output[index][5]) this.dimensionsJsonObject[`${nameSize}_price`] = output[index][5]
            // if(nameSize && output && output[index] && output[index][5]) this.dimensionsJsonObject[`${nameSize}_total`] = output[index][6]
            $(`.color-dimensions-type-${output[index[7]]}`).data('size',nameSize);
        }
        
        
    }
    noVariationOutput(){
        let color = $('#no-variations-color').val()
        let size = $('#no-variations-size').val()
        let quantity = parseInt($('#no-variations-quantity').val())
        let price = parseFloat($('#no-variations-price').val());
        if(color && size && quantity && price){
            // this.createJsonObject(size,'total',1)
            this.createJsonObject(size,'values',[color,quantity,price])
        }
        
        
    }
    clothesOutput(size){
        let color_amount = parseInt($(`.${size}-color-amount`).val());
        let output = [size,color_amount];
        
        $('#appended-output').remove();
        $(`#output`).append(this.outputHTMLShoesFirst(output));
        let jsonOutput = []
        let colors = [];
        let prices = [];
        this.totalPrices = [];
        setTimeout(()=>{
            for(let b = 0; b < color_amount; b++){
                let outputIndex = b + 1; //to componensate for the total value at the beginning of the array.
                // $('#shoes-options-output').append(this.outputHTMLShoesSecond(output[outputIndex],b));
                
                let colorData = $(`#${size}-${b}-clothes-color-value`).val();
                let quantityData = parseInt($(`#${size}-${b}-clothes-quantity-value`).val());
                let priceData = parseFloat($(`#${size}-${b}-clothes-price-value`).val())
                colors.push(colorData)
                if(priceData) prices.push(priceData);
                if(colorData && (quantityData || quantityData === 0) && priceData) jsonOutput.push([colorData,quantityData,priceData])
              
                
                
            }
                        // $(`#shoe-output-options-${b}`).append(this.outputHTMLShoesThird(data,b,a))
            // this.createJsonObject(size,'colors',colors);
            if(jsonOutput.length) this.createJsonObject(size,'values',jsonOutput);
            // if(Math.min.apply(null, prices)) this.createJsonObject(size,'price', Math.min.apply(null, prices)); //get the lowest number in the prices array and set it.
            if(Math.min.apply(null, prices)) this.totalPrices.push(Math.min.apply(null, prices));
            if(Math.max.apply(null,prices)) this.totalPrices.push(Math.max.apply(null,prices));
            this.lowestPrice = Math.min.apply(null, this.totalPrices);
            this.maxPrice = Math.max.apply(null, this.totalPrices)
            
            
            
            
            if(this.lowestPrice)this.uploadApparel.patchValue({min_price:this.lowestPrice}); 
            if(this.maxPrice)this.uploadApparel.patchValue({max_price:this.maxPrice});

        },150)
        
        
        
    }  
    shoeOutput(){
        let output = [];
        let times = 0;
        this.totalPrices=[];
        for(let i = 0; i < this.shoesSizesAmount; i++){
            // let currentOutput = []

            let shoe_size =  $(`.shoe-sizes-select-${i}`).val();
            let shoe_color_count = $(`.shoe-color-type-${i}`).val();
            this.JSONObject.sizes = shoe_size;
            let currentOutput = [shoe_size,shoe_color_count]
            output.push(currentOutput);
            times = i;
        }
        output.unshift(times);
        // 
        $('#appended-output').remove();
        $(`#output`).append(this.outputHTMLShoesFirst(output));
        setTimeout(()=>{
            for(let b = 0; b < times; b++){
                let outputIndex = b + 1; //to componensate for the total value at the beginning of the array.
                let jsonOutput = []
                let colors = [];
                let prices = [];
                $('#shoes-options-output').append(this.outputHTMLShoesSecond(output[outputIndex],b));
                setTimeout(()=>{
                    let times = $(`.shoe-color-type-${b}`).val()
                    for(let a = 0; a < times; a++){
                        let colorData = $(`#${b}-${a}-shoe-color-value`).val();
                        let quantityData = parseInt($(`#${b}-${a}-shoe-quantity-value`).val());
                        let priceData = parseFloat($(`#${b}-${a}-shoe-price-value`).val())
                        colors.push(colorData)
                        if(priceData) prices.push(priceData);
                        if(colorData && (quantityData || quantityData === 0) && priceData) jsonOutput.push([colorData,quantityData,priceData])
                        // this.createJsonObject(output[outputIndex][0],'total',times);
                    }
                    // this.createJsonObject(output[outputIndex][0],'colors',colors);
                    if(jsonOutput.length) this.createJsonObject(output[outputIndex][0],'values',jsonOutput);
                    if(Math.min.apply(null, prices)) this.totalPrices.push(Math.min.apply(null, prices));
                    if(Math.max.apply(null,prices)) this.totalPrices.push(Math.max.apply(null,prices));
                    this.lowestPrice = Math.min.apply(null, this.totalPrices);
                    this.maxPrice = Math.max.apply(null, this.totalPrices)

                    if(this.lowestPrice)this.uploadApparel.patchValue({min_price:this.lowestPrice}); 
                    if(this.maxPrice)this.uploadApparel.patchValue({max_price:this.maxPrice});
                },100)
            }
        },150)
        
        
        
    }  
    //basically this just creates the total shoe sizes and has a div so that the outputHTMLShoesSecond can append to it.
    outputHTMLShoesFirst(output){
        return `
                <div id='appended-output'>
                    <span>Total shoe sizes: ${output[0]}</span>
                    <hr>
                    <div id='shoes-options-output'></div>
                </div>
                `
    }
    outputHTMLShoesSecond(output,i){
        return  `
                <div id='shoe-output-options-${i}'>  
                    <span>Shoe Size: ${output[0]},</span>
                    <span>With ${output[1]} ${output[1] > 1 ? 'different colors' : 'color'}:</span>
                    <div id='third-output-append-${i}>
                    </div>
                </div>
                `
    }
    outputHTMLShoesThird(data,parentIndex, index){
        return  `
                <span class='inner-values'><span class='capitalize'>${data[1]}</span> ${data[0]} with a price of $${data[2]}.</span>
                `
    }
    //basically this just creates the total shoe sizes and has a div so that the outputHTMLShoesSecond can append to it.
    ngOnDestroy(){
        if(this.id && !this.apparelDelete && !this.submitted) this.deleteApparel();
        if(this.submitSubscription) this.submitSubscription.unsubscribe();
        if(this.initiateSubscription) this.initiateSubscription.unsubscribe();
        if(this.deletePhotoSubscription) this.deletePhotoSubscription.unsubscribe();
    }
}
