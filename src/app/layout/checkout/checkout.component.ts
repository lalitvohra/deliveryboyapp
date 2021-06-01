import { Component, OnInit, ViewChild, OnDestroy, NgZone } from "@angular/core";
import { environment } from "./../../../environments/environment";
import { AuthService } from "src/app/shared/services/auth-service";
import { NgForm } from "@angular/forms";
import { OtpService } from "src/app/shared/services/otp.service";
import Swal from "sweetalert2";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Subscription } from "rxjs";
import { CartService } from "src/app/cart.service";
import { FavoritesService } from "src/app/favorites.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowRefService } from "src/app/window-ref.service";
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
declare global {
    interface Window { dataLayer: any[]; }
  }

@Component({
    selector: "app-checkout",
    templateUrl: "./checkout.component.html",
    styleUrls: ["./checkout.component.css"],
})
export class CheckoutComponent implements OnInit, OnDestroy {
    environment = environment;
    paymentSelected = 4;
    userLoggedIn = false;
    isNumberVerified = false; // to enable otp verification set isNumberVerified = false
    isVerifying = false;
    otpSent = false;
    showLoginForm = false;
    requirePassword = false;
    loginOtpRequested = false;
    verifyBtnText = "VERIFY";
    isLoginVerifying = false;
    verifyLoginBtnText = "GET OTP & LOGIN";
    checkingOut = false;
    guestNumber: string;
    time: any;
    private subscription: Subscription;
    public cartContents = {
        cart: [],
        subtotal: 0,
        total: 0,
        taxes: [],
        discounts: 0,
    };
    @ViewChild("checkout", { static: true }) signupForm: NgForm;
    utm_source: string;
    query_string: string;
    razorpay_order_id: string = null;
    //address form
    user_addresses = [];
    selected_address = "0";
    showAddressForm = false;
    savingAddressForm = false;

    constructor(
        private authSerivce: AuthService,
        private otp: OtpService,
        private http: HttpClient,
        private cart: CartService,
        private favorites: FavoritesService,
        private router: Router,
        private winRef: WindowRefService,
        private route: ActivatedRoute,
        private ngZone: NgZone
    ) {
        this.route.queryParams.subscribe(params => {
            this.utm_source = params['utm_source'] && params['utm_source'] !== null ? params['utm_source'] : 'Direct';
            let q_string = this.router.url.split('?')[1];
            if(q_string){
                this.query_string = q_string;
            } else {
                this.query_string = 'utm_source='+this.utm_source;
            }
            console.log(this.query_string);
            console.log(this.utm_source);
        });
    }

    ngOnInit() {
        this.authSerivce.isAuthenticated().then((authenticated: boolean) => {
            if (authenticated) {
                this.userLoggedIn = true;
                //get user addresses
                let myheaders = new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("user_token")
                });
                
                this.http
            .get(environment.api_url + "user/addresses",  {headers: myheaders})
            .subscribe((res: any) => {                
                this.user_addresses = res;
                this.selected_address = "0";
            });
            //get user addresses;
            } else {
                this.userLoggedIn = false;
            }
        });

        this.subscription = this.cart.cartItems.subscribe((res) => {
            this.cartContents = res;
            let ga_items = [];
            this.cartContents.cart.forEach((x) => {
                let item_obj = {
                    'item_id' : x.attributes.id,
                    'item_name': x.name,
                    'item_variant': x.attributes.option ? x.attributes.option : 'none',
                    'price' : x.price,
                    'currency' : 'INR',
                    'quantity' : x.quantity
                }
                ga_items.push(item_obj);
            });
            window.dataLayer.push({
                'event': 'InitiateCheckout',
                'currency' : 'INR',
                'items' : ga_items,
                'value' : this.cartContents.total
                });
        });
        this.cart.getCartbyUserId();
        this.time = new Date().getHours();
        // let d = new Date();
        // d.setHours(17);
        // this.time = d.getHours();

        

       
    }

    selectPayment(option: number) {
        //console.log(option);
        this.paymentSelected = option;
    }

    onSubmit(form: NgForm) {
        let phone = +form.value.number;
        if (isNaN(phone)) {

            Swal.fire({
                icon: "error",
                title: "PLEASE CHECK PHONE NUMBER",
                text:
                    "Phone number cannot be empty and can only contain digits",
                //footer: '<a href>Why do I have this issue?</a>'
            });

            return false;
        }
        
        this.checkingOut = true;
        if(form.value.newPassword){
            this.checkForExistingAccount(form.value.number).subscribe(
                (res: any) => {if(res){
                    Swal.fire({
                        icon: "error",
                        title: "PHONE NUMBER EXISTS",
                        text:
                            "We already have an account with this phone numner. Try logging in or tick off create an account to checkout as a guest",
                        //footer: '<a href>Why do I have this issue?</a>'
                    });
                    this.checkingOut = false;
                    return false;
                   }else{
                    this.checkoutGuest(form);
                    return true;
                   }
                                        },
                (error) => {                   
                    console.log(error);
                }
            );            
        } else {
            this.checkoutGuest(form);
        }        
        
    }

    checkoutGuest(form: NgForm){
        let name = form.value.name;
        let address = form.value.address;
        const email = form.value.email;
        let userId = localStorage.getItem("userId");
        let password = form.value.newPassword;
        
        //removed otp verification
        this.guestNumber = form.value.number;
        //removed otp verification

        if(this.razorpay_order_id){
            this.http
            .post(environment.api_url + "order/order_details", {
                r_order_id: this.razorpay_order_id
            })
            .subscribe(
                (res: any) => {
                    this.checkingOut = false;
                    if (this.paymentSelected == 4) {
                        this.payWithRazor(
                            res.order.razorpay_order_id,
                            res.order.order_total,
                            email,
                            this.guestNumber
                        );
                    } else {
                        this.convertToCod(res.order.id);
                    }                   
                },
                (error) => {
                    console.log(error);
                }
            );
        } else {
            this.http
            .post(environment.api_url + "order/guestcreate", {
                userId: userId,
                store_id: localStorage.getItem("storeId"),
                name: name,
                phone: this.guestNumber,
                email: email,
                address: address,
                password: password ? password : "",
                source: this.utm_source,
                createaccount: password ? 1 : 2,
                payment_method: this.paymentSelected,
            })
            .subscribe(
                (res: any) => {
                    this.checkingOut = false;
                    this.razorpay_order_id = res.razorpay_order_id;
                    if (res.hasOwnProperty("token")) {
                        localStorage.setItem("user_token", res.token);
                        localStorage.setItem("userId", res.user_id);
                        this.favorites.mergeFavorites();
                        this.userLoggedIn = true;
                        //
                        if (this.paymentSelected == 4) {
                            this.payWithRazor(
                                res.razorpay_order_id,
                                res.order_total,
                                email,
                                this.guestNumber
                            );
                        } else {
                            this.showOrderReceivedPopup(false, res.order_total, res.order);
                        }
                        //
                    } else {
                        //
                        if (this.paymentSelected == 4) {
                            this.payWithRazor(
                                res.razorpay_order_id,
                                res.order_total,
                                email,
                                this.guestNumber
                            );
                        } else {
                            this.showOrderReceivedPopup(false, res.order_total, res.order);
                        }
                        //
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
        }
        
        
    }

    convertToCod(order_id: number){
        this.http
            .post(environment.api_url + "order/convert_to_cod", {
                order_id: order_id
            })
            .subscribe(
                (res: any) => {
                    this.checkingOut = false;
                    if(res.success){
                        this.showOrderReceivedPopup(false, res.order.amount, res.order);
                    }                  
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    onLoginSubmit(form: NgForm) {
        let prevSessionId = localStorage.getItem("userId");
        form.value.number = form.value.userNumber;
        form.value.password = form.value.userPassword;
        this.authSerivce.login(form.value).subscribe(
            (res: any) => {
                this.authSerivce.replaceCart(prevSessionId, res.user_id);
                localStorage.setItem("user_token", res.token);
                localStorage.setItem("userId", res.user_id);
                this.favorites.mergeFavorites();
                this.userLoggedIn = true;
                Swal.fire({
                    icon: "success",
                    title: "Logged In",
                    text: "You are now logged in, please proceed",
                });
            },
            (error) => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.error.error,
                    //footer: '<a href>Why do I have this issue?</a>'
                });
            }
        );
    }

    verifyNumber(number: HTMLInputElement) {
        this.isVerifying = true;
        this.verifyBtnText = "SENDING OTP";

        this.otp.generateOtp(number.value).subscribe(
            (res: any) => {
                //console.log(res);
                if (res.generated == "true") {
                    this.verifyBtnText = "SENT";
                    this.isVerifying = false;
                    this.otpSent = true;
                    setTimeout(() => {
                        this.verifyBtnText = "RESEND";
                    }, 1000);
                }
            },
            (error) => {
                this.isVerifying = false;
                this.verifyBtnText = "SEND";
                console.log(error);
                console.log(error.error.error);
                if (
                    error.error.error.phone[0] ==
                    "The phone has already been taken."
                ) {
                    Swal.fire({
                        icon: "error",
                        title: "PHONE NUMBER TAKEN",
                        text:
                            "This phone number already exists. Please try to login",
                        //footer: '<a href>Why do I have this issue?</a>'
                    });
                }
            }
        );
    }

    onCodeCompleted(code: string, number: HTMLInputElement) {
        this.otp.verifyOtp(number.value, code).subscribe((res: any) => {
            if (res.verified == "true") {
                this.isNumberVerified = true;
                this.guestNumber = number.value;
                Swal.fire({
                    icon: "success",
                    title: "OTP VERIFIED",
                    text: "You can now finalize your order",
                    //footer: '<a href>Why do I have this issue?</a>'
                });
            } else {
            }
        });
    }

    onClickIHaveAccount() {
        this.showLoginForm = !this.showLoginForm;
    }

    createAccount(event) {
        if (event.target.checked) {
            this.requirePassword = true;
        } else {
            this.requirePassword = false;
        }
    }

    otpForLogin(number: HTMLInputElement) {
        if (isNaN(+number.value)) {
            return false;
        }
        this.isLoginVerifying = true;
        this.verifyLoginBtnText = "SENDING OTP";
        this.loginOtpRequested = true;
        this.otp.loginOtp(number.value).subscribe(
            (res: any) => {
                console.log(res);
                if (res.generated == true) {
                    this.verifyLoginBtnText = "SENT";
                    this.isLoginVerifying = false;
                    setTimeout(() => {
                        this.verifyLoginBtnText = "RESEND";
                    }, 1000);
                }
            },
            (error) => {
                this.isLoginVerifying = false;
                this.loginOtpRequested = false;
                this.verifyLoginBtnText = "GET OTP & LOGIN";
                if (error.error.error == "user not found") {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text:
                            "We cant find your number, please check your number or signup",
                        //footer: '<a href>Why do I have this issue?</a>'
                    });
                }
            }
        );
    }

    onLoginCodeCompleted(code: string, number: HTMLInputElement) {
        this.otp.verifyLoginOtp(number.value, code).subscribe(
            (res: any) => {
                if (res.hasOwnProperty("verified") && res.verified == "false") {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text:
                            "OTP incorrect, please reenter or request a new OTP",
                        //footer: '<a href>Why do I have this issue?</a>'
                    });
                }

                if (res.hasOwnProperty("token")) {
                    this.authSerivce.replaceCart(
                        localStorage.getItem("userId"),
                        res.user_id
                    );
                    localStorage.setItem("user_token", res.token);
                    localStorage.setItem("userId", res.user_id);
                    this.favorites.mergeFavorites();
                    this.userLoggedIn = true;
                    Swal.fire({
                        icon: "success",
                        title: "Logged In",
                        text: "You are now logged in, please proceed",
                        //footer: '<a href>Why do I have this issue?</a>'
                    });
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }

    checkoutUser() {
        //console.log(this.selected_address);
        let address_id = this.selected_address;
        this.checkingOut = true;
        
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("user_token"),
        });

        if(this.razorpay_order_id){
            this.http
            .post(environment.api_url + "order/order_details", {
                r_order_id: this.razorpay_order_id
            })
            .subscribe(
                (res: any) => {
                    this.checkingOut = false;
                    if (this.paymentSelected == 4) {
                        this.payWithRazor(
                            res.order.razorpay_order_id,
                            res.order.order_total,
                            res.order.email,
                            res.order.phone_number
                        );
                    } else {
                        return this.convertToCod(res.order.id);
                    }                   
                },
                (error) => {
                    console.log(error);
                }
            );
        } else {
            this.http
            .post(
                environment.api_url + "order/create",
                {
                    userId: localStorage.getItem("userId"),
                    store_id: localStorage.getItem("storeId"),
                    payment_method: this.paymentSelected,
                    address_id: address_id
                },
                { headers: headers }
            )
            .subscribe(
                (res: any) => {
                    this.razorpay_order_id = res.razorpay_order_id
                    this.checkingOut = false;
                    let email = res.email;
                    let phone = res.phone;
                    if (this.paymentSelected == 4) {
                        this.payWithRazor(
                            res.razorpay_order_id,
                            res.order_total,
                            email,
                            phone
                        );
                    } else {
                        this.showOrderReceivedPopup(false, res.order_total, res.order);
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
        }        
    }

    payWithRazor(
        val: string,
        order_total: number,
        email: string,
        phone: string
    ) {
        const options: any = {
            //key: "rzp_live_FNeJU4sH7AfniF", //live key
            key: environment.razorpay_api_key,
            amount: order_total * 100, // amount should be in paise format to display Rs 1255 without decimal point
            currency: "INR",
            name: "ORDER", // company name or product name
            description: "Your order on FPS", // product description
            image: "./assets/images/logo.png", // company logo or product image
            order_id: val, // order_id created by you in backend
            prefill: {
                email: email,
                contact: phone,
            },
            modal: {
                // We should prevent closing of the form when esc key is pressed.
                escape: false,
            },
            notes: {
                // include notes if any
            },
            theme: {
                color: "#dd015b",
            },
        };

        options.callback_url = environment.url+'order/response/?'+ this.query_string;       
        options.redirect = true;

        options.handler = (response, error) => {
            options.response = response;
            // console.log(response);
            //console.log(options);

            this.http
                .post(environment.api_url + "order/verify_payment", {
                    userId: localStorage.getItem("userId"),
                    storeId: localStorage.getItem("storeId"),
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    amount: options.amount,
                })
                .subscribe(
                    (res: any) => {
                        console.log(res);
                        if (res.verified == true) {
                            this.showOrderReceivedPopup(true, order_total, res.order);
                        } else {
                            this.showPaymentNotVerifiedPopup();
                        }
                    },
                    (error) => {
                        this.showPaymentNotVerifiedPopup();
                    }
                );

            // call your backend api to verify payment signature & capture transaction
        };
        options.modal.ondismiss = () => {
            // handle the case when user closes the form while transaction is in progress
            console.log("Transaction cancelled.");
            //this.showPaymentNotVerifiedPopup();
        };
        const rzp = new this.winRef.nativeWindow.Razorpay(options);
        rzp.open();
    }

    showOrderReceivedPopup(paid: boolean, amount?: number, order?: any) {
        let timerInterval;
        Swal.fire({
            icon: "success",
            title: "Order Received!",
            html: paid
                ? "Your order is confirmed. Redirecting in <b></b> milliseconds."
                : "We will call you to confirm the order. Redirecting in <b></b> milliseconds.",
            timer: 4000,
            timerProgressBar: true,
            onBeforeOpen: () => {
                Swal.showLoading();
                timerInterval = setInterval(() => {
                    const content = Swal.getContent();
                    if (content) {
                        const b: any = content.querySelector("b");
                        if (b) {
                            b.textContent = Swal.getTimerLeft();
                        }
                    }
                }, 100);
            },
            onClose: () => {
                clearInterval(timerInterval);
            },
        }).then((result) => {
          
            let ga_items = [];

            order.products.forEach(x => {
                let prod_obj = {
                    item_id : x.id,
                    item_name: x.name,
                    item_variant: x.pivot.option_selected,
                    price: x.pivot.price,
                    currency: 'INR',
                    quantity: x.pivot.quantity
                }

                ga_items.push(prod_obj);
            });

            let dataLayerObject: any = {
                'event': 'Purchase',
                'value': order.total ? order.total : 0,
                'currency': 'INR',                 
                'items': ga_items,
                'transaction_id': order.id  
                }

            if(order.discounts.length !== 0){
                dataLayerObject.coupon = order.discounts[0].code;
            }

            window.dataLayer.push(dataLayerObject);           
            this.ngZone.run(() => this.router.navigate(["/", "home"], {queryParamsHandling: 'merge'}));
        });
    }

    showPaymentNotVerifiedPopup() {
        let timerInterval;
        Swal.fire({
            icon: "error",
            title: "Payment not verified",
            html:
                "Your payment could not be verified. Please contact support. Redirecting in <b></b> milliseconds.",
            timer: 4000,
            timerProgressBar: true,
            onBeforeOpen: () => {
                Swal.showLoading();
                timerInterval = setInterval(() => {
                    const content = Swal.getContent();
                    if (content) {
                        const b: any = content.querySelector("b");
                        if (b) {
                            b.textContent = Swal.getTimerLeft();
                        }
                    }
                }, 100);
            },
            onClose: () => {
                clearInterval(timerInterval);
            },
        }).then((result) => {
            this.ngZone.run(() => this.router.navigate(["/", "home"], {queryParamsHandling: 'merge'}));
        });
    }

    checkForExistingAccount(number: string){  
        return this.http
                .post(environment.api_url + "order/check_user", {
                    phone: number,
                });                
    }

    onCancelAddressSubmit(){
        this.showAddressForm = false;
    }

    onShowAddressForm(){
        this.showAddressForm = true;
    }

    onAddressSubmit(form: NgForm){
        this.showAddressForm = false;
        this.savingAddressForm = true;

       
        let new_address = form.value.newAddress;
        let new_name = form.value.newName;
        let new_phone = form.value.newPhone;
        let myheaders = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("user_token")
        });
        let params = {
            address : new_address,
            name : new_name,
            phone : new_phone
        };
        this.http
    .post(environment.api_url + "user/add_address", params, {headers: myheaders})
    .subscribe((res: any) => {                
        this.user_addresses.push(res);
        this.selected_address = '' + res.id;
        this.savingAddressForm = false;   
    });
    }

  
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
