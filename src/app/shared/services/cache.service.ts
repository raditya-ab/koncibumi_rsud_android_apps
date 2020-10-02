import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";

@Injectable({
  providedIn: "root",
})
export class CacheService {
  private tokenKey = "rsud-sumedang-token";
  currentUser: any;

  constructor(private storage: Storage) {}

  setToken(token: string) {
    return this.storage.set(this.tokenKey, token);
  }

  getToken() {
    return this.storage.get(this.tokenKey);
  }

  removeToken() {
    return this.storage.remove(this.tokenKey);
  }

  setCurrentUser(data: any, token: string) {
    this.setToken(token);
    this.currentUser = data;
    this.currentUser.token = token;
  }
}
