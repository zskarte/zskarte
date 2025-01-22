import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { deserialize } from 'superjson';
import { environment } from '../../environments/environment';
import { SessionService } from '../session/session.service';
import transformResponse, { TransformerOptions } from './transformer';

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
  private _apiUrl = environment.apiUrl;
  private _session!: SessionService;

  public setSessionService(sessionService: SessionService): void {
    this._session = sessionService;
  }

  public getUrl(): string {
    return this._apiUrl;
  }

  private async _retry<RESPONSE>(fn: Promise<RESPONSE>, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    const maxRetries = options?.retries || 3;
    let lastError: HttpErrorResponse = new HttpErrorResponse({ status: 0 });
    for (let i = 0; i < maxRetries; i++) {
      try {
        return {
          result: transformResponse(await fn),
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

  public async post<RESPONSE = any, REQUEST = any>(
    path: string,
    body: REQUEST,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(this._fetch({ method: 'POST', path, body, options }));
  }

  public async put<RESPONSE = any, REQUEST = any>(
    path: string,
    body: REQUEST,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(this._fetch({ method: 'PUT', path, body, options }));
  }

  public async get<RESPONSE = any>(path: string, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(this._fetch({ method: 'GET', path, options }));
  }

  public async delete<RESPONSE = any>(path: string, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    return await this._retry(this._fetch({ method: 'DELETE', path, options }));
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

  private async _fetch({
    path,
    method,
    body,
    options,
  }: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    options?: IApiRequestOptions;
  }): Promise<any> {
    const headers = this._getDefaultHeaders(options);
    const response = await fetch(`${this._apiUrl}${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Error on request', { method, path, body, options });
      throw new Error('Error on request');
    }

    if (response.status === 204) {
      return undefined;
    }

    return deserialize(await response.json());
  }
}
