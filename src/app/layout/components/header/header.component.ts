import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "./../../../../environments/environment";
@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
    environment = environment;
    constructor(public router: Router) {
        this.router.events.subscribe((val) => {});
    }

    ngOnInit() {}

    toggleSidebar() {
        const dom: any = document.querySelector("body");
        event.stopPropagation();
        dom.classList.toggle("sidemenu-open");
        dom.classList.toggle("menuactive");
    }
}
