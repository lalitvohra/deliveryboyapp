import {
    Component,
    OnInit,
    ChangeDetectorRef,
    NgZone,
    OnDestroy,
} from "@angular/core";
import { routerTransition } from "../../router.animations";
import { HttpClient } from "@angular/common/http";
import Swal from "sweetalert2";
import { CartService } from "src/app/cart.service";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "./../../../environments/environment";
import { WindowRefService } from "src/app/window-ref.service";
import { Observable, Subscription } from 'rxjs';



declare var $: any;
declare global {
    interface Window { dataLayer: any[]; }
  }

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"],
    animations: [routerTransition()],
})
export class ProfileComponent implements OnInit, OnDestroy {
    pendingDeliveries = [];
    markedDeliveries = [];
    user: any = { id: "", name: ""};
    saving = false;
    activeTab = 1;
    fetchingOrders = false;
    fetchingRoute = false;
    latitude:number;
    longitude:number;
    routeUrl:string;
    routeInfo: any;
    location_transmitter: any;
    track_rider: any;
    audio = new Audio();
    noSleep: any;
    tripInfo = {
        distance: "0",
        time: ""
    }
    submittingLocation = false;
    private posSubscription: Subscription;
    orderIdSocket: any;

    constructor(
        private http: HttpClient,
        private cart: CartService,
        private router: Router,
        private winRef: WindowRefService,
        private changeDetectionRef: ChangeDetectorRef,
        private route: ActivatedRoute,
        private ngZone: NgZone
    ) {
        this.audio.src = environment.url+"public/siren.mp3";
        this.audio.load();
        this.noSleep = new this.winRef.nativeWindow.NoSleep();
    }
    ngOnInit() {
        this.noSleep.enable();
        this.getUserLocation();

        //test temp
        // this.http
        // .get(environment.url + "test")
        // .subscribe((res: any) => {
        //     this.pendingDeliveries = res.pendingDeliveries;
        //     console.log(this.pendingDeliveries);
        //     let route = JSON.parse(res.route_info);
        //     let all_waypoints = route['results'][0]['waypoints'];
        //     all_waypoints = all_waypoints.slice(1, -1) ;
        //     let index = all_waypoints.map(x => +x.id);
        //     this.pendingDeliveries.sort((a, b) => index.indexOf(a.id) - index.indexOf(b.id));


        //     console.log(index);
        // })
        //testmap

    }

    subscribeUserChannel(){
        let username = this.user.name;
        let apiKey = environment.piesocket_api_key;
        let channelId = 'user'+this.user.id;
        console.log(channelId);
        let piesocket = new WebSocket(`wss://us-nyc-1.websocket.me/v3/${channelId}?api_key=${apiKey}`);
        piesocket.onopen = () => {
            console.log(`Piesocket Websocket connected`);
            //this.audio.play();
            // piesocket.send(JSON.stringify({
            //     event: 'new_joining',
            //     sender: username,
            // }));
        }

        piesocket.onmessage = (message) => {
            console.log(message);
            var payload = JSON.parse(message.data);
            console.log(payload);
            if(payload.event == 'update_route'){
                //swal update route
                //this.routeUrl = payload.route_url;
                this.audio.play();
                this.getUserLocation();
            }

            if(payload.event == 'track_user'){
                //send current location.
            }
        }
    }

    

    closeOrderIdChannel(){
        if(this.location_transmitter){
            clearInterval(this.location_transmitter);
        }
       
        if(this.orderIdSocket){
            this.orderIdSocket.close();
        }        
    }


    openOrderIdChannel(orderId){
        let apiKey = environment.piesocket_api_key;
        let channelId = 'order'+orderId;
        this.orderIdSocket = new WebSocket(`wss://us-nyc-1.websocket.me/v3/${channelId}?api_key=${apiKey}`);  //&notify_self for chat
        this.orderIdSocket.onopen = () => {
            console.log(`Piesocket Websocket connected`);
            this.location_transmitter = setInterval(() => {
                this.getConstantPosition().subscribe((pos) => {
                    if(pos.lat != 0){
                        let location_info = JSON.stringify(pos);
                        this.orderIdSocket.send(location_info);
                        //console.log('transmitting information');
                        //this.audio.play();
                    }
                });
                
            }, 30000);
        }

        this.orderIdSocket.onclose = () => {
            //console.log('Piesocket Websocket Closed');
            clearInterval(this.location_transmitter);
        }
  
        this.orderIdSocket.onmessage = (message) => {
            var payload = JSON.parse(message.data);
            //this.audio.play();
        }
    }

    subscribePusherChannel(){
        this.winRef.nativeWindow.Pusher.logToConsole = true;

        let pusher = new this.winRef.nativeWindow.Pusher('2629e46659f3aaec7d1f', {
        cluster: 'ap2'
        });
        
       
        let channel = pusher.subscribe(''+this.user.id);
        channel.bind('pusher:subscription_succeeded', () => {

            let audio = new Audio();
            audio.src = environment.url+"public/sound.mp3";
            audio.load();
            audio.play();
        });
        channel.bind('order-assigned', function(data) {
        alert(JSON.stringify(data));

        let audio = new Audio();
        audio.src = environment.url+"public/sound.mp3";
        audio.load();
        audio.play();
        
        });
    }


    getUserLocation(){
        this.closeOrderIdChannel();
        this.fetchingRoute = true;
        this.posSubscription = this.getPosition().subscribe((pos) => {
            if(pos.lat == 0){
                this.fetchingRoute = false;
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text:
                        "Cant fetch your current location. Check if your location is turned on",
                });
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 2000,
                    onOpen: (toast) => {
                        toast.addEventListener("mouseenter", Swal.stopTimer);
                        toast.addEventListener("mouseleave", Swal.resumeTimer);
                    },
                });
    
                Toast.fire({
                    icon: "success",
                    title: "Location Fetched Successfully",
                });
    
                this.latitude = pos.lat;
                this.longitude = pos.lng;              

                this.getCurrentRouteHere(this.latitude, this.longitude);
                
            }           
            
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                    "Cant fetch your current location. Check if your location is turned on",
            });
        });
    }

    getPosition(): Observable<any> {
        return Observable.create(observer => {
            navigator.geolocation.watchPosition(
                (resp) => {
                    let position = {                            
                        lng: resp.coords.longitude,
                        lat: resp.coords.latitude,
                    }
                    observer.next(position);
                    observer.complete();
                    observer.unsubscribe();
                   
                },
                (error) => {                   
                    this.fetchingRoute = false;
                    
                    // alert(error);
                }
            );

            setTimeout(()=>{                
                    let position = {                            
                        lng: 0,
                        lat: 0,
                    }
                    observer.next(position);
                    observer.complete();
                    observer.unsubscribe();               
            }, 10000)
           });
    }

    getConstantPosition(): Observable<any> {
        return Observable.create(observer => {
            navigator.geolocation.watchPosition(
                (resp) => {
                    let position = {                            
                        lng: resp.coords.longitude,
                        lat: resp.coords.latitude,
                    }
                    observer.next(position);
                    observer.complete();
                    observer.unsubscribe();
                   
                },
                (error) => {                   
                   
                    let position = {                            
                        lng: 0,
                        lat: 0,
                    }
                    observer.next(position);
                    observer.complete();
                    observer.unsubscribe();            
                    // alert(error);
                }
            );

            setTimeout(()=>{                
                let position = {                            
                    lng: 0,
                    lat: 0,
                }
                observer.next(position);
                observer.complete();
                observer.unsubscribe();          
            }, 4000)
           });
    }

    getCurrentRouteHere(lat: number, lng: number){
        let params = {
            lat: lat,
            lng: lng
        } 
        let headers = {};  
        this.http
        .post(environment.api_url + "user/deliveries", params)
        .subscribe((res: any) => {
            this.fetchingRoute = false;
            //if(res.status == "OK"){
            this.pendingDeliveries = res.pendingDeliveries;
            let outforDelivery: any = this.pendingDeliveries.find(element => element.status == 3);
            if(outforDelivery){
                this.openOrderIdChannel(outforDelivery.id);
            }            
            this.markedDeliveries = res.markedDeliveries;
            
            this.user = res.user;
            if(this.user.id != ""){
                this.subscribeUserChannel();
            }            
            //this.subscribePusherChannel(); 
            

                if(res.route_info && res.route_info != null){
                    let route = JSON.parse(res.route_info);
                    this.routeInfo = route;
                    let all_waypoints = route['results'][0]['waypoints'];
                    let route_points = all_waypoints;
                    all_waypoints = all_waypoints.slice(1, -1) ;
                    let index = all_waypoints.map(x => +x.id);
                                   let distance = route['results'][0]['distance'];
                    let totalDist = (distance / 1000).toFixed(2);
                    let time = route['results'][0]['time'];
                    let totalTime = (time/60).toFixed(2);
                    this.tripInfo = {distance: totalDist, time: totalTime}
                   
                    //sorting
                    let accurateDeliveries = this.pendingDeliveries.filter(function (x) {
                        return x.lat != null;
                    });
            
                    let inaccurateDeliveries = this.pendingDeliveries.filter(x => !accurateDeliveries.includes(x));
                    let sortedDeliveries =  accurateDeliveries.sort((a, b) => index.indexOf(a.id) - index.indexOf(b.id));
     
                    let waypoints = [];
                    route_points.forEach((x) => {
                        waypoints.push(x['lat']+','+x['lng']);                
                    });
                    console.log(waypoints)
                    let string_waypoints = waypoints.join("/");
                    this.pendingDeliveries = sortedDeliveries.concat(inaccurateDeliveries);
                    this.routeUrl = "https://www.google.com/maps/dir/"+string_waypoints;
                } else {
                    //error cant fetch route refresh orders or try again.
                }
              
                

            //}            
            
            //this.pendingDeliveries = res.pendingDeliveries;
            //this.markedDeliveries = res.markedDeliveries;  
            //https://www.google.com/maps/dir/33.93729,-106.85761/33.91629,-106.866761/33.98729,-106.85861          
        });
    }

    getCurrentRoute(lat: number, lng: number){
        let params = {
            lat: lat,
            lng: lng
        } 
        let headers = {};  
        this.http
        .post(environment.api_url + "user/deliveries", params)
        .subscribe((res: any) => {
            this.fetchingRoute = false;
            //if(res.status == "OK"){
            this.pendingDeliveries = res.pendingDeliveries;
            let outforDelivery: any = this.pendingDeliveries.find(element => element.status == 3);
            if(outforDelivery){
                this.openOrderIdChannel(outforDelivery.id);
            }            
            this.markedDeliveries = res.markedDeliveries;
            
            this.user = res.user;
            if(this.user.id != ""){
                this.subscribeUserChannel();
            }            
            //this.subscribePusherChannel(); 
            

                if(res.route_info && res.route_info != null){
                    let route = JSON.parse(res.route_info);
                    this.routeInfo = route;
                    this.computeTotalDistance(route);
                    let way_order = route.routes[0].waypoint_order;
                    let origin = res.origin;
                    let destination = res.destination;
                    //console.log(res);
                    this.sortPendingDeliveries(way_order, origin, destination); 
                } else {
                    //error cant fetch route refresh orders or try again.
                }
              
                

            //}            
            
            //this.pendingDeliveries = res.pendingDeliveries;
            //this.markedDeliveries = res.markedDeliveries;  
            //https://www.google.com/maps/dir/33.93729,-106.85761/33.91629,-106.866761/33.98729,-106.85861          
        });
    }

    sortPendingDeliveries(index, origin, destination){
        let accurateDeliveries = this.pendingDeliveries.filter(function (x) {
            return x.lat != null;
        });

        let inaccurateDeliveries = this.pendingDeliveries.filter(x => !accurateDeliveries.includes(x));
        let sortedDeliveries =  index.map(i => accurateDeliveries[i]);
        let waypoints = [];
        sortedDeliveries.forEach((x) => {
            waypoints.push(x.lat+','+x.lng);                
        });
        let string_waypoints = waypoints.join("/");
        this.pendingDeliveries = sortedDeliveries.concat(inaccurateDeliveries);

        this.routeUrl = "https://www.google.com/maps/dir/"+origin+"/"+string_waypoints+"/"+destination;

    }

    refreshOrders(){
       this.getUserLocation();
    }

    updateOrderLocationAutomatically(orderId){
        this.submittingLocation = true;
        this.posSubscription = this.getPosition().subscribe((pos) => {
            if(pos.lat == 0){
                this.fetchingRoute = false;
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text:
                        "Cant fetch your current location. Check if your location is turned on",
                });
                this.submittingLocation = false;
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 2000,
                    onOpen: (toast) => {
                        toast.addEventListener("mouseenter", Swal.stopTimer);
                        toast.addEventListener("mouseleave", Swal.resumeTimer);
                    },
                });
    
                Toast.fire({
                    icon: "success",
                    title: "Location Fetched Successfully",
                });

                this.changeOrderLocation(orderId, pos.lat, pos.lng);  
                
            }           
            
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                    "Cant fetch your current location. Check if your location is turned on",
            });
            this.submittingLocation = false;
        });
    }

    updateOrderLocation(orderId){        
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Enter Manually',
            confirmButtonText: 'Use Current Location!'
          }).then((result: any) => {
              
            if (result.value) {
                this.updateOrderLocationAutomatically(orderId);
            } else {
                Swal.fire({
                    title: 'Submit location for '+orderId,
                    input: 'text',
                    inputAttributes: {
                      autocapitalize: 'off'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'UPDATE',
                    showLoaderOnConfirm: true,
                    preConfirm: (location) => {
                     
                     let location_array = location.replace(/\s/g,'').split(',');
                     console.log(location_array.length);
                     if(location_array.length == 2){
                        
                        if(this.validateLatLng(location_array[0], location_array[1])){
                            this.changeOrderLocation(orderId, location_array[0], location_array[1]);
                        } else {
                            Swal.fire(
                                'Format Incorrect!',
                                'Format your be latitutde,longitude',
                                'error'
                              )
                        }
                     } else {
                        Swal.fire(
                            'Format Incorrect!',
                            'Format your be latitutde,longitude',
                            'error'
                          )   
                     }

                    },
                    allowOutsideClick: () => !Swal.isLoading()
                  });
            }
          })
    }

    validateLatLng(lat, lng) {    
        let pattern = new RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}');
        
        return pattern.test(lat) && pattern.test(lng);
      }

    changeOrderLocation(orderId, lat, lng){
        this.submittingLocation = true;
        let params = {
            order_id : orderId,
            lat: lat,
            lng: lng
        }
        this.http
            .post(environment.api_url + "user/update_order_location", params)
            .subscribe((res: any) => {
                let order = res;
                let pendingIndex = this.pendingDeliveries.findIndex(x => x.id == order.id);
                if(pendingIndex !== -1){
                    this.pendingDeliveries[pendingIndex].lat = order.lat;
                    this.pendingDeliveries[pendingIndex].lng = order.lng;
                    this.pendingDeliveries[pendingIndex].location_accurate = order.location_accurate;
                }
                let deliveredIndex = this.markedDeliveries.findIndex(x => x.id == order.id);
                if(deliveredIndex !== -1){
                    this.pendingDeliveries[pendingIndex].lat = order.lat;
                    this.pendingDeliveries[pendingIndex].lng = order.lng;
                    this.pendingDeliveries[pendingIndex].location_accurate = order.location_accurate;
                } 
                Swal.fire(
                    'Saved!',
                    'Order location updated successfully',
                    'success'
                  )
                  this.submittingLocation = false;
            });
            
        
    }

    computeTotalDistance(result) {
        let totalDist = 0;
        let totalTime = 0;
        var myroute = result.routes[0];
        for (let i = 0; i < myroute.legs.length; i++) {
          totalDist += myroute.legs[i].distance.value;
          totalTime += myroute.legs[i].duration.value;
        }
        totalDist = totalDist / 1000.

        this.tripInfo = {distance: ''+totalDist, time: (totalTime / 60).toFixed(2)}
        //document.getElementById("dvDistance").innerHTML = "total distance is: " + totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes";
      }

    markOutForDelivery(orderId: any){
        Swal.fire({
            title: 'Mark order #'+orderId+' out for delivery ?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, mark out for delivery!'
          }).then((result: any) => {
              
            if (result.value === true) {
                this.ngZone.run(() => {
                    let params = {
                        order_id : orderId
                    }
                    this.http
                        .post(environment.api_url + "user/mark_out_for_delivery", params)
                        .subscribe((res: any) => {
                                let order = res;
                                let pendingIndex = this.pendingDeliveries.findIndex(x => x.id == order.id);
                                if(pendingIndex !== -1){
                                this.pendingDeliveries[pendingIndex].status = 3;
                                }
                                this.closeOrderIdChannel();
                                this.openOrderIdChannel(orderId);
                            Swal.fire(
                                'Saved!',
                                'Order marked out for delivery successfully',
                                'success'
                              )
                             
                        });
                });
                
              
            }
          })

       
    }

    markDelivered(orderId: any){
        Swal.fire({
            title: 'Mark order #'+orderId+' as delivered ?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, mark delivered!'
          }).then((result: any) => {
              console.log(result);
            if (result.value === true) {
                // console.log('is confirmed');
                this.ngZone.run(() => {
                    let params = {
                        order_id : orderId
                    }
                    this.http
                        .post(environment.api_url + "user/mark_delivered", params)
                        .subscribe((res: any) => {
                            let order = res;
                            let pendingIndex = this.pendingDeliveries.findIndex(x => x.id == order.id);
                            if(pendingIndex !== -1){
                            this.pendingDeliveries[pendingIndex].status = 4;
                            this.markedDeliveries.push(this.pendingDeliveries.splice(pendingIndex, 1)[0]);
                        }
    
                        this.closeOrderIdChannel();
                            
                            Swal.fire(
                                'Saved!',
                                'Order marked delivered successfully',
                                'success'
                              )          
                        });
                });
              
              
            }
          })

       
    }

    markConfirmed(orderId: any){
        Swal.fire({
            title: 'Mark order #'+orderId+' as confirmed ?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, mark confirmed!'
          }).then((result: any) => {
              console.log(result);
            if (result.value === true) {
                // console.log('is confirmed');
                this.ngZone.run(() => {
                    let params = {
                        order_id : orderId
                    }
                    this.http
                        .post(environment.api_url + "user/mark_confirmed", params)
                        .subscribe((res: any) => {
                            let order = res;
                            let pendingIndex = this.pendingDeliveries.findIndex(x => x.id == order.id);
                            if(pendingIndex !== -1){
                            this.pendingDeliveries[pendingIndex].status = 2;
                        }
    
                        this.closeOrderIdChannel();
                            
                            Swal.fire(
                                'Saved!',
                                'Order marked confirmed successfully',
                                'success'
                              )          
                        });
                });
              
              
            }
          })
    }

    unAssignOrder(orderId: any){
        Swal.fire({
            title: 'Remove #'+orderId+' from List ?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove from list!'
          }).then((result: any) => {
              console.log(result);
            if (result.value === true) {
                // console.log('is confirmed');
                this.ngZone.run(() => {
                    let params = {
                        order_id : orderId
                    }
                    this.http
                        .post(environment.api_url + "user/unassign_order", params)
                        .subscribe((res: any) => {
                            let order = res;
                            let pendingIndex = this.pendingDeliveries.findIndex(x => x.id == order.id);
                            if(pendingIndex !== -1){
                            this.pendingDeliveries.splice(pendingIndex, 1);
                            }
    
                        this.closeOrderIdChannel();
                            
                            Swal.fire(
                                'Saved!',
                                'Order removed successfully',
                                'success'
                              )          
                        });
                });
              
              
            }
          })   
    }

    selectTab(option: number){
        this.activeTab = option;
    }

    urlEncodedText(orderId, orderName){
        let text = "Hi "+orderName+" I am "+this.user.name+" from Fresh Produce Shoppe (fpsstore.in) and I am on my way to deliver your order no. "+orderId+" Please share your exact location so that I can reach you faster. Thanks"
        return encodeURI(text);
    }

    ngOnDestroy(){
        if(this.orderIdSocket){
            this.orderIdSocket.close();
        }
        
    }
    
}
