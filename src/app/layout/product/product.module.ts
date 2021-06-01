import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ShowComponent } from "./show/show.component";
import { ProductRoutingModule } from "./product-routing-module";

@NgModule({
    declarations: [ShowComponent],
    imports: [CommonModule, ProductRoutingModule]
})
export class ProductModule {}
