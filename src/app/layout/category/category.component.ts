import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { routerTransition } from "../../router.animations";
import { HttpClient } from "@angular/common/http";
import { CartService } from "../../cart.service";
import { Subscription } from "rxjs";
import { FavoritesService } from "../../favorites.service";
import { ActivatedRoute } from "@angular/router";
import { environment } from "./../../../environments/environment";
import { FormControl } from "@angular/forms";
import { SearchService } from "src/app/search.service";

@Component({
    selector: "app-category",
    templateUrl: "./category.component.html",
    styleUrls: ["./category.component.css"],
    animations: [routerTransition()],
})
export class CategoryComponent implements OnInit, OnDestroy {
    environment = environment;
    @HostListener("window:scroll", ["$event"])
    onWindowScroll() {
        // let pos =
        //     (document.documentElement.scrollTop || document.body.scrollTop) +
        //     document.documentElement.offsetHeight;
        // let max = document.documentElement.scrollHeight;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            if (this.isLoading == false && this.reachedEnd == false) {
                this.onLoadMore();
            }
        }
    }
    //search
    searchTerm: FormControl = new FormControl();
    products = <any>[];

    searchSub: Subscription;
    //search ends
    public isLoading = false;
    public category: any = {};
    public cartItems = [];
    public categoryProducts: any[];
    private subscription: Subscription;
    private favoriteSub: Subscription;
    private nextUrl: string;
    reachedEnd = false;
    private favoritesArray = [];
    public slug: string;
    constructor(
        private http: HttpClient,
        private cart: CartService,
        private favorite: FavoritesService,
        private route: ActivatedRoute,
        private service: SearchService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.slug = params["slug"];
            let parameters = {
                store_id: localStorage.getItem("storeId"),
                slug: this.slug,
            };
            this.http
                .post(environment.api_url + "category/products", parameters)
                .subscribe((res: any) => {
                    console.log(res);
                    res.products.data.forEach((x, i) => {
                        if (x.pivot.type == 0) {
                            x.selected_option = 0;
                        }
                    });

                    this.categoryProducts = res.products.data;
                    this.nextUrl = res.products.next_page_url;
                    this.category = res.category;
                    // this.from = res.from;
                    // this.last_page = res.last_page;
                    // var foo = [];
                    // for (var i = 1; i <= N; i++) {
                    // foo.push(i);
                    // }
                });
        });

        this.searchSub = this.searchTerm.valueChanges.subscribe((term) => {
            if (term != "") {
                this.service
                    .search(term, this.category.id)
                    .subscribe((res: any) => {
                        res.data.forEach((x, i) => {
                            if (x.type == 0) {
                                x.selected_option = 0;
                            }
                        });

                        this.products = res.data;
                        //console.log(data[0].BookName);
                    });
            } else {
                this.products = [];
            }
        });

        this.subscription = this.cart.cartItems.subscribe((res) => {
            this.cartItems = res.cart;
        });
        this.cart.getCartbyUserId();

        this.favoriteSub = this.favorite.favoritesChanged.subscribe((res) => {
            this.favoritesArray = res;
        });

        this.favorite.getFavorites();
    }

    onChangeSearchedOption(event: any, i: number) {
        let option_index = event.target.selectedOptions[0].index;
        this.products[i].selected_option = option_index;
    }

    getSearchedProductPrice(id: string) {
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

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.favoriteSub.unsubscribe();
        this.searchSub.unsubscribe();
    }

    onLoadMore() {
        this.isLoading = true;
        if (this.nextUrl == null) {
            this.reachedEnd = true;
            this.isLoading = false;
        } else {
            let parameters = {
                store_id: localStorage.getItem("storeId"),
                slug: this.slug,
            };
            this.http.post(this.nextUrl, parameters).subscribe((res: any) => {
                res.products.data.forEach((x, i) => {
                    if (x.pivot.type == 0) {
                        x.selected_option = 0;
                    }
                });
                this.categoryProducts.push(...res.products.data);
                this.nextUrl = res.products.next_page_url;
                this.isLoading = false;
            });
        }
    }
}
