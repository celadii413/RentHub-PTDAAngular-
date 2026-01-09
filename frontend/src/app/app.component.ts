import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div class="layout-wrapper" [class.no-sidebar]="!showNavbar">
      <aside class="layout-sidebar" *ngIf="showNavbar">
        <app-navbar></app-navbar>
      </aside>

      <main class="layout-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  showNavbar = true;
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/login', '/register', '/register-tenant', '/'];
        const urlBase = event.urlAfterRedirects.split('?')[0];
        this.showNavbar = !hiddenRoutes.includes(urlBase);
      });
  }
}