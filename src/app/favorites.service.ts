import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { AuthService } from "./shared/services/auth-service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "./../environments/environment";
declare global {
    interface Window { dataLayer: any[]; }
  }

@Injectable({
    providedIn: "root",
})
export class FavoritesService {
    favoritesChanged = new Subject<any>();
    favorites = [];
    constructor(private auth: AuthService, private http: HttpClient) {}

    addToFavorites(id: number) {
        this.favorites.push(id);
        this.favoritesChanged.next(this.favorites);
        
        this.auth.isAuthenticated().then((authenticated: boolean) => {
            if (authenticated) {
                const headers = new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + localStorage.getItem("user_token"),
                });
                this.http
                    .post(
                        environment.api_url + "user/updatefavorites",
                        {
                            favorites: this.favorites,
                        },
                        {
                            headers: headers,
                        }
                    )
                    .subscribe((res: any) => {
                        
                        console.log(res);
                    });
            } else {
                
                localStorage.setItem(
                    "favorites",
                    JSON.stringify(this.favorites)
                );
            }
        });

        window.dataLayer.push({
            'event': 'AddToWishlist'
            });
    }

    removeFromFavorites(id: number) {
        this.favorites.splice(id, 1);
        this.favoritesChanged.next(this.favorites);
        this.auth.isAuthenticated().then((authenticated: boolean) => {
            if (authenticated) {
                const headers = new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + localStorage.getItem("user_token"),
                });
                this.http
                    .post(
                        environment.api_url + "user/updatefavorites",
                        {
                            favorites: this.favorites,
                        },
                        {
                            headers: headers,
                        }
                    )
                    .subscribe((res: any) => {
                        console.log(res);
                    });
            } else {
                localStorage.setItem(
                    "favorites",
                    JSON.stringify(this.favorites)
                );
            }
        });
    }

    getFavorites() {
        this.auth.isAuthenticated().then((authenticated: boolean) => {
            if (authenticated) {
                const headers = new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + localStorage.getItem("user_token"),
                });
                this.http
                    .get(environment.api_url + "user/favorites", {
                        headers: headers,
                    })
                    .subscribe((res: any) => {
                        this.favorites = res;
                        this.favoritesChanged.next(this.favorites);
                    });
            } else {
                if (localStorage.getItem("favorites")) {
                    this.favorites = JSON.parse(
                        localStorage.getItem("favorites")
                    );
                    this.favoritesChanged.next(this.favorites);
                } else {
                    localStorage.setItem(
                        "favorites",
                        JSON.stringify(this.favorites)
                    );
                    this.favoritesChanged.next(this.favorites);
                }
            }
        });
    }

    mergeFavorites() {
        let favorites = JSON.parse(localStorage.getItem("favorites"));
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("user_token"),
        });
        this.http
            .post(
                environment.api_url + "user/mergefavorites",
                {
                    favorites: favorites,
                },
                {
                    headers: headers,
                }
            )
            .subscribe((res: any) => {
                localStorage.setItem("favorites", "");
            });
    }
}
