import { Injectable } from "@angular/core";
import { environment } from "./../environments/environment";
import { map } from "rxjs/operators";
import { debounceTime } from "rxjs/internal/operators/debounceTime";
import { HttpClient } from "@angular/common/http";
declare global {
    interface Window { dataLayer: any[]; }
  }

@Injectable({
    providedIn: "root",
})
export class SearchService {
    constructor(private httpService: HttpClient) {}

    search(term: string, category?: string) {
        var products = this.httpService
            .get(environment.api_url + "products/search", {
                params: {
                    store: localStorage.getItem("storeId"),
                    search: term,
                    category: category ? category : "0",
                },
            })
            .pipe(
                debounceTime(500), // WAIT FOR 500 MILISECONDS ATER EACH KEY STROKE.
                map((data: any) => {
                    //console.log(data);
                    if(data.data.length != 0){
                        window.dataLayer.push({
                            'event': 'search',
                            'search_term': term
                        });
                    } else {
                        window.dataLayer.push({
                            'event': 'no_search_results',
                            'search_term': term
                        });
                    }
                    return data.data.length != 0
                        ? (data as any[])
                        : "No Results";
                })
            );

        return products;
    }
}
