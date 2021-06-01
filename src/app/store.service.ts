import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})
export class StoreService {
    storeChanged = new Subject<any>();
    constructor(private http: HttpClient) {}

    getStore() {
        if (localStorage.getItem("storeId")) {
            this.storeChanged.next(localStorage.getItem("storeId"));
        } else {
            this.storeChanged.next(0);
        }
    }
}
