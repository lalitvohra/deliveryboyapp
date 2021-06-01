import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FrequentComponent } from "./frequent.component";
import { FrequentRoutingModule } from "./frequent-routing-module";
import { ProductsModule } from "src/app/products/products.module";

@NgModule({
    declarations: [FrequentComponent],
    imports: [CommonModule, FrequentRoutingModule, ProductsModule],
    exports: [FrequentComponent],
})
export class FrequentModule {}
