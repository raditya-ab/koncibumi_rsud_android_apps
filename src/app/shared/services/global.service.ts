import { Injectable, isDevMode } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GlobalService {
  constructor() {}

  log(message: string, data: any = null, type: string = "log") {
    if (isDevMode()) {
      if (type === "log") {
        if (data) {
          console.log(message, data);
        } else {
          console.log(message);
        }
      } else if (type === "error") {
        console.error(message, data);
      } else if (type === "warn") {
        console.warn(message, data);
      }
    }
  }
}
