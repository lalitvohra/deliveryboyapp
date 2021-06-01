import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LayoutComponent } from "./layout.component";
import { AuthGuard } from "../shared";
import { StoreGuard } from "../store-guard";

const routes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            // { path: "", redirectTo: "dashboard", pathMatch: "prefix" },
            // {
            //     path: "dashboard",
            //     loadChildren: () =>
            //         import("./dashboard/dashboard.module").then(
            //             m => m.DashboardModule
            //         )
            // },
            { path: "", redirectTo: "profile", pathMatch: "prefix"},
            {
                path: "home",

                loadChildren: () =>
                    import("./home/home.module").then((m) => m.HomeModule),
            },

            {
                path: "product",
                loadChildren: () =>
                    import("./product/product.module").then(
                        (m) => m.ProductModule
                    ),
            },
            {
                path: "category",
                loadChildren: () =>
                    import("./category/category.module").then(
                        (m) => m.CategoryModule
                    ),
            },
            {
                path: "favorites",
                loadChildren: () =>
                    import("./favorites/favorites.module").then(
                        (m) => m.FavoritesModule
                    ),
            },
            {
                path: "frequent",
                loadChildren: () =>
                    import("./frequent/frequent.module").then(
                        (m) => m.FrequentModule
                    ),
            },
            {
                path: "cart",
                loadChildren: () =>
                    import("./cart/cart.module").then((m) => m.CartModule),
            },
            {
                path: "checkout",
                loadChildren: () =>
                    import("./checkout/checkout.module").then(
                        (m) => m.CheckoutModule
                    ),
            },

            {
                path: "profile",
                canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./profile/profile.module").then(
                        (m) => m.ProfileModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LayoutRoutingModule {}
