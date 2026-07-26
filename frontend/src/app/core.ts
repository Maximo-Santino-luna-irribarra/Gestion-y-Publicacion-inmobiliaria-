import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { catchError, map, throwError } from 'rxjs';
export function assetUrl(url?: string | null): string {
  if (!url || /^(?:https?:|data:|blob:)/i.test(url)) return url ?? '';
  const browserOrigin = globalThis.location?.origin ?? 'http://localhost';
  const apiOrigin = new URL(environment.apiUrl, browserOrigin).origin;
  return new URL(url, apiOrigin).href;
}
export interface Image {
  id: number;
  url: string;
  altText?: string;
  isMain: boolean;
  position: number;
}
export interface Property {
  id: number;
  referenceCode: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  operationType: 'sale' | 'rent';
  propertyType: string;
  status: string;
  price: number;
  currency: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  garages?: number;
  totalArea?: number;
  coveredArea?: number;
  featured: boolean;
  viewCount: number;
  createdAt?: string;
  images: Image[];
  features?: { name: string; value?: string }[];
}
export interface Agency {
  name: string;
  slogan: string;
  description: string;
  yearsOfExperience: number;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  openingHours: string;
  instagramUrl: string;
  facebookUrl: string;
  zones: { name: string; slug: string; description: string }[];
}
interface Envelope<T> {
  success: boolean;
  data: T;
}
export interface Paged<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}
@Injectable({ providedIn: 'root' })
export class ApiService {
  private h = inject(HttpClient);
  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    let p = new HttpParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p = p.set(k, String(v));
    });
    return this.h
      .get<Envelope<T>>(`${environment.apiUrl}/${path}`, { params: p })
      .pipe(map((r) => r.data));
  }
  post<T>(path: string, body: unknown) {
    return this.h.post<Envelope<T>>(`${environment.apiUrl}/${path}`, body).pipe(map((r) => r.data));
  }
  put<T>(path: string, body: unknown) {
    return this.h.put<Envelope<T>>(`${environment.apiUrl}/${path}`, body).pipe(map((r) => r.data));
  }
  patch<T>(path: string, body: unknown) {
    return this.h
      .patch<Envelope<T>>(`${environment.apiUrl}/${path}`, body)
      .pipe(map((r) => r.data));
  }
  delete<T>(path: string) {
    return this.h.delete<Envelope<T>>(`${environment.apiUrl}/${path}`).pipe(map((r) => r.data));
  }
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  token = signal(localStorage.getItem('hp_token'));
  user = signal<{ name: string; email: string } | null>(
    JSON.parse(localStorage.getItem('hp_user') ?? 'null'),
  );
  login(email: string, password: string, remember: boolean) {
    return this.api
      .post<{ accessToken: string; user: { name: string; email: string } }>('auth/login', {
        email,
        password,
      })
      .pipe(
        map((r) => {
          this.token.set(r.accessToken);
          this.user.set(r.user);
          (remember ? localStorage : sessionStorage).setItem('hp_token', r.accessToken);
          localStorage.setItem('hp_user', JSON.stringify(r.user));
          return r;
        }),
      );
  }
  logout() {
    localStorage.removeItem('hp_token');
    sessionStorage.removeItem('hp_token');
    localStorage.removeItem('hp_user');
    this.token.set(null);
    this.user.set(null);
    void this.router.navigate(['/admin/login']);
  }
}
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  ids = signal<number[]>(JSON.parse(localStorage.getItem('hp_favorites') ?? '[]'));
  toggle(id: number) {
    const next = this.ids().includes(id) ? this.ids().filter((x) => x !== id) : [...this.ids(), id];
    this.ids.set(next);
    localStorage.setItem('hp_favorites', JSON.stringify(next));
  }
  has(id: number) {
    return this.ids().includes(id);
  }
}
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token() ?? sessionStorage.getItem('hp_token');
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && req.url.includes('/admin/')) auth.logout();
      return throwError(() => e);
    }),
  );
};
export const adminGuard = () => {
  const auth = inject(AuthService),
    router = inject(Router);
  return auth.token() || sessionStorage.getItem('hp_token')
    ? true
    : router.createUrlTree(['/admin/login']);
};
