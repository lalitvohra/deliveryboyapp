import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { environment } from "./../../../environments/environment";
import { routerTransition } from "../../router.animations";
import { HttpClient } from "@angular/common/http";
import { CartService } from "../../cart.service";
import { Subscription } from "rxjs";
import { FavoritesService } from "../../favorites.service";

declare var $: any;

@Component({
    selector: "app-favorite",
    templateUrl: "./favorites.component.html",
    styleUrls: ["./favorites.component.scss"],
    animations: [routerTransition()],
})
export class FavoritesComponent implements OnInit, OnDestroy {
    public cartItems = [];
    public favorites: any[];
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

        this.favoriteSub = this.favorite.favoritesChanged.subscribe((res) => {
            this.favoritesArray = res;
            let params = {
                store_id: localStorage.getItem("storeId"),
                product_ids: res,
            };
            this.http
                .post(environment.api_url + "products/favorites", params)
                .subscribe((res: any) => {
                    res.data.forEach((x, i) => {
                        if (x.pivot.type == 0) {
                            x.selected_option = 0;
                        }
                    });
                    this.favorites = res.data;
                });
        });

        this.favorite.getFavorites();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.favoriteSub.unsubscribe();
    }
}
