import { Component, OnInit } from "@angular/core";
import { environment } from "./../../environments/environment";

@Component({
    selector: "app-access-denied",
    templateUrl: "./access-denied.component.html",
    styleUrls: ["./access-denied.component.scss"],
})
export class AccessDeniedComponent implements OnInit {
    environment = environment;
    constructor() {}

    ngOnInit() {
        (document.querySelector(
            ".loader-screen"
        ) as HTMLElement).style.display = "none";
    }
}
