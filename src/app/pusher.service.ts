import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare const Pusher: any;

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  pusher: any;
  channel: any;
  constructor() {
    // this.pusher = new Pusher(environment.pusher.key);
    this.channel = this.pusher.subscribe('test');
   }

   bindChannel(id: string){
    this.channel = this.pusher.subscribe('98');
   }
}
