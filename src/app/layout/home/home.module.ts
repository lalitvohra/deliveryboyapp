import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    NgbCarouselModule,
    NgbAlertModule,
    NgbDropdownModule,
    NgbTabsetModule
} from "@ng-bootstrap/ng-bootstrap";
import {
    SwiperModule,
    SwiperConfigInterface,
    SWIPER_CONFIG
} from "ngx-swiper-wrapper";
import { HomeRoutingModule } from "./home/home-routing-module";
import { StatModule } from "../../shared";
import { HomeComponent } from "./home/home.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatInputModule } from "@angular/material";
import { ProductsModule } from "../../products/products.module";

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {};

@NgModule({
    imports: [
        CommonModule,
        NgbCarouselModule,
        NgbAlertModule,
        HomeRoutingModule,
        StatModule,
        NgbDropdownModule,
        NgbTabsetModule,
        SwiperModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        FormsModule,
        ProductsModule
    ],
    declarations: [HomeComponent],
    providers: [
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG
        }
    ]
})
export class HomeModule {}
