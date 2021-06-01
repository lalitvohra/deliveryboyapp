import { Component, Output, EventEmitter, OnInit, HostListener } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
declare global {
    interface Window { deferredPrompt: any; }
  }
@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
    showMenu: string;
    storeSelected: string;
    deferredPrompt: any;
    @Output() collapsedEvent = new EventEmitter<boolean>();
    @HostListener('window:beforeinstallprompt', ['$event'])  
    onbeforeinstallprompt(e) {
      console.log(e);
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;      
    }
    constructor(private translate: TranslateService, public router: Router) {
        this.router.events.subscribe((val) => {});
    }

    ngOnInit() {
        this.showMenu = "";
        this.storeSelected = localStorage.getItem("storeName");
    }

    eventCalled() {}

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = "0";
        } else {
            this.showMenu = element;
        }
    }

    // toggleSidebar() {
    //     const dom: any = document.querySelector("body");
    //     if (window.innerWidth <= 992) {
    //         if (dom.classList.contains("sidemenu-open")) {
    //             dom.classList.remove("sidemenu-open");
    //             setTimeout(() => {
    //                 dom.classList.remove("menuactive");
    //             }, 800);
    //         }
    //     }
    // }

    toggleSidebar() {
        const dom: any = document.querySelector("body");
        event.stopPropagation();
        dom.classList.toggle("sidemenu-open");
        dom.classList.toggle("menuactive");
    }

    installApp(){
 
        // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.deferredPrompt = null;
      });
    }
}
