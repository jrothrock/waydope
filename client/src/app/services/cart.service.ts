import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';


@Injectable()
export class CartService {
  items:any=[];
  quantities:any=[];
  ids:any=[];
  values:any=[];
  item:any;
  order:any;
  quantity:number;
  edit:boolean;
  buynow:boolean;
  value:any;
  lookups:any=[];
  itemsChange: EventEmitter<any> = new EventEmitter<any>();
  cartChange: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}
  getQuantity(){
    return this.quantities;
  }
  change(items, order){
    this.items = items;
    this.order = order;
    // this.quantities = order.quantities;
    this.cartChange.next([this.items, this.order]);
  }
  itemChange(item, values,edit=false,buynow=false){
      if(this.lookups.indexOf(`${item.id}, ${values.size}, ${values.color}`) === -1){
        this.quantities.push([item.uuid,values.size,values.color,parseInt(values["quantity"])]);
        this.lookups.push(`${item.uuid}, ${values.size}, ${values.color}`);
        this.values.push(values);
        this.ids.push(item.uuid);
      } else if(values["quantity"] === 0){
        let index = this.lookups.indexOf(`${item.uuid}, ${values.size}, ${values.color}`)
        this.ids.splice(index, 1); 
        this.lookups.splice(index,1);
        this.quantities.splice(index, 1);
        this.values.splice(index,1) ;
      } else {
        let index = this.lookups.indexOf(`${item.uuid}, ${values.size}, ${values.color}`)
        this.quantities[this.lookups.indexOf(`${item.uuid}, ${values.size}, ${values.color}`)][3] = parseInt(values["quantity"])
        this.values[index] = values;
      }
      this.item = item;
      this.quantity = values["quantity"];
      this.value = values;
      this.edit = edit;
      this.buynow = buynow;
      this.itemsChange.next([this.item,values,this.edit,this.buynow]);
  }
  emptyCart(){
    this.items = [];
    this.order = null;
    this.quantities = [];
    this.lookups = [];
    this.ids = [];
    this.quantity = null;
    this.edit = false;
    this.itemsChange.next(['clear']);
  }
}