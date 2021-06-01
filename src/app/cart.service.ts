import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Swal from "sweetalert2";
import { Subject } from "rxjs";
import { environment } from "./../environments/environment";
declare global {
    interface Window { dataLayer: any[]; }
  }


@Injectable({
    providedIn: "root",
})
export class CartService {
    cartItems = new Subject<any>();
    cartCount = new Subject<number>();
    couponError = new Subject<string>();
    constructor(private http: HttpClient) {}

    addToCart(product: any) {
        let params: any = { product: product };
        if (localStorage.getItem("userId")) {
            params.userId = localStorage.getItem("userId");
        }

        this.http
            .post(environment.api_url + "cart/add", params)
            .subscribe((res: any) => {
                if (res.data.userId) {
                    localStorage.setItem("userId", res.data.userId);
                }

                this.cartItems.next(res.data);
                this.cartCount.next(res.data.cart.length);

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

                console.log(product);

                window.dataLayer.push({
                    'event': 'AddToCart',
                    'currency': 'INR',
                    'items' : [{
                        item_id: product.id,
                        item_name: product.name,                                        
                        price: product.price.toFixed(2),
                        currency: 'INR',
                        quantity: 1
                      }],
                    'value': product.price.toFixed(2)         
                    });
                    
                Toast.fire({
                    icon: "success",
                    title: "Product Added To Cart",
                });
            });
    }

    getCartbyUserId() {
        let params: any = {};
        if (localStorage.getItem("userId")) {
            params.userId = localStorage.getItem("userId");

            return this.http
                .post(environment.api_url + "cart", params)
                .subscribe((res: any) => {
                    this.cartItems.next(res.data);
                    this.cartCount.next(res.data.cart.length);
                });
        } else {
        }
    }

    removeFromCart(rowid: string) {
        let params = { id: rowid, userId: localStorage.getItem("userId") };
        this.http
            .post(environment.api_url + "cart/remove", params)
            .subscribe((res: any) => {
                this.cartItems.next(res.data);
                this.cartCount.next(res.data.cart.length);

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
                    title: "Product removed from cart",
                });
            });
    }

    updateQuantity(id: string, quantity: number) {
        let params = {
            id: id,
            userId: localStorage.getItem("userId"),
            quantity: quantity,
        };
        this.http
            .post(environment.api_url + "cart/updateQuantity", params)
            .subscribe((res: any) => {
                this.cartItems.next(res.data);
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
                    title: "Product quantity updated",
                });
                //this.cartCount.next(res.data.cart.length);
            });
    }

    applyCoupon(coupon: string) {
        let params = {
            userId: localStorage.getItem("userId"),
            coupon: coupon,
            type: "coupon",
            store_id: localStorage.getItem("storeId"),
        };
        this.http
            .post(environment.api_url + "cart/applycoupon", params)
            .subscribe((res: any) => {
                if (res.hasOwnProperty("coupon_error")) {
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: res.coupon_error,
                        showConfirmButton: false,
                        timer: 1000,
                    });

                    this.couponError.next(res.coupon_error);
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Coupon applied successfully",
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    this.cartItems.next(res.data);
                }
                //this.cartCount.next(res.data.cart.length);
            });
    }

    applyStoreCredit(){
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization:
                "Bearer " + localStorage.getItem("user_token"),
        });

        this.http
            .get(environment.api_url + "cart/applycredit", {headers: headers})
            .subscribe((res: any) => {
                if (res.hasOwnProperty("coupon_error")) {
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: res.coupon_error,
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    this.couponError.next(res.coupon_error);
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Store Credit applied successfully",
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    this.cartItems.next(res.data);
                }
                //this.cartCount.next(res.data.cart.length);
            });
    }

    clearCart() {
        let params = {
            userId: localStorage.getItem("userId"),
        };

        this.http
            .post(environment.api_url + "clear_cart", params)
            .subscribe((res: any) => {
                console.log(res);
                let obj = {
                    data: {
                        cart: [],
                        userId: localStorage.getItem("userId"),
                        subtotal: 0,
                        total: 0,
                        taxes: [],
                        discounts: 0,
                    },
                };
                this.cartItems.next(obj.data);
                this.cartCount.next(obj.data.cart.length);
                //this.cartCount.next(res.data.cart.length);
            });
    }
}
