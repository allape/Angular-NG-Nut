import { HomeComponent } from "./home.component";
import { NgModule } from "@angular/core";
import { environment } from "../../environments/environment";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            { path: 'index', loadChildren: './index/index.module#ProModule' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: environment.useHash })],
    exports: [RouterModule]
})
export class HomeRoutingModule { }
