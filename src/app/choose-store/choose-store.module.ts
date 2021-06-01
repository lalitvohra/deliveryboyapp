import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChooseStoreRoutingModule } from "./choose-store-routing-module";
import { ChooseStoreComponent } from "./choose-store.component";
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [CommonModule, ChooseStoreRoutingModule, FormsModule],
    declarations: [ChooseStoreComponent],
})
export class chooseStoreModule {}
