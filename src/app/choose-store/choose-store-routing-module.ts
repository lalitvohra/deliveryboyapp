import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChooseStoreComponent } from "./choose-store.component";

const routes: Routes = [
    {
        path: "",
        component: ChooseStoreComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChooseStoreRoutingModule {}
