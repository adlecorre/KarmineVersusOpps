import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OppsPageComponent } from './opps-page/opps-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'opps/:oppsName', component: OppsPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
