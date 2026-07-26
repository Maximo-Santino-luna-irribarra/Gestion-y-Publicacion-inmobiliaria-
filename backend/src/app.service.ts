import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { Op, Order, WhereOptions } from 'sequelize';
import {
  AppointmentDto,
  ClientDto,
  InquiryDto,
  InquiryUpdateDto,
  LoginDto,
  PropertyDto,
  PropertyQueryDto,
} from './common/dtos';
import {
  AgencyZone,
  Appointment,
  Client,
  Inquiry,
  Property,
  PropertyFeature,
  PropertyImage,
  PropertyStatus,
  RealEstateAgency,
  User,
} from './database/models';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private users: typeof User,
    private jwt: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { email: dto.email.toLowerCase(), active: true },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        name: user.name,
      }),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property) private model: typeof Property,
    @InjectModel(PropertyFeature) private features: typeof PropertyFeature,
  ) {}
  async list(q: PropertyQueryDto, admin = false) {
    const where: WhereOptions = {};
    const keys = [
      'operationType',
      'propertyType',
      'status',
      'province',
      'city',
      'neighborhood',
      'currency',
      'rooms',
      'bedrooms',
      'bathrooms',
      'featured',
      'mortgageEligible',
      'professionalUse',
      'acceptsPets',
    ] as const;
    for (const k of keys)
      if (q[k] !== undefined) Object.assign(where, { [k]: q[k] });
    if (!admin && !q.status)
      Object.assign(where, { status: PropertyStatus.AVAILABLE });
    if (q.minPrice || q.maxPrice)
      Object.assign(where, {
        price: {
          ...(q.minPrice ? { [Op.gte]: q.minPrice } : {}),
          ...(q.maxPrice ? { [Op.lte]: q.maxPrice } : {}),
        },
      });
    if (q.minArea) Object.assign(where, { totalArea: { [Op.gte]: q.minArea } });
    if (q.garages) Object.assign(where, { garages: { [Op.gte]: q.garages } });
    if (q.search)
      Object.assign(where, {
        [Op.or]: [
          { title: { [Op.like]: `%${q.search}%` } },
          { referenceCode: { [Op.like]: `%${q.search}%` } },
        ],
      });
    const orders: Record<string, Order> = {
      price_asc: [['price', 'ASC']],
      price_desc: [['price', 'DESC']],
      area_desc: [['totalArea', 'DESC']],
      recent: [['publishedAt', 'DESC']],
    };
    const { rows, count } = await this.model.findAndCountAll({
      where,
      include: [
        { model: PropertyImage, separate: true, order: [['position', 'ASC']] },
        PropertyFeature,
      ],
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
      order: orders[q.sort ?? 'recent'] ?? orders.recent,
      distinct: true,
      paranoid: !q.includeDeleted,
    });
    return {
      items: rows,
      meta: {
        page: q.page,
        limit: q.limit,
        total: count,
        pages: Math.ceil(count / q.limit),
      },
    };
  }
  async one(idOrSlug: string, countView = false) {
    const numeric = /^\d+$/.test(idOrSlug);
    const item = await this.model.findOne({
      where: numeric ? { id: Number(idOrSlug) } : { slug: idOrSlug },
      include: [PropertyImage, PropertyFeature],
      paranoid: false,
    });
    if (!item) throw new NotFoundException('Propiedad no encontrada');
    if (countView) await item.increment('viewCount');
    return item;
  }
  async create(dto: PropertyDto) {
    const slug = await this.uniqueSlug(dto.title);
    const item = await this.model.create({
      ...dto,
      slug,
      publishedAt: dto.status === PropertyStatus.AVAILABLE ? new Date() : null,
    });
    await this.replaceFeatures(item.id, dto.features);
    return this.one(String(item.id));
  }
  async update(id: number, dto: Partial<PropertyDto>) {
    const item = await this.one(String(id));
    await item.update({
      ...dto,
      ...(dto.title ? { slug: await this.uniqueSlug(dto.title, id) } : {}),
      ...(dto.status === PropertyStatus.AVAILABLE && !item.publishedAt
        ? { publishedAt: new Date() }
        : {}),
    });
    if (dto.features) await this.replaceFeatures(id, dto.features);
    return this.one(String(id));
  }
  async duplicate(id: number) {
    const source = await this.one(String(id));
    const values = source.toJSON() as Record<string, unknown>;
    delete values.id;
    delete values.images;
    delete values.features;
    delete values.createdAt;
    delete values.updatedAt;
    const suffix = Date.now().toString().slice(-6);
    return this.create({
      ...values,
      title: `${source.title} (copia)`,
      referenceCode: `${source.referenceCode}-${suffix}`,
      status: PropertyStatus.DRAFT,
      features: source.features?.map((f) => ({
        featureType: f.featureType,
        name: f.name,
        value: f.value,
      })),
    } as PropertyDto);
  }
  async remove(id: number) {
    const item = await this.one(String(id));
    await item.destroy();
    return { message: 'Propiedad eliminada' };
  }
  async restore(id: number) {
    await this.model.restore({ where: { id } });
    return this.one(String(id));
  }
  private async uniqueSlug(title: string, exclude?: number) {
    const base = slugify(title, { lower: true, strict: true });
    let candidate = base;
    let n = 1;
    while (
      await this.model.count({
        where: {
          slug: candidate,
          ...(exclude ? { id: { [Op.ne]: exclude } } : {}),
        },
        paranoid: false,
      })
    )
      candidate = `${base}-${++n}`;
    return candidate;
  }
  private async replaceFeatures(id: number, values?: PropertyDto['features']) {
    if (!values) return;
    await this.features.destroy({ where: { propertyId: id } });
    await this.features.bulkCreate(
      values.map((v) => ({ ...v, propertyId: id })),
    );
  }
}

@Injectable()
export class CrmService {
  constructor(
    @InjectModel(Inquiry) private inquiries: typeof Inquiry,
    @InjectModel(Client) private clients: typeof Client,
    @InjectModel(Appointment) private appointments: typeof Appointment,
  ) {}
  async createInquiry(dto: InquiryDto) {
    let client = dto.email
      ? await this.clients.findOne({ where: { email: dto.email } })
      : null;
    client ??= await this.clients.create({
      firstName: dto.name,
      phone: dto.phone,
      email: dto.email,
    });
    return this.inquiries.create({ ...dto, clientId: client.id });
  }
  listInquiries(q: PropertyQueryDto) {
    return this.paged(this.inquiries, q, {
      include: [Property, Client],
      order: [['createdAt', 'DESC']],
    });
  }
  async updateInquiry(id: number, dto: InquiryUpdateDto) {
    return this.update(this.inquiries, id, dto);
  }
  listClients(q: PropertyQueryDto) {
    return this.paged(this.clients, q, {
      include: [Inquiry, Appointment],
      order: [['createdAt', 'DESC']],
    });
  }
  createClient(dto: ClientDto) {
    return this.clients.create(dto as never);
  }
  updateClient(id: number, dto: Partial<ClientDto>) {
    return this.update(this.clients, id, dto);
  }
  listAppointments(q: PropertyQueryDto) {
    return this.paged(this.appointments, q, {
      include: [Property, Client],
      order: [['scheduledAt', 'ASC']],
    });
  }
  createAppointment(dto: AppointmentDto) {
    return this.appointments.create(dto as never);
  }
  updateAppointment(id: number, dto: Partial<AppointmentDto>) {
    return this.update(this.appointments, id, dto);
  }
  private async paged(model: any, q: PropertyQueryDto, options: object) {
    const { rows, count } = await model.findAndCountAll({
      ...options,
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
    });
    return {
      items: rows,
      meta: {
        page: q.page,
        limit: q.limit,
        total: count,
        pages: Math.ceil(count / q.limit),
      },
    };
  }
  private async update(model: any, id: number, dto: object) {
    const item = await model.findByPk(id);
    if (!item) throw new NotFoundException('Registro no encontrado');
    return item.update(dto);
  }
}

@Injectable()
export class AgencyService {
  constructor(
    @InjectModel(RealEstateAgency) private model: typeof RealEstateAgency,
    @InjectModel(AgencyZone) private zones: typeof AgencyZone,
  ) {}
  get() {
    return this.model.findOne({ include: [AgencyZone] });
  }
  async update(dto: Record<string, unknown>) {
    const item = await this.model.findOne();
    if (!item) throw new NotFoundException('Inmobiliaria no configurada');
    return item.update(dto);
  }
  listZones() {
    return this.zones.findAll({ where: { active: true } });
  }
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Property) private properties: typeof Property,
    @InjectModel(Inquiry) private inquiries: typeof Inquiry,
    @InjectModel(Appointment) private appointments: typeof Appointment,
  ) {}
  async get() {
    const statuses = await Promise.all(
      Object.values(PropertyStatus).map(async (status) => [
        status,
        await this.properties.count({ where: { status } }),
      ]),
    );
    return {
      properties: Object.fromEntries(statuses),
      newInquiries: await this.inquiries.count({ where: { status: 'new' } }),
      upcomingAppointments: await this.appointments.count({
        where: { scheduledAt: { [Op.gte]: new Date() } },
      }),
      latestProperties: await this.properties.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
      }),
      mostViewed: await this.properties.findAll({
        limit: 5,
        order: [['viewCount', 'DESC']],
      }),
      recentInquiries: await this.inquiries.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
      }),
    };
  }
}
