import { Component, OnInit, OnDestroy } from "@angular/core";
import { routerTransition } from "../../../router.animations";
import { environment } from "./../../../../environments/environment";

import {
    SwiperComponent,
    SwiperDirective,
    SwiperConfigInterface,
    SwiperScrollbarInterface,
    SwiperPaginationInterface,
} from "ngx-swiper-wrapper";

import "swiper/dist/css/swiper.min.css";
import { HttpClient } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { SearchService } from "src/app/search.service";
import { CartService } from "src/app/cart.service";
import { Subscription } from "rxjs";
import { FavoritesService } from "src/app/favorites.service";
declare global {
    interface Window { dataLayer: any[]; }
  }

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
    animations: [routerTransition()],
})
export class HomeComponent implements OnInit, OnDestroy {
    environment = environment;
    searchTerm: FormControl = new FormControl();
    products = <any>[];
    public cartItems = [];
    private categories: any[] = [];
    searching = false;
    public featured: any[];
    private store_id: string = "0";
    private subscription: Subscription;
    private searchSub: Subscription;
    private favoriteSub: Subscription;
    public favorites = [];
    id: number;
    public mode = "load";
    public configurations: SwiperConfigInterface = {
        direction: "horizontal",
        slidesPerView: "auto",
        keyboard: true,
        mousewheel: true,
        scrollbar: false,
        navigation: true,
        pagination: true,
    };

    public configurations2: SwiperConfigInterface = {
        slidesPerView: 5,
        spaceBetween: 0,
        pagination: {
            el: ".swiper-pagination",
        },
        breakpoints: {
            1024: {
                slidesPerView: 4,
                spaceBetween: 0,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 0,
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
            320: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
        },
    };

    constructor(
        private http: HttpClient,
        private service: SearchService,
        private cart: CartService,
        private favorite: FavoritesService
    ) {}

    public randomize(): void {}

    ngOnInit() {
        
        this.subscription = this.cart.cartItems.subscribe((res) => {
            this.cartItems = res.cart;
        });
        this.cart.getCartbyUserId();
        
        this.favoriteSub = this.favorite.favoritesChanged.subscribe((res) => {
            this.favorites = res;
        });
        this.favorite.getFavorites();

        this.searchSub = this.searchTerm.valueChanges.subscribe((term) => {
            if (term != "" && term.length > 2) {
                this.searching = true;
                this.service.search(term).subscribe((res: any) => {
                    if (typeof res == "string") {
                        this.products = res;
                    } else {
                        res.data.forEach((x, i) => {
                            if (x.type == 0) {
                                x.selected_option = 0;
                            }
                        });
                        this.searching = false;
                        this.products = res.data;
                        //console.log(data[0].BookName);
                    }
                });
            } else {
                this.searching = false;
                this.products = [];
            }
        });

        this.onGetStore(localStorage.getItem("storeId"));
        
    }

    onGetStore(id: string) {
        this.mode = "load";
        this.store_id = id;
        localStorage.setItem("storeId", id);
        this.http
            .get(environment.api_url + "categories/" + this.store_id)
            .subscribe((res: any) => {
                this.categories = res.data;
            });

        this.http
            .get(environment.api_url + "products/featured/" + this.store_id)
            .subscribe((res: any) => {
                //this.featured =
                res.data.forEach((x, i) => {
                    if (x.pivot.type == 0) {
                        x.selected_option = 0;
                    }
                });
                this.featured = res.data;
                //console.log(this.featured);
            });
            
            window.dataLayer.push({
                'event': 'storeVisit',
                'store_id': id
                });                
                  
            // fbq('track', 'StoreVisit', {store_id: id});
    }

    onChangeSearchedOption(event: any, i: number) {
        let option_index = event.target.selectedOptions[0].index;
        this.products[i].selected_option = option_index;
    }

    getSearchedProductPrice(id: string) {
        // console.log(this.products[id].price);
        let price =
            this.products[id].price +
            (this.products[id].type == 0
                ? this.products[id].options[this.products[id].selected_option]
                    ? this.products[id].options[
                          this.products[id].selected_option
                      ].pivot.price
                    : 0
                : 0);

        return price;
    }

    onSearchToCart(id: string) {
        let cartRow = this.cartItems.find(
            (product) => product.attributes.id == id
        );

        let product = this.products.find((product) => product.id == id);
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

    isString(val): boolean {
        return typeof val === "string";
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.searchSub.unsubscribe();
        this.favoriteSub.unsubscribe();
    }
}
