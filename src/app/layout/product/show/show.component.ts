import { Component, OnInit, OnDestroy } from "@angular/core";
import { routerTransition } from "src/app/router.animations";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { FavoritesService } from "src/app/favorites.service";
import { CartService } from "src/app/cart.service";
import { Subscription } from "rxjs";
import { environment } from "./../../../../environments/environment";

@Component({
    selector: "app-show",
    templateUrl: "./show.component.html",
    styleUrls: ["./show.component.scss"],
    animations: [routerTransition()],
})
export class ShowComponent implements OnInit, OnDestroy {
    product: any = {};
    public cartItems = [];
    public favorites: any[] = [];
    cartSubscription: Subscription;
    favoriteSub: Subscription;
    optionSelected = 0;
    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private favorite: FavoritesService,
        private cart: CartService
    ) {}

    ngOnInit() {
        //console.log(this.route.snapshot.params["id"]);

        this.route.params.subscribe((params) => {
            this.http
                .post(environment.api_url + "products/show", {
                    store_id: localStorage.getItem("storeId"),
                    slug: params["slug"],
                })
                .subscribe((res) => {
                    if (res) {
                        this.product = res;
                        if (this.product.type == 0) {
                            this.product.selected_option = 0;
                        }
                    }
                });
            //console.log(params["slug"]);
        });

        this.cartSubscription = this.cart.cartItems.subscribe((res) => {
            this.cartItems = res.cart;
        });

        this.cart.getCartbyUserId();
        this.favoriteSub = this.favorite.favoritesChanged.subscribe((res) => {
            this.favorites = res;
        });

        this.favorite.getFavorites();
    }

    onFavoriteProduct(id: number) {
        let index = this.favorites.indexOf(id);
        if (index > -1) {
            //console.log(1);

            this.favorites.splice(index, 1);
            //console.log(this.favorites);
            this.favorite.removeFromFavorites(id);
        } else {
            this.favorite.addToFavorites(id);
        }
    }

    checkFavorite(id: number) {
        if (this.favorites.includes(id)) {
            return "favorite";
        } else {
            return "favorite_outline";
        }
    }

    selectOption(i: number) {
        this.product.selected_option = i;
        this.optionSelected = i;
    }

    getProductPrice() {
        // console.log(this.loadedProducts);
        let price =
            this.product.price +
            (this.product.type == 0
                ? this.product.options[this.product.selected_option].pivot.price
                : 0);

        return price;
    }

    onAddToCart() {
        let cartRow = this.cartItems.find(
            (product) => product.attributes.id == this.product.id
        );

        let product = this.product;
        if (product.type == 1) {
            if (cartRow) {
                this.cart.updateQuantity(cartRow.id, 1);
            } else {
                let attributes: any = { id: product.id };
                let price = product.price;
                let add_product = {
                    id: product.id,
                    name: product.name,
                    price: price,
                    quantity: 1,
                    attributes: attributes,
                };

                this.cart.addToCart(add_product);
            }
        } else {
            if (
                cartRow &&
                cartRow.attributes.option ==
                    product.options[product.selected_option].name
            ) {
                this.cart.updateQuantity(cartRow.id, 1);
            } else {
                let attributes: any = { id: product.id };
                let price = product.price;
                attributes.option =
                    product.options[product.selected_option].name;
                price += product.options[product.selected_option].pivot.price;

                let add_product = {
                    id: product.id,
                    name: product.name,
                    price: price,
                    quantity: 1,
                    attributes: attributes,
                };

                this.cart.addToCart(add_product);
            }
        }
    }

    ngOnDestroy() {
        this.cartSubscription.unsubscribe();
        this.favoriteSub.unsubscribe();
    }
}
