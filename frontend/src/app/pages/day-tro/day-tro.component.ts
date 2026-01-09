import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DayTro } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-day-tro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day-tro.component.html',
  styleUrls: ['./day-tro.component.css'] 
})
export class DayTroComponent implements OnInit {
  dayTros: DayTro[] = [];
  showModal = false;
  isEdit = false;
  formData: any = { 
    tenDayTro: '', 
    diaChi: '', 
    soTang: 1, 
    soPhongMoiTang: 1, 
    moTa: '' 
  };
  editingId: number | null = null;

  constructor(private apiService: ApiService, private toastService: ToastService ) {}

  ngOnInit() { 
    this.loadDayTros(); 
  }

  loadDayTros() {
    this.apiService.getDayTros().subscribe({
      next: (data) => this.dayTros = data,
      error: (err) => alert('Lỗi tải dữ liệu')
    });
  }

  openModal() {
    this.isEdit = false;
    this.formData = { 
      tenDayTro: '', 
      diaChi: '', 
      soTang: 1, 
      soPhongMoiTang: 1, 
      moTa: '' 
    };
    this.editingId = null;
    this.showModal = true;
  }

  editDay(day: DayTro) {
    this.isEdit = true;
    this.editingId = day.id;
    this.formData = { ...day };
    this.showModal = true;
  }

  closeModal(event?: any) {
    if (!event || event.target === event.currentTarget) {
      this.showModal = false;
    }
  }

  saveDay() {
    const request = this.isEdit 
        ? this.apiService.updateDayTro(this.editingId!, this.formData) 
        : this.apiService.createDayTro(this.formData);
        
    request.subscribe({
        next: () => { 
            this.loadDayTros(); 
            this.closeModal(); 
            this.toastService.success(this.isEdit ? 'Cập nhật dãy trọ thành công!' : 'Thêm dãy trọ mới thành công!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Có lỗi xảy ra khi lưu dãy trọ')
    });
  }

  deleteDay(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa dãy nhà này?')) {
      this.apiService.deleteDayTro(id).subscribe({
        next: () => { 
            this.loadDayTros(); 
            this.toastService.success('Đã xóa dãy trọ thành công!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Không thể xóa (có thể đang có phòng)')
      });
    }
  }
}