import { Routes, RouterModule }  from '@angular/router';
import {CartComponent} from './cart.component';
import {CheckoutComponent} from './checkout/checkout.component';

const cartRouters: Routes = [
  {
    path: 'cart',
    component: CartComponent,
    children: [
    {
     path: '',
     component: CheckoutComponent
    }
   ]
  }
];
export const CartRoutes = RouterModule.forChild(cartRouters);