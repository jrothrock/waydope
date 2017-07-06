import {Injectable} from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class BackendService {
    SERVER_URL: string;
    readonly SERVER_PORT_DEV: string = '3000';
    BUCKET:string;
    PRODUCTION:boolean;
    constructor() {
        let is_production = environment.production;
        this.SERVER_URL = `${window.location.protocol}//${is_production ? 'api.' : ''}${window.location.hostname}:${is_production ? window.location.port : this.SERVER_PORT_DEV }`;
        this.BUCKET = `${is_production ? 'waydope' : 'waydope-development'}`;
        this.PRODUCTION = is_production;
        //what the above says in a non fuckery strings.
        // if (process.env.ENV === 'production') {
        //     this.SERVER_URL =  window.location.protocol + '//' + 'api.' + window.location.hostname + ':' + window.location.port;
        // } else {
        //     this.SERVER_URL = window.location.protocol + '//' + window.location.hostname + ':' + this.SERVER_PORT_DEV;
        // }
    }
}