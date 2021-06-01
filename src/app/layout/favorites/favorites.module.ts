import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FavoritesComponent } from "./favorites.component";
import { FavoritesRoutingModule } from "./favorites-routing-module";
import { ProductsModule } from "../../products/products.module";

@NgModule({
    imports: [CommonModule, FavoritesRoutingModule, ProductsModule],
    declarations: [FavoritesComponent],
    exports: [FavoritesComponent]
})
export class FavoritesModule {}
