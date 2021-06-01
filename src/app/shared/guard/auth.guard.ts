import { Injectable } from "@angular/core";
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild
} from "@angular/router";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth-service";
//<this means resolves to>
@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private router: Router, private authService: AuthService) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService
            .isAuthenticated()
            .then((authenticated: boolean) => {
                if (authenticated) {
                    //console.log(true);
                    return true;
                    //               this.router.navigate(["/home"]);
                } else {
                    this.router.navigate(["/login"], {queryParamsHandling: 'merge'});
                }
            });
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(route, state);
    }
}
