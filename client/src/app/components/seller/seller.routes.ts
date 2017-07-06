import { Routes, RouterModule }  from '@angular/router';

import {SellerComponent} from './seller.component';
import {SellerMainComponent} from './main/seller.main.component';
import {SellerApplyComponent} from './apply/seller.apply.component';
import {SellerUserComponent} from './user/seller.user.component';
import {SellerSalesComponent} from './sales/seller.sales.component';
import {SellerSaleComponent} from './sales/sale/seller.sale.component';
import {SellerSaleUpdateComponent} from './sales/sale/update/seller.sale.update.component';
// import {SearchAllComponent} from './all/search.all.component';

const sellerRouters: Routes = [
  {
    path: 'seller',
    component: SellerComponent,
    children: [
    {
    path: '',
    component: SellerMainComponent
    },
    {
    path: 'apply',
    component: SellerApplyComponent
    },
    {
    path: ':id',
    component: SellerUserComponent
    },
    {
      path: 'sales',
      component: SellerSalesComponent
    },
    {
      path: 'sales/:order',
      component: SellerSaleComponent
    },
    {
      path: 'sales/:order/:product/:size/:color',
      component: SellerSaleComponent
    },
    {
      path: 'sales/:order/:product/:size/:color/update',
      component: SellerSaleUpdateComponent
    }
   ]
  }
];
export const SellerRoutes = RouterModule.forChild(sellerRouters);