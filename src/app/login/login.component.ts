import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { routerTransition } from "../router.animations";
import { NgForm } from "@angular/forms";
import { AuthService } from "../shared/services/auth-service";
import { OtpService } from "../shared/services/otp.service";
import Swal from "sweetalert2";
import { FavoritesService } from "../favorites.service";
import { Subscription } from "rxjs";
import { environment } from "./../../environments/environment";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    animations: [routerTransition()],
})
export class LoginComponent implements OnInit {
    environment = environment;
    isLoginMode = true;
    errors = [];
    isLoginVerifying = false;
    verifyLoginBtnText = "GET OTP & LOGIN";
    loginOtpRequested = false;

    // @ViewChild("f", { static: false }) couponForm: NgForm;
    constructor(
        public router: Router,
        private auth: AuthService,
        private otp: OtpService,
        private favorites: FavoritesService
    ) {}

    ngOnInit() {
        (document.querySelector(
            ".loader-screen"
        ) as HTMLElement).style.display = "none";
    }

    onLoggedin() {
        localStorage.setItem("isLoggedin", "true");
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onChange() {
        this.errors = [];
    }

    onSubmit(form: NgForm) {
        this.errors = [];
        this.auth.login(form.value).subscribe(
            (res: any) => {
                this.auth.replaceCart(
                    localStorage.getItem("userId"),
                    res.user_id
                );
                localStorage.setItem("user_token", res.token);
                localStorage.setItem("userId", res.user_id);
                this.router.navigate(["/profile"], {queryParamsHandling: 'merge'});
            },
            (error) => {
                if (Array.isArray(error.error.error)) {
                    this.errors = error.error.error;
                } else {
                    this.errors.push(error.error.error);
                }
            }
        );
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
                    this.auth.replaceCart(
                        localStorage.getItem("userId"),
                        res.user_id
                    );
                    localStorage.setItem("user_token", res.token);
                    localStorage.setItem("userId", res.user_id);
                    this.isLoginMode = false;
                    this.router.navigate(["/profile"], {queryParamsHandling: 'merge'});
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }
}
