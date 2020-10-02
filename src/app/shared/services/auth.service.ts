import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private jwtHelper: JwtHelperService, private cache: CacheService) {}

  checkToken() {
    this.cache.getToken().then((token) => {
      if (token) {
        const decoded = this.jwtHelper.decodeToken(token);
        const isExpired = this.jwtHelper.isTokenExpired(token);

        !isExpired ? this.cache.setCurrentUser(decoded, token) : this.cache.removeToken();
      }
    });
  }

  isAuthenticated() {
    return new Observable<boolean>((observer) => {
      this.cache.getToken().then((token) => {
        if (token) {
          const decoded = this.jwtHelper.decodeToken(token);
          const isExpired = this.jwtHelper.isTokenExpired(token);
          if (!isExpired) {
            this.cache.setCurrentUser(decoded, token);
            observer.next(true);
          } else {
            this.cache.removeToken();
            observer.next(false);
          }
        } else {
          observer.next(false);
        }
      });
    });
  }
}
