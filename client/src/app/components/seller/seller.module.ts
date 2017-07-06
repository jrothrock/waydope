import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {SellerRoutes} from './seller.routes';
import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

import {SellerComponent} from './seller.component';
import {SellerMainComponent} from './main/seller.main.component';
import {SellerApplyComponent} from './apply/seller.apply.component';
import {SellerUserComponent} from './user/seller.user.component';
import {SellerSalesComponent} from './sales/seller.sales.component';
import {SellerSaleComponent} from './sales/sale/seller.sale.component';
import {SellerSaleUpdateComponent} from './sales/sale/update/seller.sale.update.component';
import {SellerProductsComponent} from './products/seller.products.component';
import {SellerProductComponent} from './products/product/seller.product.component';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	SellerRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
    	SellerComponent,
        SellerMainComponent,
        SellerApplyComponent,
        SellerUserComponent,
        SellerSalesComponent,
        SellerSaleComponent,
        SellerSaleUpdateComponent,
        SellerProductsComponent,
        SellerProductComponent
    ]

})

export class SellerModule {}