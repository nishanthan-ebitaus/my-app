import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { TaxusLayoutComponent } from "../layouts/taxus-layout/taxus-layout.component";

const routes: Routes = [
  { path: '', component: DashboardComponent, children: [
    {
      path: '',
      loadComponent: () => import('../pages/business-dashboard/business-dashboard.component').then(m => m.BusinessDashboardComponent)
    },
    {
      path: 'partner',
      loadComponent: () => import('../pages/partner-information/partner-information.component').then(m => m.PartnerInformationComponent)
    },
    {
      path: 'inventory',
      loadComponent: () => import('../pages/inventory/inventory.component').then(m => m.InventoryComponent)
    },
    {
      path: 'sales',
      loadComponent: () =>import('../pages/sales-transactions/sales-transactions.component').then(m => m.SalesTransactionsComponent)
    },
    {
      path: 'e-way',
      loadComponent: () =>import('../pages/eway-bill/eway-bill.component').then(m => m.EwayBillComponent)
    },
    {
      path: 'purchase',
      loadComponent: () => import('../pages/purchase-transactions/purchase-transactions.component').then(m => m.PurchaseTransactionsComponent)
    },
    {
      path: 'gst',
      loadComponent: () =>import('../pages/gst-solutions/gst-solutions.component').then(m => m.GstSolutionsComponent)
    },
    {
      path: 'erp',
      loadComponent: () =>import('../pages/erp-integration/erp-integration.component').then(m => m.ErpIntegrationComponent)
    },
    {
      path: 'profile',
      loadComponent: () => import('../pages/user-profile/user-profile.component').then(m => m.UserProfileComponent)
    },
    {
      path: 'settings',
      loadComponent: () => import('../pages/settings/settings.component').then(m => m.SettingsComponent)
    },
    {
      path: 'help',
      loadComponent: () =>import('../pages/help-support/help-support.component').then(m => m.HelpSupportComponent)
    },
  ]}
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TaxusLayoutComponent
]
})
export class DashboardModule { }
