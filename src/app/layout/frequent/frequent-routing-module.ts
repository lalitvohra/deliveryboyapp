import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FrequentComponent } from "./frequent.component";

const routes: Routes = [
    {
        path: "",
        component: FrequentComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FrequentRoutingModule {}
