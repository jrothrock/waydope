import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import {MaterializeDirective} from "angular2-materialize";

import {CartComponent} from './cart.component';
import {CartRoutes} from './cart.routes';
import {CheckoutComponent} from './checkout/checkout.component';

import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	CartRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        CartComponent,
    	CheckoutComponent
    ]

})

export class CartModule {}