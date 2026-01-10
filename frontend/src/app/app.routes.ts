import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '', // Route gốc
    loadComponent: () => import('./pages/intro/intro.component').then(m => m.IntroComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'register-tenant',
    loadComponent: () => import('./pages/register-tenant/register-tenant.component').then(m => m.RegisterTenantComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'day-tro',
    loadComponent: () => import('./pages/day-tro/day-tro.component').then(m => m.DayTroComponent),
    canActivate: [authGuard]
  },
  {
    path: 'phong-tro',
    loadComponent: () => import('./pages/phong-tro/phong-tro.component').then(m => m.PhongTroComponent),
    canActivate: [authGuard]
  },
  {
    path: 'khach-thue',
    loadComponent: () => import('./pages/khach-thue/khach-thue.component').then(m => m.KhachThueComponent),
    canActivate: [authGuard]
  },
  {
    path: 'hop-dong',
    loadComponent: () => import('./pages/hop-dong/hop-dong.component').then(m => m.HopDongComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dich-vu',
    loadComponent: () => import('./pages/dich-vu/dich-vu.component').then(m => m.DichVuComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chi-so-cong-to',
    loadComponent: () => import('./pages/chi-so-cong-to/chi-so-cong-to.component').then(m => m.ChiSoCongToComponent),
    canActivate: [authGuard]
  },
  {
    path: 'hoa-don',
    loadComponent: () => import('./pages/hoa-don/hoa-don.component').then(m => m.HoaDonComponent),
    canActivate: [authGuard]
  },
  {
    path: 'thong-bao',
    loadComponent: () => import('./pages/thong-bao/thong-bao.component').then(m => m.ThongBaoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'yeu-cau',
    loadComponent: () => import('./pages/yeu-cau/yeu-cau.component').then(m => m.YeuCauComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tenant',
    loadComponent: () => import('./pages/tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'bieu-mau',
    loadComponent: () => import('./pages/bieu-mau/bieu-mau.component').then(m => m.BieuMauComponent),
    canActivate: [authGuard]
  }
];

