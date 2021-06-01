import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CheckoutComponent } from "./checkout.component";
import { CheckoutRoutingModule } from "./checkout-routing-module";
import { FormsModule } from "@angular/forms";
import { CodeInputModule } from "angular-code-input";
import { NumberonlyModule } from "src/app/shared/modules/numberonly/numberonly.module";

@NgModule({
    declarations: [CheckoutComponent],
    imports: [
        CommonModule,
        CheckoutRoutingModule,
        FormsModule,
        CodeInputModule,
        NumberonlyModule
    ]
})
export class CheckoutModule {}
