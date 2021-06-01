import { Component, OnInit, OnDestroy } from "@angular/core";
import { environment } from "./../../../environments/environment";
import { routerTransition } from "../../router.animations";
import { HttpClient } from "@angular/common/http";
import { CartService } from "src/app/cart.service";
import { FavoritesService } from "src/app/favorites.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-frequent",
    templateUrl: "./frequent.component.html",
    styleUrls: ["./frequent.component.scss"],
    animations: [routerTransition()],
})
export class FrequentComponent implements OnInit, OnDestroy {
    cartItems = [];
    frequent: any[];
    private subscription: Subscription;
    private favoriteSub: Subscription;
    private favoritesArray = [];
    constructor(
        private http: HttpClient,
        private cart: CartService,
        private favorite: FavoritesService
    ) {}

    ngOnInit() {
        this.subscription = this.cart.cartItems.subscribe((res) => {
            this.cartItems = res.cart;
        });
        this.cart.getCartbyUserId();
        //
        if (localStorage.getItem("userId")) {
            let params = {
                store_id: localStorage.getItem("storeId"),
                user_id: localStorage.getItem("userId"),
            };
            this.http
                .post(environment.api_url + "user/frequentlybought", params)
                .subscribe((res: any) => {
                    res.data.forEach((x, i) => {
                        if (x.pivot.type == 0) {
                            x.selected_option = 0;
                        }
                    });
                    this.frequent = res.data;
                });
        }

        this.favoriteSub = this.favorite.favoritesChanged.subscribe((res) => {
            this.favoritesArray = res;
        });

        this.favorite.getFavorites();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.favoriteSub.unsubscribe();
    }
}
