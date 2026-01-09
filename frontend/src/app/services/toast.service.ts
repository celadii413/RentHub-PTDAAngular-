import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  constructor() {}

  success(message: string) {
    this.addToast('success', message);
  }

  error(message: string) {
    this.addToast('error', message);
  }

  warning(message: string) {
    this.addToast('warning', message);
  }

  info(message: string) {
    this.addToast('info', message);
  }

  remove(id: number) {
    const currentToasts = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(currentToasts);
  }

  private addToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
    const id = this.counter++;
    const newToast: Toast = { id, type, message };
    
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }
}