import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <div class="layout-wrapper" [class.no-sidebar]="!showNavbar">
      <!-- Sidebar bên trái -->
      <aside class="layout-sidebar" *ngIf="showNavbar">
        <app-navbar></app-navbar>
      </aside>

      <!-- Nội dung chính bên phải -->
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
        // Ẩn sidebar ở trang login, register, intro
        const hiddenRoutes = ['/login', '/register', '/register-tenant', '/'];
        this.showNavbar = !hiddenRoutes.includes(event.urlAfterRedirects);
      });
  }
}