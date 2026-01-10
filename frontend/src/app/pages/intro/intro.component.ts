import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
   selector: 'app-intro',
   standalone: true,
   imports: [CommonModule, RouterLink],
   templateUrl: './intro.component.html',
   styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {
   isLoggedIn = false;
   userName = '';
   userRole = '';

   constructor(private authService: AuthService, private router: Router, private toastService: ToastService) { }

   ngOnInit() {
      this.isLoggedIn = this.authService.isAuthenticated();
      const user = this.authService.getCurrentUser();
      if (user) {
         this.userName = user.hoTen || user.username;
         this.userRole = user.vaiTro;
      }
   }

   goToDashboard() {
      if (this.userRole === 'Người thuê') {
         this.router.navigate(['/tenant']);
      } else {
         this.router.navigate(['/dashboard']);
      }
   }
}