import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SignUpComponent } from './components/signUp/signUp.component';
import { SignInComponent } from './components/signIn/signIn.component';
import { SwitchComponent } from './components/switch/switch.component';
import { ContactComponent } from './components/footer/contact/contact.component';
import { AboutComponent } from './components/footer/about/about.component';
import { TermsComponent } from './components/footer/terms/terms.component';
import { PrivacyComponent} from './components/footer/privacy/privacy.component';
import { PartnerComponent} from './components/footer/partner/partner.component';
import { CookiesComponent} from './components/footer/cookies/cookies.component';
import {VerifyComponent} from './components/verify/verify.component';
import {PayPalVerifyComponent} from './components/system/paypal/paypal.verify.component';
import {ResetComponent} from './components/reset/reset.component';
import {ResetPasswordComponent} from './components/reset/password/reset.password.component';

const ProfileRoutes: Routes = [
  {
    path: 'user',
    loadChildren: './components/profile/profile.module#ProfileModule'
  }
]
const AdminRoutes: Routes = [
  {
    path: 'admin',
    loadChildren: './components/admin/admin.module#AdminModule'
  }
]
const BoardsRoutes: Routes = [
  {
    path: 'boards',
    loadChildren: './components/boards/boards.module#BoardsModule'
  }
]
const MusicRoutes: Routes = [
  {
    path: 'music',
    loadChildren: './components/music/music.module#MusicModule'
  }
]
const VideoRoutes: Routes = [
  {
    path: 'videos',
    loadChildren: './components/videos/videos.module#VideosModule'
  }
]
const ApparelRoutes: Routes = [
  {
    path: 'apparel',
    loadChildren: './components/apparel/apparel.module#ApparelModule'
  }
]
const TechnologyRoutes: Routes = [
  {
    path: 'technology',
    loadChildren: './components/technology/technology.module#TechnologyModule'
  }
]
const SearchRoutes: Routes = [
  {
    path: 'search',
    loadChildren: './components/search/search.module#SearchModule'
  }
]
const CartRoutes: Routes = [
  {
    path: 'cart',
    loadChildren: './components/cart/cart.module#CartModule'
  }
]
const DevelopersRoutes: Routes = [
  {
    path: 'developers',
    loadChildren: './components/footer/developers/developers.module#DevelopersModule'
  }
]
const SellerRoutes: Routes = [
  {
    path: 'seller',
    loadChildren: './components/seller/seller.module#SellerModule'
  }
]
const MessagesRoutes: Routes = [
  {
    path: 'messages',
    loadChildren: './components/messages/messages.module#MessagesModule'
  }
]




const routes: Routes = [
    ...ProfileRoutes,
    ...AdminRoutes,
    ...BoardsRoutes,
    ...MusicRoutes,
    ...VideoRoutes,
    ...ApparelRoutes,
    ...TechnologyRoutes,
    ...SearchRoutes,
    ...CartRoutes,
    ...DevelopersRoutes,
    ...SellerRoutes,
    ...MessagesRoutes,
  { path: '', component: HomeComponent },
  { path: 'signin', component: SignInComponent},
  { path: 'signup', component: SignUpComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'terms', component: TermsComponent},
  { path: 'about', component: AboutComponent},
  { path: 'partner', component: PartnerComponent},
  { path: 'privacy', component: PrivacyComponent},
  { path: 'verify', component: VerifyComponent},
  { path: 'reset', component: ResetComponent},
  { path: 'cookies', component: CookiesComponent},
  { path: 'reset/password', component: ResetPasswordComponent},
  { path: 'paypal/verify', component: PayPalVerifyComponent},
  { path: 'switch/:where', component : SwitchComponent}, // it just reroutes back to the same component, so that it reloads.
  { path: 'switch/:where/:category', component : SwitchComponent}, // it just reroutes back to the same component, so that it reloads.
  { path: 'switch/:where/:category/:url', component : SwitchComponent}, // it just reroutes back to the same component, so that it reloads.
  { path: 'switch/:where/:category/:subcategory/:url', component : SwitchComponent},
  { path: 'switch/:where/:category/:subcategory/:url/:comment', component : SwitchComponent},
  { path: '**', component: HomeComponent}
];

export const routing = RouterModule.forRoot(routes); 