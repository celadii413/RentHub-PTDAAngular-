import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-thong-bao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thong-bao.component.html',
  styleUrls: ['./thong-bao.component.css']  
})
export class ThongBaoComponent implements OnInit {
  notifications: any[] = []; 
  isOwner = false;
  form = { tieuDe: '', noiDung: '' };
  submitting = false;

  constructor(private api: ApiService, private auth: AuthService, private toastService: ToastService ) {}

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
    if (!this.form.tieuDe || !this.form.noiDung) {
        this.toastService.warning('Vui lòng nhập tiêu đề và nội dung');
        return;
    }
    this.submitting = true;
    this.api.createThongBao(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.form = { tieuDe: '', noiDung: '' };
        this.loadNotifications();
        this.toastService.success('Đã đăng thông báo lên bảng tin!');
      },
      error: (err) => { 
        this.submitting = false; 
        this.toastService.error('Lỗi: ' + (err.error?.message || 'Không thể đăng tin')); 
      }
    });
  }
  
  deleteNotification(id: number) {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi bảng tin nhà?')) {
        this.api.deleteThongBao(id).subscribe({
            next: () => {
                this.notifications = this.notifications.filter(n => (n.id || n.Id) !== id);
                this.toastService.success('Đã xóa thông báo');
            },
            error: (err) => this.toastService.error('Lỗi: ' + (err.error?.message || 'Không có quyền xóa.'))
        });
    }
  }
}