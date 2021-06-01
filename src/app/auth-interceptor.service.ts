import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpHeaders
} from "@angular/common/http";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("user_token")
        });
        console.log("hello");
        const modifiedReq = req.clone({
            headers: headers
        });
        return next.handle(modifiedReq);
    }
}
