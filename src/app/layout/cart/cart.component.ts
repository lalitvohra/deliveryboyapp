import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { routerTransition } from "../../router.animations";
import { CartService } from "src/app/cart.service";
import { Subscription } from "rxjs";
import { NgForm } from "@angular/forms";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FavoritesService } from "src/app/favorites.service";
import { environment } from "./../../../environments/environment";
import { AuthService } from 'src/app/shared/services/auth-service';

declare var $: any;

@Component({
    selector: "app-cart",
    templateUrl: "./cart.component.html",
    styleUrls: ["./cart.component.scss"],
    animations: [routerTransition()],
})
export class CartComponent implements OnInit, OnDestroy {
    environment = environment;
    @ViewChild("f", { static: false }) couponForm: NgForm;
    public cartContents = {
        cart: [],
        subtotal: 0,
        total: 0,
        taxes: [],
        discounts: 0,
        credit_applied: 0,
    };
    public relatedProducts = [];
    private subscription: Subscription;
    public favorites = [];
    private favoriteSub: Subscription;
    private couponErrorSubscription: Subscription;
    public couponError: string;
    public visibleCoupons = [];

    storeCredit = 0;
    userLoggedIn = false;
    applicableCredit = 0;
    storeCreditApplied = false;

    constructor(
        private cart: CartService,
        private http: HttpClient,
        private favorite: FavoritesService,
        private authSerivce: AuthService
    ) {}
    ngOnInit() {

        this.authSerivce.isAuthenticated().then((authenticated: boolean) => {
            if (authenticated) {
                this.userLoggedIn = true;
                this.getStoreCredit();                
            } else {
                this.userLoggedIn = false;
            }
        });

        this.subscription = this.cart.cartItems.subscribe((res) => {
            this.cartContents = res;
            this.calculateApplicableCredit();
            let params = {
                store_id: localStorage.getItem("storeId"),
                product_ids: Array.from(
                    this.cartContents.cart,
                    (x) => x.attributes.id
                ),
            };

            this.http
                .post(environment.api_url + "cart/related", params)
                .subscribe((res: any) => {
                    res.data.forEach((x, i) => {
                        if (x.pivot.type == 0) {
                            x.selected_option = 0;
                        }
                    });
                    this.relatedProducts = res.data;
                });

                let cParams = {
                    store_id : localStorage.getItem("storeId")
                };

                this.http
                .post(environment.api_url + "visiblecoupons", cParams)
                .subscribe((res: any) => {
                    this.visibleCoupons = res.data;    
                });
        });

        this.cart.getCartbyUserId();
        this.couponErrorSubscription = this.cart.couponError.subscribe(
            (res) => {
                this.couponError = res;
            }
        );

        this.favoriteSub = this.favorite.favoritesChanged.subscribe((res) => {
            this.favorites = res;
        });
        this.favorite.getFavorites();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.couponErrorSubscription.unsubscribe();
        this.favoriteSub.unsubscribe();
    }

    onRemoveItem(rowid: string) {
        this.cart.removeFromCart(rowid);
    }

    onReduceQuantity(id: string) {
        this.cart.updateQuantity(id, -1);
    }

    onIncreaseQuantity(id: string) {
        //console.log(id);

        this.cart.updateQuantity(id, 1);
    }

    onSubmit() {
        let coupon = this.couponForm.value.coupon;
        console.log(coupon);
        this.cart.applyCoupon(coupon);
    }

    onChangeCoupon() {
        this.couponError = null;
    }

    onApplyCouponFromList(coupon: string){
        this.couponError = null;
        this.cart.applyCoupon(coupon);
    }

    getStoreCredit(): any {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization:
                "Bearer " + localStorage.getItem("user_token"),
        });
        this.http
                .get(environment.api_url + "user/get_store_credit", {
                    headers: headers,
                })
                .subscribe((res: any) => {                    
                    this.storeCredit = res.store_credit;
                    this.calculateApplicableCredit();   
                });
    }


    onApplyStoreCredit(){
        this.cart.applyStoreCredit();
    }

    calculateApplicableCredit(){
        //console.log(this.cartContents.credit_applied);
        if(this.cartContents.credit_applied > 0){
            this.storeCreditApplied = true;
        } else {
            this.storeCreditApplied = false;
        }
        this.applicableCredit = (this.cartContents.total - this.storeCredit) < 1001 ? this.cartContents.total - 1001 : this.storeCredit; 
       
    }

    // onChangeOption(event: Event, i: number) {
    //     //this.featured[i].pivot.price = event.target.selectedOption;
    //     let option_index = event.target.selectedOptions[0].index;
    //     this.relatedProducts[i].selected_option = option_index;
    // }

    // getProductPrice(id: string) {
    //     let price =
    //         this.relatedProducts[id].pivot.price +
    //         (this.relatedProducts[id].pivot.type == 0
    //             ? this.relatedProducts[id].options[
    //                   this.relatedProducts[id].selected_option
    //               ].pivot.price
    //             : 0);

    //     return price;
    // }

    // onRelatedToCart(id: string) {
    //     let cartRow = this.cartContents.cart.find(
    //         product => product.attributes.id == id
    //     );

    //     let product = this.relatedProducts.find(product => product.id == id);
    //     if (product.pivot.type == 1) {
    //         if (cartRow) {
    //             this.cart.updateQuantity(cartRow.id, 1);
    //         } else {
    //             let attributes: any = { id: product.id };
    //             let price = product.pivot.price;
    //             let add_product = {
    //                 id: product.id,
    //                 name: product.name,
    //                 price: price,
    //                 quantity: 1,
    //                 attributes: attributes
    //             };

    //             this.cart.addToCart(add_product);
    //         }
    //     } else {
    //         if (
    //             cartRow &&
    //             cartRow.attributes.option ==
    //                 product.options[product.selected_option].name
    //         ) {
    //             this.cart.updateQuantity(cartRow.id, 1);
    //         } else {
    //             let attributes: any = { id: product.id };
    //             let price = product.pivot.price;
    //             attributes.option =
    //                 product.options[product.selected_option].name;
    //             price += product.options[product.selected_option].pivot.price;

    //             let add_product = {
    //                 id: product.id,
    //                 name: product.name,
    //                 price: price,
    //                 quantity: 1,
    //                 attributes: attributes
    //             };

    //             this.cart.addToCart(add_product);
    //         }
    //     }
    // }
}
