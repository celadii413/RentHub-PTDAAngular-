import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast-item" 
           [ngClass]="toast.type"
           [@toastAnimation]
           (click)="remove(toast.id)">
        
        <div class="icon">
          <i class='bx bxs-check-circle' *ngIf="toast.type === 'success'"></i>
          <i class='bx bxs-error-circle' *ngIf="toast.type === 'error'"></i>
          <i class='bx bxs-error' *ngIf="toast.type === 'warning'"></i>
          <i class='bx bxs-info-circle' *ngIf="toast.type === 'info'"></i>
        </div>

        <div class="content">{{ toast.message }}</div>
        
        <button class="close-btn">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none; 
    }

    .toast-item {
      pointer-events: auto;
      min-width: 300px;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      border-left: 5px solid;
      font-size: 14px;
      font-weight: 500;
    }

    .icon { font-size: 24px; display: flex; align-items: center; }
    .content { flex: 1; color: var(--text-main); }
    .close-btn { background: none; border: none; font-size: 20px; color: #9ca3af; cursor: pointer; }

    .success { border-color: #10b981; background: #f0fdf4; }
    .success .icon { color: #10b981; }

    .error { border-color: #ef4444; background: #fef2f2; }
    .error .icon { color: #ef4444; }

    .warning { border-color: #f59e0b; background: #fffbeb; }
    .warning .icon { color: #f59e0b; }

    .info { border-color: #3b82f6; background: #eff6ff; }
    .info .icon { color: #3b82f6; }
  `]
})
export class ToastComponent {
  toasts: Toast[] = [];

  constructor(public toastService: ToastService) {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}