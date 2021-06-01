import {
    Component,
    OnInit,
    ViewChild,
    Input,
    AfterViewInit,
    ChangeDetectorRef,
    NgZone,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { routerTransition } from "../router.animations";
import { environment } from "./../../environments/environment";
import {} from "googlemaps";
import Swal from "sweetalert2";
import { CartService } from "../cart.service";


@Component({
    selector: "app-choose-store",
    templateUrl: "./choose-store.component.html",
    styleUrls: ["./choose-store.component.css"],
    animations: [routerTransition()],
})
export class ChooseStoreComponent implements OnInit {
    @Input() adressType: string;
    @ViewChild("addresstext", { static: false }) addresstext: any;
    environment = environment;
    autocompleteInput: string;
    queryWait: boolean;
    stores: any[] = [];
    store_id: number;
    available_store: {};
    constructor(
        private http: HttpClient,
        private router: Router,
        private cart: CartService,
        private changeDetectionRef: ChangeDetectorRef,
        private route: ActivatedRoute,
        private ngZone: NgZone
    ) {
        this.route.queryParams.subscribe(params => {
            this.store_id = params['store_id'];
            if(this.store_id){
                this.cart.clearCart();
            } 
        })
    }

    ngOnInit() {
        (document.querySelector(
            ".loader-screen"
        ) as HTMLElement).style.display = "none";

        this.http.get(environment.api_url + "stores").subscribe((res: any) => {
            res.data.forEach((x, i) => {
                x.km = null;
            });
            this.stores = res.data;
            // this.getPosition().then((pos) => {
            //     this.stores.forEach((x, i) => {
            //         let distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
            //             new google.maps.LatLng({
            //                 lat: pos.lat,
            //                 lng: pos.lng,
            //             }),
            //             new google.maps.LatLng({
            //                 lat: +x.lat,
            //                 lng: +x.lng,
            //             })
            //         );

            //         this.stores[i].km = (distanceInMeters * 0.001).toFixed(1);
            //     });

            //     this.sortStores();
            //     // console.log(this.stores);
            //     // console.log(`Positon: ${pos.lng} ${pos.lat}`);
            // });
        });
    }

    ngAfterViewInit() {
        this.getPlaceAutocomplete();
    }

    private getPlaceAutocomplete() {
        const autocomplete = new google.maps.places.Autocomplete(
            this.addresstext.nativeElement,
            {
                componentRestrictions: { country: "IN" },
                types: [this.adressType], // 'establishment' / 'address' / 'geocode'
            }
        );
        google.maps.event.addListener(autocomplete, "place_changed", () => {
            const place = autocomplete.getPlace();
            // console.log(place);
            let lat = place.geometry.location.lat();
            let lng = place.geometry.location.lng();

            this.stores.forEach((x, i) => {
                let distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng({
                        lat: lat,
                        lng: lng,
                    }),
                    new google.maps.LatLng({
                        lat: +x.lat,
                        lng: +x.lng,
                    })
                );

                this.stores[i].km = (distanceInMeters * 0.001).toFixed(1);
            });

            this.sortStores();
        });
    }

    onChooseStore(id: string, name: string, km: string) {
        this.cart.clearCart();
        localStorage.setItem("storeId", id);
        localStorage.setItem("storeName", name);
        localStorage.setItem('distanceFromStore', km);
        // fbq('track', 'FindLocation', {store_id: id});
        this.ngZone.run(() => this.router.navigate(["/", "home"], {queryParamsHandling: 'merge'}));
        //this.router.navigate(["/home"], {queryParamsHandling: 'merge'});
        // Usually this happens when you are wrapping angular calls inside some external js callback, from external JavaScript not related to angular code.
    }

    sortStores() {
        this.stores.sort(function (x, y) {
            return x.km - y.km;
        });
        let hidePopup = this.stores.some((x) => {
            return x.km < 15;
        });
        if (!hidePopup) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                    "Sorry we dont deliver in your location yet. Try another location ? ",
            });
        } else {
            let first_store = this.stores[0];
            this.onChooseStore(first_store.id, first_store.name, first_store.km );
        }  
        this.available_store = this.stores.find(x => {
            return x.km < 15;
        })
        console.log(this.stores);
        this.changeDetectionRef.detectChanges();
        
    }

    getPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.watchPosition(
                (resp) => {
                    resolve({
                        lng: resp.coords.longitude,
                        lat: resp.coords.latitude,
                    });
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    clearAddress() {
        this.addresstext.nativeElement.value = "";
    }
}
