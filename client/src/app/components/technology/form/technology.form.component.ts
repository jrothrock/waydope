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
import {ModalUpdateComponent} from '../../modal/update/modal.update.component';
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
var miscellaneousList = [
    {
        text: 'Other',
        value: 'other'
    }
]


@Component({
  selector: 'technology_form',
  templateUrl: 'technology.form.component.html',
  providers: [FormBuilder,AuthService,ModalComponent,ModalUpdateComponent,SystemMessagesComponent]
})

export class TechnologyFormComponent implements OnInit {
    initiateSubscription:any;
    submitSubscription:any;
    deleteSubscription:any;
    deletePhotoSubscription:any;
    uploadTechnology: FormGroup;
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
    sorted:any=false;
    sortedIds:any=[];

    insubmit:boolean=false;
    maxPrice:number;

    noVartiaions:boolean=false;
    dimensionsWatching:boolean=false;
    noDimensionsWatching:boolean=false;
    Object:any=Object;

    hasSizes:boolean=false;
    hasColors:boolean=false;
    hasDimensions:boolean=false;
    hasSizesSelected:boolean=false;
    hasColorsSelected:boolean=false;
    hasDimensionsSelected:boolean=false;
    constructor(private _http: Http, private _auth: AuthService, private _backend: BackendService, private _fb: FormBuilder, private _mu: ModalUpdateComponent, private _router: Router, private _modal: ModalComponent, private _sysMessages:SystemMessagesComponent){};
	ngOnInit(){
        this.uploadTechnology = this._fb.group({
            'title': [null, Validators.required],
            'creator': [null, Validators.required],
            'max_price': [{value:null,disabled:true}],
            'min_price': [{value:null,disabled:true}],
            'price':[{value:null,disabled:true}],
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
        this.initiateTechnologyPost();
        this.selectizeInit();
        this.subSelectizeInit();
        this.watchRadios();
        this.watchHasSizes();
        this.watchHasColors();
        this.watchHasDimensions();
        this.photoChange();
        this.watchFormattingButton();
        this.watchDescription();
    };
    initiateTechnologyPost(){
        var headers = new Headers();
        let object;
        let form;
        if(this.sameSizeOptionSelected || (this.mainCategory === 'Accessories' && !this.sizeChoicesOpen)){
            object = this.dimensionsJsonObject;
            form = 1;
        } else {
            object = this.JSONObject;
            form = 0;
        }
        let creds = {};
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.initiateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/technology/new`, creds, {headers: headers}).subscribe(data => {
                if(data.json().success){
                    this.id = data.json().id;
                    // you may want to update this on the backend, to trim down that if statement
                    if(data.json().stage != 3){
                        this._mu.setBox('technology');
                    }
                } else if (data.json().error) {
                    // this.unsupported = true;
                } else if(data.json().status === 401){
                this._modal.setModal('technology','form');
            } else {
            // this.error = true;
            }
        });
    }
    selectizeInit(){
        let TechnologyFormComponent = this; 
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
    $('#link').prop('disabled','disabled');
        $('.has-site').click(function() {
            if($('#site-yes').is(':checked')) { $('#link').prop('disabled',false); }
            else if($('#site-no').is(':checked')) {$('#link').prop('disabled','disabled').val('').removeClass('valid'); $('#site-link').removeClass('active'); }
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
            this[`watch${this.hasSizes ? 'Yes' : 'No'}Sizes${this.hasColors? 'Yes' : 'No'}Colors${this.hasDimensions ? 'Yes' : 'No' }Dimensions`]()
    }

    /// ############### ///
    /// UPPER WATCHING ///
    /// ############### ///

    watchYesSizesYesColorsYesDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-yes-colors-yes-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            old_size_count = parseInt($(this).data('amount'));
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
            $(this).data('amount',times)
        })
    }
    watchYesSizesYesColorsNoDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-yes-colors-no-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            old_size_count = parseInt($(this).data('amount'));
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
            old_size_count = parseInt($(this).data('amount'));
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
            $(this).data('amount',times);
        })
    }
    watchYesSizesNoColorsNoDimensions(){
        let old_size_count = 0, TechnologyFormComponent = this;
        $(`.yes-sizes-no-colors-no-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            old_size_count = parseInt($(this).data('amount'));
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
            old_size_count = parseInt($(this).data('amount'))
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
        $(`.no-sizes-yes-colors-no-dimensions-inputs`).on('change',function(){
            let times = parseInt($(this).val())
            old_size_count = parseInt($(this).data('amount'));
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
        
        
        $(`.${type}-color-input, .${type}-size-input`).unbind();
        // this is probably fool proof, due to having to click between elements, but should be further investigated.
        $(`.${type}-color-input`).on('change',function(){
            
            let times = parseInt($(this).val())
            if(times > 25){
                $(this).val(25)
                times = 25;
            }
            let old_color_amount = parseInt($(this).data('amount'))
            let index = parseInt($(this).data('index'));
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
            $(this).data('amount',times)
        });
        $(`.${type}-size-input`).on('keyup', function(){
            if(!dimensions)TechnologyFormComponent.createJSONoutputExtended(type)
            else TechnologyFormComponent.createJSONoutputExtendedDimensions(type)
        })
    }

    watchColorsExtended(type,parentIndex=null,dimensions=false){
        $(`.${type}-color-choices-inputs${parentIndex != null ? `-` + parentIndex : ''}`).unbind().on('keyup',()=>{
            
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
                            <label>Size:</label>
                            <input class='${type}-input' id='${type}-size-${index}' type='text' data-index='${index}'/>
                        </div>
                        <div class='col m4'> 
                             <label>Quantity</label>
                            <input class='${type}-input' id='${type}-quantity-${index}' type='number' min="0"  data-index='${index}'/>
                        </div>
                        <div class='col m4'> 
                             <label>Price: ($)</label>
                            <input class='${type}-input' id='${type}-price-${index}' type='number' step="any" min="0" data-index='${index}'/>
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
                            <label>Size:</label>
                            <input class='${type}-size-input' id='${type}-size-${index}' type='text' data-index='${index}'/>
                        </div>
                        <div class='col m4'> 
                             <label>How many colors?</label>
                            <input class='${type}-color-input' id='${type}-color-amount-${index}' type='number' min="1" max="25" data-index='${index}' value='0' data-amount='0'/>
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
                            <label style='white-space:nowrap'>Size:</label>
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
                        <input class='${type}-color-input' id='${type}-color-amount-${index}' type='number' min='1' data-size='' data-index="${index}" value="0" data-amount='0'/>
                    </div>
                    <div class='col m9' style='border: 1px solid rgba(0,0,0,0.1)'>
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
    getColorsExtendedHTML(type,index,parentIndex=null){
        return `
                <div class='${type}-color-choices${parentIndex != null ? `-` + parentIndex : ''} row col m12' id='${type}-color-choices${parentIndex != null ? `-` + parentIndex : ''}-${index}'>
                    <div class='col m3 offset-m3'>
                        <label>Color:</label>
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
        $('.has-sizes').prop('disabled',false);
        $('#has-sizes-text').removeClass('disabled-text');
        if(value == 'shoes'){
            this.sizes = this.shoeSizes;
            this.sizeValues = this.shoeSizes;

        //change everything to dimensions
        } else if (value == 'Backpacks') {
        
        //change everything to clothing sizes.
        } else {

        }
    }
    // The removeJSONOobjectProperty and createJsonObject can definitely be combined.
    addImage(src,count,total,index,name){
        return `
                <div class='col m4 technology-form-photo-containers' style='padding:4px' id='technology-form-photo-container-${name}' data-count='${count}' data-total='${total}' data-name='${name}' data-index='${index}' data-id='0'>
                    <div class='progress-container' style='position: relative;top: 38px;left: -50px;'>
                        <div class='progress-bar' id="progress-${name}">
                            <div class='inner-progress-bar' id='inner-progress-${name}'></div>
                        </div>
                        <span class='progress-text-container'><span id='progress-text-${name}'>0</span>/100</span>
                    </div>
                    <div style='border:1px solid #ff8000;'>
                        <div>
                            <div class='delete-photo' id='delete-photo-${name}' style='float:right;padding-top:5px;cursor:pointer;display:none' data-index='${index}' data-total='${total}' data-name='${name}'>
                                <div class='notification-close-button-first' style='background-color:black'></div>
                                <div class='notification-close-button-second' style='background-color:black'></div>
                            </div>
                        </div>
                        <div style='border-top:1px solid #ff8000;margin-top:30px;margin-bottom: -6px;'>
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
                    this.imageFile = file;
                    this.imageCount += 1;
                    if (FileReader && file) {
                        let fr = new FileReader();
                        fr.onload = ()=> {
                            this.totalImageCount += 1; // this needs to stay be here or it will just add all of I at once - and not increment.
                            $('#photos-technology-form').append(this.addImage(fr.result,this.imageCount,this.totalImageCount,count,`${file.name.replace(/[^\w]/gi, '-')}-${file.lastModified}-${file.size}`));
                            this.loopPhoto(total,fileSelector,count+1)
                        //this.image = fr.result;
                        }
                        fr.readAsDataURL(file);
                    } else { //no FileReader support, shit. Well, this'll have to be looked into.

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
            this.photoUpload();    
            this.photoClicked = true;
            var fileSelector = $("#photo-upload").change(()=>{
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
        },
        progress: (e, data) => {
          let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
          var progress = Math.floor(((parseInt(data.loaded)*0.9)  / (parseInt(data.total))) * 100);
          $(`#inner-progress-${name}`).css({'transform':`translateX(${progress}%)`});
          $(`#progress-text-${name}`).text(progress);
          self.uploadPhotoCount += 1;
        },
        done: function (e, data) {
            let name = `${data.files[0].name.replace(/[^\w]/gi, '-')}-${data.files[0].lastModified}-${data.files[0].size}`;
            $(`#inner-progress-${name}`).css({'transform':`translateX(100%)`});
            $(`#progress-text-${name}`).text(100);
            if(e) 
            if(data.result.id) self.id = data.result.id;
            if(data.result.photos){
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
            TechnologyFormComponent.deletePhoto(id,index,totalId,name);
        });
    }
    deletePhoto(id,index,totalId,name){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        var creds = {"photo": id, "product":this.id}
        this.deletePhotoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/photos/delete`, creds, {headers: headers}).subscribe(data => {
            if(data.json().success){
                $(`#technology-form-photo-container-${name}`).remove();
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
        this._router.navigateByUrl('/technology');
    }
    submitTechnology(values){
        this.insubmit = true;
        let fadein = setTimeout(()=>{
            $(`#submit-technology`).fadeIn().css("display","inline-block");
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
           $(".technology-form-photo-containers").each(function(){self.sortedIds.push($(this).data('id'))})
           this.sorted = true;
        }
        
        
        let markedBody = values.description ? marked(values.description) : null;
        let creds = {"id":this.id, "title": values.title, "creator": values.creator, "main_category": this.mainCategory, "sub_category": this.subCategory, 'color': this.color, "size":this.size,  "quantity":this.quantity, "height":this.height, "width":this.width, "depth": this.depth, "form": form, 'description':values.description, "marked":markedBody,'properties':object, 'zip':values.zip, 'has_site':values.has_site, 'link':values.link, 'condition':values.condition, 'shipping':values.shipping, 'shipping_type': values.shipping_type, 'price': values.price, 'turnaround_time':values.turnaround_time, 'returns':values.returns, 'max_price': values.max_price, 'has_variations':values.has_variations, 'sale_price': values.sale_price, 'min_price': values.min_price, sorted: this.sorted, sorted_ids:this.sortedIds } 
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.submitSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/technology/update`, creds, {headers: headers}).subscribe(data => {
                if(data.json().success){
                    clearTimeout(failedRequest);
                    if(fadein) clearTimeout(fadein);
                    this.submitted = true;
                    if(!this._auth.check('_waydope_seller')) this._auth.setCookie('_waydope_seller', 'randomstring', 3);
                    this._sysMessages.setMessages('submittedTechnology');
                    this._router.navigateByUrl(`/technology/${this.mainCategory}/${this.subCategory}/${data.json().url}`);
                } else if (data.json().error) {
                    // this.unsupported = true;
                } else if(data.json().status === 401){
                this._modal.setModal('technology','form');
                clearTimeout(failedRequest);
                if(fadein) clearTimeout(fadein);
            } else {
            // this.error = true;
            }
            $(`#submit-technology`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.insubmit = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $('#submit-technology').css({'display':'none'});
        },15000);
    }
       
    //basically this just creates the total shoe sizes and has a div so that the outputHTMLShoesSecond can append to it.
    ngOnDestroy(){
        if(this.id && !this.technologyDelete && !this.submitted) this.deleteTechnology();
        if(this.submitSubscription) this.submitSubscription.unsubscribe();
        if(this.initiateSubscription) this.initiateSubscription.unsubscribe();
        if(this.deletePhotoSubscription) this.deletePhotoSubscription.unsubscribe();
    }
}
