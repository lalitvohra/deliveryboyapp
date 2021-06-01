import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CodeInputModule } from "angular-code-input";
import { SignupRoutingModule } from "./signup-routing.module";
import { SignupComponent } from "./signup.component";
import { FormsModule } from "@angular/forms";
import { NumberonlyModule } from "../shared/modules/numberonly/numberonly.module";

@NgModule({
    imports: [
        CommonModule,
        SignupRoutingModule,
        FormsModule,
        CodeInputModule,
        NumberonlyModule,
    ],
    declarations: [SignupComponent],
})
export class SignupModule {}
