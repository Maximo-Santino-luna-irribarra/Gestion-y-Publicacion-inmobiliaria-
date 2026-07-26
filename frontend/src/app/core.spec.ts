import { TestBed } from '@angular/core/testing';
import { assetUrl, FavoritesService } from './core';

describe('assetUrl', () => {
  it('points uploaded files to the API server', () => {
    expect(assetUrl('/uploads/casa.webp')).toBe('http://localhost:3000/uploads/casa.webp');
  });

  it('keeps absolute image URLs unchanged', () => {
    const url = 'https://images.example.com/casa.webp';
    expect(assetUrl(url)).toBe(url);
  });
});

describe('FavoritesService', () => {
  const values = new Map<string, string>();
  beforeEach(() => {
    values.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    });
    TestBed.configureTestingModule({});
  });
  it('adds and removes an id', () => {
    const service = TestBed.inject(FavoritesService);
    service.toggle(7);
    expect(service.has(7)).toBe(true);
    service.toggle(7);
    expect(service.has(7)).toBe(false);
  });
});
