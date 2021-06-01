import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ShowComponent } from "./show/show.component";

const routes: Routes = [
    {
        path: ":slug",
        component: ShowComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductRoutingModule {}
