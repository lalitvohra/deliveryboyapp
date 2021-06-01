import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { AppComponent } from "./app.component";
import { AuthGuard } from "./shared";
import { StoreGuard } from "./store-guard";

const routes: Routes = [
    // {
    //     path: "",
    //     loadChildren: () =>
    //         import("./introduction/introduction.module").then(
    //             m => m.IntroductionModule
    //         )
    // },
    // {
    //     path: "",
    //     loadChildren: () =>
    //         import("./layout/layout.module").then(m => m.LayoutModule),
    //     canActivate: [AuthGuard]
    // },

    {
        path: "",
        loadChildren: () =>
            import("./layout/layout.module").then((m) => m.LayoutModule),
    },
    {
        path: "choosestore",
        loadChildren: () =>
            import("./choose-store/choose-store.module").then(
                (m) => m.chooseStoreModule
            ),
    },

    {
        path: "login",
        loadChildren: () =>
            import("./login/login.module").then((m) => m.LoginModule),
    },
    {
        path: "signup",
        loadChildren: () =>
            import("./signup/signup.module").then((m) => m.SignupModule),
    },
    {
        path: "error",
        loadChildren: () =>
            import("./server-error/server-error.module").then(
                (m) => m.ServerErrorModule
            ),
    },
    {
        path: "access-denied",
        loadChildren: () =>
            import("./access-denied/access-denied.module").then(
                (m) => m.AccessDeniedModule
            ),
    },
    {
        path: "not-found",
        loadChildren: () =>
            import("./not-found/not-found.module").then(
                (m) => m.NotFoundModule
            ),
    },
    { path: "**", redirectTo: "not-found" },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
