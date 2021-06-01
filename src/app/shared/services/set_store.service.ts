import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "./../../../environments/environment";
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
    providedIn: "root",
})
export class setStoreService {
    store_name: string;
    returnUrl: string;
    constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
        
    }
    setStore(store_id: any){
        const promise = new Promise((resolve, reject) => {
            this.http.get(environment.api_url + "store_name/"+store_id).subscribe((res: any) => {            
                if(res.store_name){
                    this.store_name = res.store_name;
                    localStorage.setItem("storeId", store_id);
                    localStorage.setItem("storeName", this.store_name);                   
                    resolve(true);
                } else {
                    resolve (false);
                }            
            },
            (errors) => {
                resolve(false);
            });
        });

        return promise;
        
    }
}
