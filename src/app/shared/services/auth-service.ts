import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    loggedIn = false;
    constructor(private http: HttpClient) {}
    isAuthenticated() {
        const promise = new Promise((resolve, reject) => {
            if (localStorage.getItem("user_token")) {
                const headers = new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + localStorage.getItem("user_token"),
                });
                this.http
                    .get(environment.api_url + "check/", {
                        headers: headers,
                    })
                    .subscribe(
                        (res: any) => {
                            resolve(true);
                        },
                        (errors) => {
                            resolve(false);
                        }
                    );
            } else {
                resolve(false);
            }
        });

        return promise;
    }

    signup(form, number: string) {
        console.log(form);
        return this.http.post(environment.api_url + "airlock/register", {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: number,
            address: form.address ? form.address : "",
            store_id: 1,
            source: form.source
        });
    }

    login(form) {
        console.log(form);
        return this.http.post(environment.api_url + "airlock/token", {
            phone: form.number,
            password: form.password,
            store_id: 1,
        });
    }

    // login() {
    //     this.loggedIn = true;
    // }

    loggedOut() {
        this.loggedIn = false;
    }

    replaceCart(previousSessionId: any, userId: string) {
        this.http
            .post(environment.api_url + "replacecart", {
                previousSessionId: previousSessionId,
                userId: userId,
            })
            .subscribe((res) => {
                console.log(res);
            });
    }
}
