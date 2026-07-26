import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { assetUrl, AuthService, FavoritesService, Property } from './core';
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<header class="top">
      <a class="brand" routerLink="/"
        ><span class="brandmark">H</span><span>Horizonte <b>Propiedades</b></span></a
      ><button class="nav-toggle" (click)="open = !open" aria-label="Abrir menú">☰</button>
      <nav [class.open]="open">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          >Inicio</a
        ><a routerLink="/propiedades" routerLinkActive="active">Propiedades</a
        ><a routerLink="/nosotros">Nosotros</a><a routerLink="/contacto">Contacto</a
        ><a routerLink="/favoritos">Favoritos</a
        ><a class="btn small" href="https://wa.me/5491140000000">WhatsApp</a>
      </nav>
    </header>
    <main><router-outlet /></main>
    <footer>
      <div>
        <div class="brand light"><span class="brandmark">H</span>Horizonte Propiedades</div>
        <p>Tu próximo hogar en zona sur.</p>
      </div>
      <div>
        <b>Contacto</b>
        <p>+54 11 4000-0000<br />hola@horizonte.test<br />Lanús, Buenos Aires</p>
      </div>
      <div>
        <b>Enlaces</b>
        <p>
          <a routerLink="/propiedades">Propiedades</a><br /><a routerLink="/contacto">Contacto</a
          ><br /><a href="#">Privacidad</a>
        </p>
      </div>
      <p>© {{ year }} Horizonte Propiedades</p>
    </footer>`,
})
export class PublicLayout {
  open = false;
  year = new Date().getFullYear();
}
@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, TitleCasePipe],
  template: `<article class="property-card">
    <div class="photo">
      <img [src]="mainImage()" [alt]="property().title" loading="lazy" /><span class="pill">{{
        property().operationType === 'sale' ? 'Venta' : 'Alquiler'
      }}</span
      ><button
        class="heart"
        (click)="fav.toggle(property().id)"
        [attr.aria-label]="fav.has(property().id) ? 'Quitar favorito' : 'Agregar favorito'"
      >
        {{ fav.has(property().id) ? '♥' : '♡' }}
      </button>
    </div>
    <div class="card-body">
      <small
        >{{ property().propertyType | titlecase }} ·
        {{ property().neighborhood || property().city }}</small
      >
      <h3>{{ property().title }}</h3>
      <strong
        >{{ property().currency }}
        {{ property().price | currency: '' : 'symbol' : '1.0-0' }}</strong
      >
      <div class="facts">
        <span *ngIf="property().rooms">{{ property().rooms }} amb.</span
        ><span *ngIf="property().bedrooms">{{ property().bedrooms }} dorm.</span
        ><span *ngIf="property().bathrooms">{{ property().bathrooms }} baños</span
        ><span *ngIf="property().totalArea">{{ property().totalArea }} m²</span>
      </div>
      <a class="text-link" [routerLink]="['/propiedades', property().slug]">Ver propiedad →</a>
    </div>
  </article>`,
})
export class PropertyCard {
  property = input.required<Property>();
  fav = inject(FavoritesService);
  mainImage = computed(() =>
    assetUrl(
      this.property().images?.find((i) => i.isMain)?.url ||
        this.property().images?.[0]?.url ||
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    ),
  );
}
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<div class="admin-shell">
    <aside>
      <a class="brand light" routerLink="/admin"
        ><span class="brandmark">H</span><span>Horizonte</span></a
      >
      <nav>
        <a routerLink="/admin" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active"
          >Resumen</a
        ><a routerLink="/admin/propiedades" routerLinkActive="active">Propiedades</a
        ><a routerLink="/admin/consultas" routerLinkActive="active">Consultas</a
        ><a routerLink="/admin/visitas" routerLinkActive="active">Visitas</a
        ><a routerLink="/admin/clientes" routerLinkActive="active">Clientes</a
        ><a routerLink="/admin/configuracion" routerLinkActive="active">Configuración</a>
      </nav>
      <button class="logout" (click)="logout()">Cerrar sesión</button>
    </aside>
    <section class="admin-content"><router-outlet /></section>
  </div>`,
})
export class AdminLayout {
  private auth = inject(AuthService);
  logout() {
    this.auth.logout();
  }
}
