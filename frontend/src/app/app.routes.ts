import { Routes } from '@angular/router';
import { adminGuard } from './core';
import { AdminLayout, PublicLayout } from './shared';
export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./public.pages').then((m) => m.HomePage),
        title: 'Horizonte Propiedades | Inmobiliaria en zona sur',
      },
      {
        path: 'propiedades',
        loadComponent: () => import('./public.pages').then((m) => m.PropertiesPage),
        title: 'Propiedades en venta y alquiler',
      },
      {
        path: 'propiedades/:slug',
        loadComponent: () => import('./public.pages').then((m) => m.PropertyDetailPage),
      },
      {
        path: 'favoritos',
        loadComponent: () => import('./public.pages').then((m) => m.FavoritesPage),
        title: 'Mis propiedades favoritas',
      },
      {
        path: 'contacto',
        loadComponent: () => import('./public.pages').then((m) => m.ContactPage),
        title: 'Contacto | Horizonte Propiedades',
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./public.pages').then((m) => m.AboutPage),
        title: 'Nosotros | Horizonte Propiedades',
      },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin.pages').then((m) => m.LoginPage),
    title: 'Ingresar | Horizonte Propiedades',
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./admin.pages').then((m) => m.DashboardPage) },
      {
        path: 'propiedades',
        loadComponent: () => import('./admin.pages').then((m) => m.AdminPropertiesPage),
      },
      {
        path: 'propiedades/nueva',
        loadComponent: () => import('./admin.pages').then((m) => m.PropertyFormPage),
      },
      {
        path: 'propiedades/:id/editar',
        loadComponent: () => import('./admin.pages').then((m) => m.PropertyFormPage),
      },
      {
        path: 'consultas',
        loadComponent: () => import('./crm.pages').then((m) => m.InquiriesPage),
      },
      {
        path: 'visitas',
        loadComponent: () => import('./crm.pages').then((m) => m.AppointmentsPage),
      },
      { path: 'clientes', loadComponent: () => import('./crm.pages').then((m) => m.ClientsPage) },
      {
        path: 'configuracion',
        loadComponent: () => import('./crm.pages').then((m) => m.SettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
