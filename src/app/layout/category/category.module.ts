import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CategoryComponent } from "./category.component";

import { CategoryRoutingModule } from "./category-routing-module";
import { ProductsModule } from "../../products/products.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatInputModule } from "@angular/material";
import {
    NgbCarouselModule,
    NgbAlertModule,
    NgbDropdownModule,
    NgbTabsetModule
} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
    declarations: [CategoryComponent],
    imports: [
        CommonModule,
        ProductsModule,
        CategoryRoutingModule,
        NgbCarouselModule,
        NgbAlertModule,
        NgbDropdownModule,
        NgbTabsetModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        FormsModule
    ]
})
export class CategoryModule {}
