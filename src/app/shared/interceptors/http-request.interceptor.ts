import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";

import { Observable } from "rxjs";
import { CacheService } from "../services";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private cache: CacheService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const currentUser = this.cache.currentUser;
    if (currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
    }
    if (!request.headers.has("Content-Type")) {
      request = request.clone({
        setHeaders: {
          "content-type": "application/json",
        },
      });
    } else {
      if (request.headers.get("Content-Type") === "multipart/form-data") {
        request = request.clone({
          headers: request.headers.delete(
            "Content-Type",
            "multipart/form-data"
          ),
        });
      }
    }

    request = request.clone({
      headers: request.headers.set("Accept", "application/json"),
    });

    return next.handle(request);
  }
}
