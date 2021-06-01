import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    NgbCarouselModule,
    NgbAlertModule,
    NgbDropdownModule,
    NgbTabsetModule,
} from "@ng-bootstrap/ng-bootstrap";

import { ProfilesModule } from "./profile-routing.module";
import { ProfileComponent } from "./profile.component";
import { StatModule } from "../../shared";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptorService } from "src/app/auth-interceptor.service";
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        NgbCarouselModule,
        NgbAlertModule,
        ProfilesModule,
        StatModule,
        NgbDropdownModule,
        NgbTabsetModule,
        HttpClientModule,
        // Specify ng-circle-progress as an import
    ],
    declarations: [ProfileComponent],
    providers: [
        {   
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true,
        },
    ],
})
export class ProfileModule {}
