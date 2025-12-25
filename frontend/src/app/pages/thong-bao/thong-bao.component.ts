import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-thong-bao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" style="max-width: 900px;">
      <div class="page-header">
        <h1><i class='bx bx-bell text-gradient'></i> Bảng Tin Thông Báo</h1>
      </div>

      <!-- Form Đăng tin (Chỉ hiện cho Chủ trọ) -->
      <div class="card mb-4" *ngIf="isOwner">
         <h3 class="mb-3" style="font-size: 16px; font-weight: 600;"><i class='bx bx-edit'></i> Đăng thông báo mới</h3>
         <form (ngSubmit)="sendNotification()">
            <div class="form-group">
               <input class="form-control" [(ngModel)]="form.tieuDe" name="title" placeholder="Tiêu đề..." required style="font-weight: 600;">
            </div>
            <div class="form-group">
               <textarea class="form-control" [(ngModel)]="form.noiDung" name="body" rows="4" placeholder="Nội dung chi tiết..." required></textarea>
            </div>
            <div class="text-right">
               <button class="btn btn-primary" type="submit" [disabled]="submitting">
                  <i class='bx bx-send'></i> {{ submitting ? 'Đang đăng...' : 'Đăng ngay' }}
               </button>
            </div>
         </form>
      </div>

      <div class="feed-container">
         <h3 class="mb-4 text-main" style="font-size: 18px;">Tin mới nhất của nhà trọ</h3>
         
         <div *ngIf="notifications.length === 0" class="text-center text-muted p-5 border rounded">
            <i class='bx bx-bell-off' style="font-size: 40px; opacity: 0.5;"></i>
            <p class="mt-2">Hiện chưa có thông báo nào dành cho bạn.</p>
         </div>
         
         <div class="feed-item" *ngFor="let n of notifications">
            <div class="feed-icon"><i class='bx bx-message-rounded-dots'></i></div>
            
            <div class="feed-content">
               <!-- NÚT XOÁ NẰM Ở GÓC (Absolute Position) -->
               <button *ngIf="isOwner" class="btn-delete-pos" 
                       (click)="deleteNotification(n.id || n.Id)" title="Xóa tin này">
                  <i class='bx bx-trash'></i>
               </button>

               <!-- Nội dung thông báo -->
               <div class="feed-header">
                  <span class="feed-title">{{ n.tieuDe }}</span>
                  <span class="feed-date">{{ n.ngayTao | date:'dd/MM HH:mm' }}</span>
               </div>
               <p class="feed-body">{{ n.noiDung }}</p>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .feed-container { margin-top: 30px; }
    .feed-item { display: flex; gap: 20px; position: relative; padding-bottom: 30px; border-left: 2px solid var(--border); padding-left: 30px; margin-left: 10px; }
    .feed-item:last-child { border-left: 2px solid transparent; }
    
    .feed-icon { position: absolute; left: -21px; top: 0; width: 40px; height: 40px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 20px; z-index: 1; }
    
    /* Thêm position: relative để làm mốc toạ độ cho nút xóa */
    .feed-content { 
        background: var(--bg-card); 
        padding: 20px; 
        border-radius: 12px; 
        border: 1px solid var(--border); 
        width: 100%; 
        position: relative; 
    }

    /* CSS cho nút xóa nằm ở góc */
    .btn-delete-pos {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.2s;
    }
    .btn-delete-pos:hover {
        background: #ef4444;
        color: white;
    }

    .feed-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        padding-right: 30px; /* Chừa chỗ cho nút xóa để chữ không bị đè */
    }

    .feed-title { font-weight: 700; color: var(--text-main); font-size: 16px; }
    .feed-date { color: var(--text-muted); font-size: 12px; }
    
    .feed-body { color: var(--text-muted); margin: 0; white-space: pre-line; font-size: 14px; line-height: 1.6; }
  `]
})
export class ThongBaoComponent implements OnInit {
  notifications: any[] = []; 
  isOwner = false;
  form = { tieuDe: '', noiDung: '' };
  submitting = false;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.isOwner = !!user && (user.vaiTro === 'Chủ trọ' || user.vaiTro === 'Admin');
    this.loadNotifications();
  }

  loadNotifications() {
    if (this.isOwner) {
      this.api.getOwnerNotifications().subscribe(res => this.notifications = res);
    } else {
      this.api.getTenantNotifications().subscribe(res => this.notifications = res);
    }
  }

  sendNotification() {
    if (!this.form.tieuDe || !this.form.noiDung) return;
    this.submitting = true;
    this.api.createThongBao(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.form = { tieuDe: '', noiDung: '' };
        this.loadNotifications();
        alert('Đã đăng thông báo thành công!');
      },
      error: (err) => { 
        this.submitting = false; 
        alert('Lỗi: ' + (err.error?.message || 'Không thể đăng tin')); 
      }
    });
  }
  
  deleteNotification(id: number) {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi bảng tin nhà trọ?')) {
        this.api.deleteThongBao(id).subscribe({
            next: () => {
                this.notifications = this.notifications.filter(n => (n.id || n.Id) !== id);
            },
            error: (err) => {
                alert('Lỗi: ' + (err.error?.message || 'Không có quyền xóa.'));
            }
        });
    }
  }
}