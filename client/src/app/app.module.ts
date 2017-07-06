
import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routing } from './routes';
import {HttpModule} from "@angular/http";

import { HomeComponent } from './components/home/home.component';

import {BoardsMenuComponent} from './components/menu/boards/boards.menu.component';
import {MusicMenuComponent} from './components/menu/music/music.menu.component';
import {VideosMenuComponent} from './components/menu/videos/videos.menu.component';
import {ApparelMenuComponent} from './components/menu/apparel/apparel.menu.component';
import {TechnologyMenuComponent} from './components/menu/technology/technology.menu.component';
import {ProfileMenuComponent} from './components/menu/profile/profile.menu.component';

import { SignUpComponent } from './components/signUp/signUp.component';
import { SignInComponent } from './components/signIn/signIn.component';
import { SwitchComponent } from './components/switch/switch.component';
import {SharedModule} from './share.module'
import {ModalComponent} from './components/modal/modal.component';
import {ModalUpdateComponent} from './components/modal/update/modal.update.component';
import {NotificationsComponent} from './components/notifications/notifications.component';
import {CartModalComponent} from './components/cart/modal/cart.modal.component';
import {SystemMessagesComponent} from './components/system/messages/messages.component';
import {MessagesModalComponent} from './components/messages/modal/messages.modal.component';

import {MenuComponent} from './components/menu/menu.component';

import {ProfileModule} from './components/profile/profile.module';
import {AdminModule} from './components/admin/admin.module';
import {BoardsModule} from './components/boards/boards.module';
import {MusicModule} from './components/music/music.module';
import {VideosModule} from './components/videos/videos.module';
import {ApparelModule} from './components/apparel/apparel.module';
import {TechnologyModule} from './components/technology/technology.module';
import {SearchModule} from './components/search/search.module';
import {DevelopersModule} from './components/footer/developers/developers.module';
import {CartModule} from './components/cart/cart.module';
import {SellerModule} from './components/seller/seller.module';
import {MessagesModule} from './components/messages/messages.module';

import { ContactComponent } from './components/footer/contact/contact.component';
import { AboutComponent } from './components/footer/about/about.component';
import { TermsComponent } from './components/footer/terms/terms.component';
import { PrivacyComponent} from './components/footer/privacy/privacy.component';
import { PartnerComponent} from './components/footer/partner/partner.component';
import {CookiesComponent} from './components/footer/cookies/cookies.component';
import {FooterComponent} from './components/footer/footer.component';
import {Safe} from './pipes/safe-html.pipe';

import {VerifyComponent} from './components/verify/verify.component';
import {PayPalVerifyComponent} from './components/system/paypal/paypal.verify.component';
import {ResetComponent} from './components/reset/reset.component';
import {ResetPasswordComponent} from './components/reset/password/reset.password.component';

import {BoardsHomeComponent} from './components/home/boards-home/boards.home.component';
import {MusicHomeComponent} from './components/home/music-home/music.home.component';
import {VideosHomeComponent} from './components/home/videos-home/videos.home.component';
import {ApparelHomeComponent} from './components/home/apparel-home/apparel.home.component';
import {TechnologyHomeComponent} from './components/home/technology-home/technology.home.component';

@NgModule({
    declarations: [AppComponent, CookiesComponent, ModalUpdateComponent, HomeComponent, SignInComponent, SignUpComponent,CartModalComponent, SwitchComponent,FooterComponent, ContactComponent, AboutComponent, TermsComponent, PrivacyComponent, PartnerComponent,ModalComponent, PayPalVerifyComponent, NotificationsComponent, SystemMessagesComponent, ResetPasswordComponent, VerifyComponent, ResetComponent, MessagesModalComponent, BoardsHomeComponent,MusicHomeComponent,VideosHomeComponent,ApparelHomeComponent,TechnologyHomeComponent,BoardsMenuComponent,MusicMenuComponent,VideosMenuComponent,ApparelMenuComponent,TechnologyMenuComponent,ProfileMenuComponent, MenuComponent],
    imports: [
        BrowserModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
        ProfileModule,
        AdminModule,
        MusicModule,
        BoardsModule,
        VideosModule,
        ApparelModule,
        TechnologyModule,
        SearchModule,
        CartModule,
        SellerModule,
        DevelopersModule,
        MessagesModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}