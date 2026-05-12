import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateFn,
} from '@angular/router';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router'; // Đảm bảo bạn đã import Router ở đây.
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private tokenService: TokenService,
    private router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const token = this.tokenService.getToken();
    const isTokenExpired = this.tokenService.isTokenExpired();

    // Chỉ cần có token và chưa hết hạn là cho qua
    if (token && !isTokenExpired) {
      return true;
    } else {
      // Chỉ điều hướng về login nếu đang không ở sẵn trang login
      if (state.url !== '/login') {
        this.router.navigate(['/login']);
      }
      return false;
    }
  }
}

// Sử dụng functional guard như sau:
export const AuthGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean => {
  debugger;
  return inject(AuthGuard).canActivate(next, state);
};
