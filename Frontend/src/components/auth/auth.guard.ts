import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (allowedRoles?.length &&
      !allowedRoles.includes(authService.getRole() ?? '')) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};