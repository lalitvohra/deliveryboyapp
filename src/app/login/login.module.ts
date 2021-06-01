import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { LoginRoutingModule } from "./login-routing.module";
import { LoginComponent } from "./login.component";
import { FormsModule } from "@angular/forms";

import { CodeInputModule } from "angular-code-input";
import { NumberonlyModule } from "../shared/modules/numberonly/numberonly.module";
@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        LoginRoutingModule,
        FormsModule,
        CodeInputModule,
        NumberonlyModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule {}
