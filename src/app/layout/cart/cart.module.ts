import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    NgbCarouselModule,
    NgbAlertModule,
    NgbDropdownModule,
    NgbTabsetModule
} from "@ng-bootstrap/ng-bootstrap";

import { CartsModule } from "./cart-routing.module";
import { CartComponent } from "./cart.component";
import { StatModule } from "../../shared";
import { FormsModule } from "@angular/forms";
import { ProductsModule } from "../../products/products.module";

@NgModule({
    imports: [
        CommonModule,
        NgbCarouselModule,
        NgbAlertModule,
        CartsModule,
        StatModule,
        NgbDropdownModule,
        NgbTabsetModule,
        FormsModule,
        ProductsModule
    ],
    declarations: [CartComponent]
})
export class CartModule {}
