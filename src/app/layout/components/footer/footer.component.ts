import { Component, OnInit, HostBinding, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { CartService } from "src/app/cart.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit, OnDestroy {
    @HostBinding("style.top") marginTop: string;
    count = 0;
    private subscription: Subscription;
    constructor(private cart: CartService, public router: Router) {
        this.router.events.subscribe((val) => {});
    }

    ngOnInit() {
        this.subscription = this.cart.cartCount.subscribe((res) => {
            this.count = res;
        });
        const marginTops: any = document.querySelector(".footer").clientHeight;
        // this.marginTop = '-' + marginTops + 'px';
    }
    eventCalled() {}

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
