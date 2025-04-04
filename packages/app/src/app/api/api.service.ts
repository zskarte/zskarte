import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, lastValueFrom, of, retry } from 'rxjs';
import { deserialize, stringify } from 'superjson';
import { environment } from '../../environments/environment';
import { SessionService } from '../session/session.service';
import transformResponse, { TransformerOptions } from './transformer';

export interface IApiRequestOptions {
  headers?: { [key: string]: string };
  token?: string;
  retries?: number;
  transformerOptions?: TransformerOptions;
  preventAuthorization?: boolean;
  keepMeta?: boolean;
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

  public async post<RESPONSE = any, REQUEST = any>(
    path: string,
    body: REQUEST,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    return await this._fetch({ method: 'POST', path, body, options });
  }

  public async put<RESPONSE = any, REQUEST = any>(
    path: string,
    body: REQUEST,
    options?: IApiRequestOptions,
  ): Promise<ApiResponse<RESPONSE>> {
    return await this._fetch({ method: 'PUT', path, body, options });
  }

  public async get<RESPONSE = any>(path: string, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    return await this._fetch({ method: 'GET', path, options });
  }

  public async delete<RESPONSE = any>(path: string, options?: IApiRequestOptions): Promise<ApiResponse<RESPONSE>> {
    return await this._fetch({ method: 'DELETE', path, options });
  }

  private _getDefaultHeaders(options?: IApiRequestOptions): { [key: string]: string } {
    const defaults: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
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

    const bodyMethods = ['POST', 'PUT', 'DELETE']
    if(bodyMethods.includes(method) && !body) body = {}
    
    const headers = this._getDefaultHeaders(options);

    const call = async () => {
      const response = await fetch(`${this._apiUrl}${path}`, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let json = await response.json();
        if (json) {
          if (json.json) {
            json = deserialize(json);
          }
          throw json;
        } else {
          console.error('Error on request', { method, path, body, options, response });
          throw new Error('Error on request');
        }
      }

      if (response.status === 204) {
        return { result: undefined };
      }

      const json = deserialize(await response.json());
      return { result: transformResponse(json, { removeMeta: !options?.keepMeta }) };
    };

    const result = await lastValueFrom(
      from(call()).pipe(
        retry(options?.retries || 0),
        catchError((error) => {
          console.error('Error on api call', { method, path, body, options, error });
          return of({ error });
        }),
      ),
    );

    return result;
  }
}
