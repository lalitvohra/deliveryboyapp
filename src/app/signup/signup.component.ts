import { Component, OnInit } from "@angular/core";
import { routerTransition } from "../router.animations";
import { NgForm } from "@angular/forms";
import { AuthService } from "../shared/services/auth-service";
import { OtpService } from "../shared/services/otp.service";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { FavoritesService } from "../favorites.service";
import { environment } from "./../../environments/environment";
declare global {
    interface Window { dataLayer: any[]; }
  }

@Component({
    selector: "app-signup",
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.scss"],
    animations: [routerTransition()],
})
export class SignupComponent implements OnInit {
    environment = environment;
    isVerifying = false;
    verifyBtnText = "VERIFY";
    //isNumberVerified = true;
    isNumberVerified = false;
    guestNumber: string;
    otpSent = false;
    utm_source: string;
    constructor(
        private auth: AuthService,
        private otp: OtpService,
        private router: Router,
        private favorites: FavoritesService,
        private route: ActivatedRoute,
    ) {
        this.route.queryParams.subscribe(params => {
            this.utm_source = params['utm_source'] && params['utm_source'] != null ? params['utm_source'] : 'Direct';
            console.log('check');
            console.log(this.utm_source);
        }); 
    }
    public errors = [];
    ngOnInit() {
        (document.querySelector(
            ".loader-screen"
        ) as HTMLElement).style.display = "none";
    }

    onSubmit(form: NgForm) {
        form.value.source = this.utm_source;        
        this.auth.signup(form.value, this.guestNumber).subscribe(
            (res: any) => {
                let prevSessionId = localStorage.getItem("userId");
                this.auth.replaceCart(prevSessionId, res.user_id);
                localStorage.setItem("user_token", res.token);
                localStorage.setItem("userId", res.user_id);
                this.favorites.mergeFavorites();

                let timerInterval;
                Swal.fire({
                    icon: "success",
                    title: "Sign up successful!",
                    html:
                        "You are now logged in. Redirecting in <b></b> milliseconds.",
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
                    window.dataLayer.push({
                        'event': 'CompleteRegistration'
                        });
                   
                    this.router.navigate(["/", "home"], {queryParamsHandling: 'merge'});
                });
            },
            (error) => {
                //console.log(error.error.error);
                this.errors = error.error.error;
            }
        );
    }

    redirecToLogin() {}

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
                //console.log(error);
                //console.log(error.error.error["phone"][0]);
                if (
                    error.error.error["phone"][0] ==
                    "The phone has already been taken."
                ) {
                    Swal.fire({
                        icon: "error",
                        title: "OTP INCORRECT",
                        text:
                            "An account already exists with this phone number",
                        footer: '<a href="/login">Sign In</a>',
                    });
                    this.verifyBtnText = "SENT";
                    this.isVerifying = false;
                    this.otpSent = false;
                    this.verifyBtnText = "VERIFY";
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
                    text: "You can now finalize signup",
                    //footer: '<a href>Why do I have this issue?</a>'
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "OTP INCORRECT",
                    text: "Enter the correct OTP or request again",
                    //footer: '<a href>Why do I have this issue?</a>'
                });
            }
        });
    }
}
