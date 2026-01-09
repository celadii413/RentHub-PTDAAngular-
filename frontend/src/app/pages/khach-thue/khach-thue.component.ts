import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PhongTro } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-khach-thue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './khach-thue.component.html', 
  styleUrls: ['./khach-thue.component.css']   
})
export class KhachThueComponent implements OnInit {
  khachThues: any[] = []; 
  activeTab: 'current' | 'past' = 'current'; 
  phongTros: PhongTro[] = []; 
  showModal = false; 
  isEdit = false; 
  formData: any = { 
    hoTen: '', 
    soDienThoai: '', 
    email: '', 
    cccd: '', 
    diaChiThuongTru: '', 
    phongTroId: null, 
    ngayBatDauThue: '' }; 
    editingId: number | null = null; 
    selectedPhongTro: PhongTro | null = null; 
    gioiHanMessage = ''; isRoomFull = false; 
    showModalChuyenPhong = false; 
    chuyenPhongData: any = {}; 
    showModalTraPhong = false; 
    traPhongData: any = {};

  constructor(private apiService: ApiService, private toastService: ToastService ) {}
  ngOnInit() { 
    this.loadKhachThues(); this.loadPhongTros(); 
  }

  get displayedTenants() { 
    return this.activeTab === 'current' ? this.currentTenants : this.pastTenants; 
  }

  get currentTenants() { 
    return this.khachThues.filter(k => !k.ngayKetThucThue); 
  }

  get pastTenants() { 
    return this.khachThues.filter(k => k.ngayKetThucThue); 
  }

  loadKhachThues() { 
    this.apiService.getKhachThues().subscribe(data => this.khachThues = data); 
  }

  loadPhongTros() { 
    this.apiService.getPhongTros().subscribe(data => this.phongTros = data); 
  }
  
  openModal() { 
    this.isEdit = false; 
    this.formData = { hoTen: '', phongTroId: null, ngayBatDauThue: '' }; 
    this.gioiHanMessage = ''; 
    this.showModal = true; 
  }

  editKhach(k: any) { 
    this.isEdit = true; 
    this.editingId = k.id; 
    this.formData = { ...k }; 
    this.showModal = true; 
  }

  closeModal(e?: any) { 
    if(!e || e.target===e.currentTarget) this.showModal = false; 
  }

  saveKhach() { 
    const data = { ...this.formData, phongTroId: parseInt(this.formData.phongTroId) }; 
    const req = this.isEdit ? this.apiService.updateKhachThue(this.editingId!, data) : this.apiService.createKhachThue(data); 
    req.subscribe({
        next: () => { 
          this.loadKhachThues(); 
          this.loadPhongTros(); 
          this.closeModal(); 
          this.toastService.success(this.isEdit ? 'Cập nhật thông tin khách thành công!' : 'Thêm khách thuê mới thành công!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi lưu khách thuê')
    }); 
  }

  deleteKhach(id: number) { 
    if(confirm('Xóa khách này?')) {
        this.apiService.deleteKhachThue(id).subscribe({
            next: () => {
                this.loadKhachThues();
                this.toastService.success('Đã xóa khách thuê thành công!');
            },
            error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi xóa khách thuê')
        }); 
    }
  }

  onPhongTroChange() {
    const pid = parseInt(this.formData.phongTroId);
    this.selectedPhongTro = this.phongTros.find(p => p.id === pid) || null;
    if(this.selectedPhongTro) {
        if(this.selectedPhongTro.soKhachThue >= this.selectedPhongTro.gioiHanSoNguoi) {
            this.gioiHanMessage = 'Phòng đã đầy (Hết chỗ)';
            this.isRoomFull = true;
        } else {
            const trong = this.selectedPhongTro.gioiHanSoNguoi - this.selectedPhongTro.soKhachThue;
            this.gioiHanMessage = `Còn trống ${trong} chỗ`;
            this.isRoomFull = false;
        }
    } else {
        this.gioiHanMessage = '';
    }
  }

  openModalChuyenPhong(k: any) { 
    this.chuyenPhongData = { 
      khachThueId: k.id, 
      tenKhach: k.hoTen, 
      phongHienTai: k.soPhong, 
      phongTroCuId: k.phongTroId, 
      phongTroMoiId: null 
    }; 
    this.showModalChuyenPhong = true; 
  }

  closeModalChuyenPhong(e?: any) { 
    if(!e || e.target===e.currentTarget) this.showModalChuyenPhong = false; 
  }

  saveChuyenPhong() { 
    this.apiService.chuyenPhong(this.chuyenPhongData.khachThueId, { 
      phongTroMoiId: parseInt(this.chuyenPhongData.phongTroMoiId) }).subscribe({
        next: () => { 
            this.loadKhachThues(); 
            this.loadPhongTros(); 
            this.closeModalChuyenPhong(); 
            this.toastService.success('Chuyển phòng thành công!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi chuyển phòng')
    }); 
  }

  openModalTraPhong(k: any) { 
    this.traPhongData = { khachThueId: k.id, tenKhach: k.hoTen, ngayTraPhong: new Date().toISOString().split('T')[0] }; 
    this.showModalTraPhong = true;
  }

  closeModalTraPhong(e?: any) { 
    if(!e || e.target===e.currentTarget) this.showModalTraPhong = false; 
  }

  saveTraPhong() { 
    this.apiService.traPhong(this.traPhongData.khachThueId, { 
      ngayTraPhong: new Date(this.traPhongData.ngayTraPhong) 
    })
    .subscribe({
        next: () => { 
          this.loadKhachThues(); 
          this.loadPhongTros(); 
          this.closeModalTraPhong(); 
          this.toastService.success('Thủ tục trả phòng hoàn tất!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi trả phòng')
    }); 
  }
}