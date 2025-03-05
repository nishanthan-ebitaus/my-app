import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApprovalComponent } from './app/components/approval/approval.component';

const routes: any = [
  {
    path: 'auth',
    loadChildren: () => import('./app/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    loadChildren: () => import('./app/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'approval',
    component: ApprovalComponent
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
