import { Injectable } from '@angular/core';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  static SV_TOKEN = 'sv-token';

  private _tokenCache: string;

  constructor() {}

  hasToken(): boolean {
    const token = this.get();
    return !!token;
  }

  get(): string {
    if (!_.isNil(this._tokenCache)) {
      if (this.isTokenBroken(this._tokenCache)) {
        this._tokenCache = undefined;
      } else {
        return this._tokenCache;
      }
    }

    const token = localStorage.getItem(TokenService.SV_TOKEN);

    if (this.isTokenBroken(token)) {
      return undefined;
    }

    this._tokenCache = token;

    return token;
  }

  set(token: string) {
    if (this.isTokenBroken(token)) {
      localStorage.removeItem(TokenService.SV_TOKEN);
      this._tokenCache = undefined;
      return;
    }

    localStorage.setItem(TokenService.SV_TOKEN, token);
    this._tokenCache = token;
  }

  private isTokenBroken(token: string) {
    const broken = !token || token === 'undefined' || token === 'null';
    return broken;
  }
}
