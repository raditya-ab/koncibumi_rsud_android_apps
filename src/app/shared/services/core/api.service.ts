import { Injectable } from "@angular/core";
import { Observable, throwError, timer } from "rxjs";
import { catchError, timeout, retryWhen, mergeMap, map } from "rxjs/operators";
import * as _ from "lodash";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Page, Sort } from "../../models";
import { environment } from "src/environments/environment";

export const genericRetryStrategy = ({
  maxRetryAttempts = 3,
  scalingDuration = 1000,
  excludedStatusCodes = [],
}: {
  maxRetryAttempts?: number;
  scalingDuration?: number;
  excludedStatusCodes?: number[];
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      if (
        retryAttempt > maxRetryAttempts ||
        excludedStatusCodes.find((e) => e === error.status)
      ) {
        return throwError(error);
      }
      return timer(retryAttempt * scalingDuration);
    })
  );
};

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private prepareHttpParams(pagination: Page, ordering: Sort, filter: any) {
    let params = new HttpParams();

    if (!_.isEmpty(pagination)) {
      params = params.append("row", pagination.row.toString());
      params = params.append("page", pagination.page.toString());
    } else {
      params = params.append("pagination", "false");
    }

    if (!_.isEmpty(ordering)) {
      params = params.append("order_by", ordering.orderBy);
      params = params.append("order_type", ordering.orderType);
    }

    if (!_.isEmpty(filter)) {
      for (const key in filter) {
        if (filter.hasOwnProperty(key)) {
          if (_.isArray(filter[key])) {
            for (const index in filter[key]) {
              if (filter[key].hasOwnProperty(index)) {
                params = params.append(key, filter[key][index]);
              }
            }
          } else {
            params = params.append(key, filter[key]);
          }
        }
      }
    }

    return params;
  }

  private prepareFormData(data) {
    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    return formData;
  }

  get(
    path: string,
    pagination: Page,
    ordering: Sort,
    filter: object = null
  ): Observable<any> {
    const params = this.prepareHttpParams(pagination, ordering, filter);
    const options = { params };

    return this.http.get(`${environment.api_url}${path}`, options).pipe(
      map((res) => {
        return res;
      }),
      timeout(3000),
      retryWhen(
        genericRetryStrategy({ scalingDuration: 2000, excludedStatusCodes: [] })
      ),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  post(path: string, model: object = {}, multipart = false): Observable<any> {
    const options = {};
    let body = model;
    if (multipart) {
      let headers = new HttpHeaders();
      headers = headers.append("Content-Type", "multipart/form-data");
      Object.assign(options, { headers });

      body = this.prepareFormData(model);
    }

    return this.http.post(environment.api_url + path, body, options).pipe(
      catchError((err) => {
        return throwError(err);
      }),
      map((res: Response) => {
        return res;
      }),
      timeout(multipart ? 15000 : 6000)
    );
  }

  patch(path: string, model: object = {}, multipart = false): Observable<any> {
    const options = {};
    let body = model;
    if (multipart) {
      let headers = new HttpHeaders();
      headers = headers.append("Content-Type", "multipart/form-data");
      Object.assign(options, { headers });

      body = this.prepareFormData(model);
    }

    return this.http.patch(environment.api_url + path, body, options).pipe(
      catchError((err) => {
        return throwError(err);
      }),
      map((res: Response) => {
        return res;
      }),
      timeout(3000)
    );
  }

  put(path: string, model: object = {}, multipart = false): Observable<any> {
    const options = {};
    let body = model;
    if (multipart) {
      let headers = new HttpHeaders();
      headers = headers.append("Content-Type", "multipart/form-data");
      Object.assign(options, { headers });

      body = this.prepareFormData(model);
    }

    return this.http.put(environment.api_url + path, body, options).pipe(
      catchError((err) => {
        return throwError(err);
      }),
      map((res: Response) => {
        return res;
      }),
      timeout(3000)
    );
  }

  delete(path: string): Observable<any> {
    return this.http.delete(environment.api_url + path).pipe(
      catchError((err) => {
        return throwError(err);
      }),
      map((res: Response) => {
        return res;
      }),
      timeout(3000)
    );
  }
}
