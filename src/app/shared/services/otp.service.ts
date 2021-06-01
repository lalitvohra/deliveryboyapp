import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class OtpService {
    generatedOtp = new Subject<string>();
    constructor(private http: HttpClient) {}

    generateOtp(number: string) {
        return this.http.post(environment.api_url + "generateotp", {
            phone: number,
        });
    }

    verifyOtp(number: string, otp: string) {
        return this.http.post(environment.api_url + "verifyotp", {
            phone: number,
            otp: otp,
        });
    }

    loginOtp(number: string) {
        return this.http.post(environment.api_url + "loginotp", {
            phone: number,
            store_id: localStorage.getItem("storeId"),
        });
    }

    verifyLoginOtp(number: string, otp: string) {
        return this.http.post(environment.api_url + "verifyloginotp", {
            phone: number,
            otp: otp,
            store_id: localStorage.getItem("storeId"),
        });
    }

    get(url: string) {
        return this.http.get(url);
    }
}
