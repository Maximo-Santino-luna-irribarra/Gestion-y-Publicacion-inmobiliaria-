import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Agency, ApiService, assetUrl, FavoritesService, Paged, Property } from './core';
import { PropertyCard } from './shared';
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyCard],
  template: `<section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">INMOBILIARIA EN ZONA SUR</span>
        <h1>Encontrá el lugar donde empieza tu próxima historia.</h1>
        <p>
          Propiedades seleccionadas en Lanús, Avellaneda y alrededores, con acompañamiento cercano
          en cada paso.
        </p>
        <div class="actions">
          <a class="btn" routerLink="/propiedades">Ver propiedades</a
          ><a class="btn ghost" routerLink="/contacto">Contactarnos</a>
        </div>
        <div class="trust">
          <span><b>+12</b> años de experiencia</span><span><b>6</b> zonas que conocemos</span>
        </div>
      </div>
      <div class="hero-image">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
          alt="Casa moderna y luminosa"
          loading="eager"
          fetchpriority="high"
        />
        <div class="floating-card">
          Atención personalizada<br /><small>De la búsqueda a las llaves</small>
        </div>
      </div>
    </section>
    <section class="section intro">
      <div>
        <span class="eyebrow">SOBRE NOSOTROS</span>
        <h2>Más que propiedades,<br />decisiones bien acompañadas.</h2>
      </div>
      <div>
        <p>{{ agency()?.description }}</p>
        <div class="benefits">
          <span>✓ Conocimiento local</span><span>✓ Publicaciones actualizadas</span
          ><span>✓ Acompañamiento integral</span><span>✓ Trato claro y cercano</span>
        </div>
      </div>
    </section>
    <section class="section alt">
      <div class="section-head">
        <div>
          <span class="eyebrow">OPORTUNIDADES</span>
          <h2>Propiedades destacadas</h2>
        </div>
        <a routerLink="/propiedades">Ver todas →</a>
      </div>
      <div class="grid"><app-property-card *ngFor="let p of featured()" [property]="p" /></div>
    </section>
    <section class="section">
      <div class="section-head">
        <div>
          <span class="eyebrow">CERCA TUYO</span>
          <h2>Zonas que conocemos de verdad</h2>
        </div>
      </div>
      <div class="zones">
        <a
          *ngFor="let z of agency()?.zones"
          [routerLink]="['/propiedades']"
          [queryParams]="{ city: z.name }"
          ><span>Explorar</span>
          <h3>{{ z.name }}</h3>
          <p>{{ z.description }}</p></a
        >
      </div>
    </section>
    <section class="cta">
      <span class="eyebrow">HABLEMOS</span>
      <h2>Tu próxima propiedad puede estar más cerca de lo que imaginás.</h2>
      <a class="btn light-btn" routerLink="/contacto">Contanos qué buscás</a>
    </section>`,
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  agency = signal<Agency | null>(null);
  featured = signal<Property[]>([]);
  ngOnInit() {
    forkJoin({
      agency: this.api.get<Agency>('agency'),
      props: this.api.get<Paged<Property>>('properties', { featured: true, limit: 3 }),
    }).subscribe(({ agency, props }) => {
      this.agency.set(agency);
      this.featured.set(props.items);
    });
  }
}
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PropertyCard],
  template: `<section class="page-title">
      <span class="eyebrow">EXPLORÁ</span>
      <h1>Propiedades</h1>
      <p>Usá los filtros para encontrar una opción a tu medida.</p>
    </section>
    <section class="listing">
      <aside class="filters" [class.mobile-open]="filtersOpen">
        <div class="filter-head">
          <h3>Filtros</h3>
          <button (click)="clear()">Limpiar</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="apply()">
          <label
            >Operación<select formControlName="operationType">
              <option value="">Todas</option>
              <option value="sale">Venta</option>
              <option value="rent">Alquiler</option>
            </select></label
          ><label
            >Tipo<select formControlName="propertyType">
              <option value="">Todos</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="terreno">Terreno</option>
              <option value="local">Local</option>
              <option value="oficina">Oficina</option>
              <option value="galpon">Galpón</option>
            </select></label
          ><label>Ciudad<input formControlName="city" placeholder="Ej. Lanús" /></label>
          <div class="form-row">
            <label>Precio desde<input type="number" formControlName="minPrice" /></label
            ><label>Precio hasta<input type="number" formControlName="maxPrice" /></label>
          </div>
          <label
            >Ambientes<select formControlName="rooms">
              <option value="">Cualquiera</option>
              <option *ngFor="let n of [1, 2, 3, 4, 5]" [value]="n">{{ n }}+</option>
            </select></label
          ><label class="check"
            ><input type="checkbox" formControlName="featured" /> Sólo destacadas</label
          ><label class="check"
            ><input type="checkbox" formControlName="mortgageEligible" /> Apto crédito</label
          ><button class="btn full">Aplicar filtros</button>
        </form>
      </aside>
      <div class="results">
        <button class="btn filter-button" (click)="filtersOpen = !filtersOpen">Filtros</button>
        <div class="results-head">
          <b>{{ data()?.meta?.total || 0 }} propiedades</b
          ><select [formControl]="sort" (change)="apply()">
            <option value="recent">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="area_desc">Mayor superficie</option>
          </select>
        </div>
        <div *ngIf="loading()" class="grid">
          <div class="skeleton" *ngFor="let x of [1, 2, 3, 4, 5, 6]"></div>
        </div>
        <div class="grid" *ngIf="!loading() && data()?.items?.length">
          <app-property-card *ngFor="let p of data()?.items" [property]="p" />
        </div>
        <div class="empty" *ngIf="!loading() && !data()?.items?.length">
          <h2>No encontramos propiedades</h2>
          <p>Probá ampliar la zona o el rango de precio.</p>
          <button class="btn" (click)="clear()">Limpiar filtros</button>
        </div>
        <div class="pagination" *ngIf="(data()?.meta?.pages || 0) > 1">
          <button [disabled]="page() === 1" (click)="go(page() - 1)">Anterior</button
          ><span>Página {{ page() }} de {{ data()?.meta?.pages }}</span
          ><button [disabled]="page() === data()?.meta?.pages" (click)="go(page() + 1)">
            Siguiente
          </button>
        </div>
      </div>
    </section>`,
})
export class PropertiesPage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  data = signal<Paged<Property> | null>(null);
  loading = signal(true);
  page = signal(1);
  filtersOpen = false;
  sort = this.fb.control('recent', { nonNullable: true });
  form = this.fb.group({
    operationType: '',
    propertyType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    rooms: '',
    featured: false,
    mortgageEligible: false,
  });
  ngOnInit() {
    this.route.queryParams.subscribe((q) => {
      this.form.patchValue(q, { emitEvent: false });
      this.sort.setValue(q['sort'] || 'recent');
      this.page.set(Number(q['page'] || 1));
      this.load();
    });
  }
  apply() {
    void this.router.navigate([], {
      queryParams: { ...this.form.value, sort: this.sort.value, page: 1 },
      queryParamsHandling: 'merge',
    });
    this.filtersOpen = false;
  }
  clear() {
    this.form.reset({
      operationType: '',
      propertyType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      rooms: '',
      featured: false,
      mortgageEligible: false,
    });
    void this.router.navigate([]);
  }
  go(p: number) {
    void this.router.navigate([], { queryParams: { page: p }, queryParamsHandling: 'merge' });
  }
  private load() {
    this.loading.set(true);
    this.api
      .get<Paged<Property>>('properties', {
        ...this.form.value,
        page: this.page(),
        sort: this.sort.value,
      } as never)
      .subscribe({
        next: (r) => {
          this.data.set(r);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
@Component({
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TitleCasePipe, ReactiveFormsModule, PropertyCard],
  template: `<div *ngIf="property() as p">
    <section class="detail">
      <div class="gallery">
        <img
          class="main-photo"
          [src]="selected() || fallback"
          [alt]="p.title"
          loading="eager"
          fetchpriority="high"
        />
        <div class="thumbs">
          <button *ngFor="let img of p.images" (click)="selected.set(imageUrl(img.url))">
            <img [src]="imageUrl(img.url)" [alt]="img.altText || p.title" loading="lazy" />
          </button>
        </div>
      </div>
      <div class="detail-info">
        <span class="pill inline">{{ p.operationType === 'sale' ? 'Venta' : 'Alquiler' }}</span
        ><small>{{ p.propertyType | titlecase }} · Código {{ p.referenceCode }}</small>
        <h1>{{ p.title }}</h1>
        <p class="location">⌖ {{ p.neighborhood }}, {{ p.city }}</p>
        <div class="big-price">
          {{ p.currency }} {{ p.price | currency: '' : 'symbol' : '1.0-0' }}
        </div>
        <div class="facts big">
          <span *ngIf="p.rooms"
            ><b>{{ p.rooms }}</b> Ambientes</span
          ><span *ngIf="p.bedrooms"
            ><b>{{ p.bedrooms }}</b> Dormitorios</span
          ><span *ngIf="p.bathrooms"
            ><b>{{ p.bathrooms }}</b> Baños</span
          ><span *ngIf="p.totalArea"
            ><b>{{ p.totalArea }}</b> m² totales</span
          >
        </div>
        <a class="btn full" [href]="whatsapp(p)" target="_blank">Consultar por WhatsApp</a
        ><button class="btn ghost full" (click)="fav.toggle(p.id)">
          {{ fav.has(p.id) ? 'Quitar de favoritos' : 'Guardar en favoritos' }}
        </button>
      </div>
    </section>
    <section class="detail-bottom">
      <article>
        <h2>Descripción</h2>
        <p class="description">{{ p.description }}</p>
        <h2>Características</h2>
        <div class="feature-grid">
          <span *ngFor="let f of p.features">✓ {{ f.name }}</span>
        </div>
        <h2>Ubicación aproximada</h2>
        <div class="map">
          {{ p.neighborhood }}, {{ p.city
          }}<small>La dirección exacta se informa al coordinar una visita.</small>
        </div>
      </article>
      <aside class="contact-box">
        <h3>¿Querés conocerla?</h3>
        <p>Dejanos tus datos y te contactamos.</p>
        <form [formGroup]="form" (ngSubmit)="send(p.id)">
          <label>Nombre<input formControlName="name" /></label
          ><label>Teléfono<input formControlName="phone" /></label
          ><label>Correo<input formControlName="email" type="email" /></label
          ><label>Mensaje<textarea formControlName="message"></textarea></label
          ><button class="btn full" [disabled]="form.invalid">Enviar consulta</button>
          <p class="success" *ngIf="sent()">¡Recibimos tu consulta!</p>
        </form>
      </aside>
    </section>
  </div>`,
})
export class PropertyDetailPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  property = signal<Property | null>(null);
  selected = signal('');
  sent = signal(false);
  fav = inject(FavoritesService);
  fallback =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85';
  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    message: ['Hola, quisiera recibir más información.'],
  });
  ngOnInit() {
    this.api
      .get<Property>(`properties/${this.route.snapshot.paramMap.get('slug')}`)
      .subscribe((p) => {
        this.property.set(p);
        this.selected.set(
          this.imageUrl(
            p.images?.find((i) => i.isMain)?.url || p.images?.[0]?.url || this.fallback,
          ),
        );
      });
  }
  imageUrl(url?: string) {
    return assetUrl(url);
  }
  whatsapp(p: Property) {
    return `https://wa.me/5491140000000?text=${encodeURIComponent(`Hola, consulto por ${p.title} (${p.referenceCode}) ${location.href}`)}`;
  }
  send(propertyId: number) {
    if (this.form.invalid) return;
    this.api.post('inquiries', { ...this.form.value, propertyId }).subscribe(() => {
      this.sent.set(true);
      this.form.reset();
    });
  }
}
@Component({
  standalone: true,
  imports: [CommonModule, PropertyCard],
  template: `<section class="page-title">
      <h1>Mis favoritos</h1>
      <p>Guardados en este dispositivo, sin necesidad de registrarte.</p>
    </section>
    <section class="section">
      <div class="grid" *ngIf="items().length">
        <app-property-card *ngFor="let p of items()" [property]="p" />
      </div>
      <div class="empty" *ngIf="!items().length">
        <h2>Todavía no guardaste propiedades</h2>
        <p>Usá el corazón de cada publicación para armar tu selección.</p>
      </div>
    </section>`,
})
export class FavoritesPage implements OnInit {
  private api = inject(ApiService);
  fav = inject(FavoritesService);
  items = signal<Property[]>([]);
  ngOnInit() {
    this.api
      .get<Paged<Property>>('properties', { limit: 100 })
      .subscribe((r) => this.items.set(r.items.filter((p) => this.fav.has(p.id))));
  }
}
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<section class="page-title">
      <span class="eyebrow">ESTAMOS CERCA</span>
      <h1>Conversemos</h1>
      <p>Contanos qué necesitás. Te respondemos con información clara y sin compromiso.</p>
    </section>
    <section class="contact-page">
      <div>
        <h2>Horizonte Propiedades</h2>
        <div class="contact-list">
          <p><b>WhatsApp</b><br />+54 11 4000-0000</p>
          <p><b>Correo</b><br />hola@horizonte.test</p>
          <p><b>Oficina</b><br />Lanús, Buenos Aires</p>
          <p><b>Horarios</b><br />Lun–Vie 9 a 18 h · Sáb 9 a 13 h</p>
        </div>
        <div class="map large">Mapa de ubicación aproximada</div>
      </div>
      <form class="contact-form" [formGroup]="form" (ngSubmit)="send()">
        <h2>Dejanos un mensaje</h2>
        <label>Nombre<input formControlName="name" /></label
        ><label>Teléfono<input formControlName="phone" /></label
        ><label>Correo<input formControlName="email" /></label
        ><label>Mensaje<textarea rows="5" formControlName="message"></textarea></label
        ><button class="btn" [disabled]="form.invalid">Enviar mensaje</button>
        <p class="success" *ngIf="sent()">Gracias. Te contactaremos pronto.</p>
      </form>
    </section>`,
})
export class ContactPage {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  sent = signal(false);
  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    message: ['', Validators.required],
  });
  send() {
    if (this.form.valid)
      this.api.post('inquiries', this.form.value).subscribe(() => this.sent.set(true));
  }
}
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="about">
    <div>
      <span class="eyebrow">NUESTRA HISTORIA</span>
      <h1>Conocemos la zona.<br />Entendemos las decisiones.</h1>
      <p>
        Horizonte Propiedades nació para hacer que comprar, vender o alquilar sea un proceso más
        humano y transparente.
      </p>
      <p>
        Hace más de 12 años trabajamos en Lanús, Avellaneda y localidades cercanas. Escuchamos
        primero, explicamos cada alternativa y acompañamos hasta el cierre.
      </p>
      <a class="btn" routerLink="/contacto">Conocenos</a>
    </div>
    <img
      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85"
      alt="Equipo inmobiliario trabajando"
      loading="lazy"
    />
  </section>`,
})
export class AboutPage {}
