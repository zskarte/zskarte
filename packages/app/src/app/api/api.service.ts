import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionService } from '../session/session.service';
import transformResponse, { TransformerOptions } from './transformer';
import { deserialize, SuperJSONResult } from 'superjson';

export interface IApiRequestOptions {
  headers?: { [key: string]: string };
  token?: string;
  retries?: number;
  transformerOptions?: TransformerOptions;
  preventAuthorization?: boolean;
}

export interface ApiResponse<T> {
  result?: T;
  error?: HttpErrorResponse;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _http = inject(HttpClient);

  private _apiUrl = environment.apiUrl;
  private _session!: SessionService;

  public setSessionService(sessionService: SessionService): void {
    this._session = sessionService;
  }

  public getUrl(): string {
    return this._apiUrl;
  }

  private async _retry<RESPONSE>(
    fn: Observable<RESPONSE>,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    const maxRetries = options?.retries || 3;
    let lastError: HttpErrorResponse = new HttpErrorResponse({ status: 0 });
    for (let i = 0; i < maxRetries; i++) {
      try {
        const rawResponse = await lastValueFrom(fn);
        return {
          result: transformResponse(deserialize(rawResponse as SuperJSONResult)),
        };
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          lastError = error;
          if (error.status && error.status >= 400 && error.status < 500) break;
        }
      }
    }
    return { error: lastError };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async post<RESPONSE = any, REQUEST = any>(
    subUrl: string,
    params: REQUEST,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(
      this._http.post<RESPONSE>(`${this._apiUrl}${subUrl}`, params, { headers: this._getDefaultHeaders(options) }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async put<RESPONSE = any, REQUEST = any>(
    subUrl: string,
    params: REQUEST,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(
      this._http.put<RESPONSE>(`${this._apiUrl}${subUrl}`, params, { headers: this._getDefaultHeaders(options) }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get$<RESPONSE = any>(subUrl: string, options?: IApiRequestOptions): Observable<RESPONSE> {
    return new Observable((subscriber) => {
      this._http.get<RESPONSE>(`${this._apiUrl}${subUrl}`, { headers: this._getDefaultHeaders(options) }).subscribe({
        next: (response) => subscriber.next(deserialize(response as SuperJSONResult)),
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get<RESPONSE = any>(subUrl: string, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(
      this._http.get<RESPONSE>(`${this._apiUrl}${subUrl}`, { headers: this._getDefaultHeaders(options) }),
    );
  }

  private _getDefaultHeaders(options?: IApiRequestOptions): { [key: string]: string } {
    const defaults: { [key: string]: string } = {};
    if (!options?.preventAuthorization) {
      if (options?.token || this._session.getToken()) {
        defaults['Authorization'] = `Bearer ${options?.token || this._session.getToken()}`;
      }
    }
    return { ...defaults, ...(options?.headers || {}) };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async delete<RESPONSE = any>(subUrl: string, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(
      this._http.delete<RESPONSE>(`${this._apiUrl}${subUrl}`, { headers: this._getDefaultHeaders(options) }),
    );
  }
}