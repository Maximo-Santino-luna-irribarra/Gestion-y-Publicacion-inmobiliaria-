import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

export enum PropertyStatus {
  DRAFT = 'draft',
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  RENTED = 'rented',
  PAUSED = 'paused',
}
export enum OperationType {
  SALE = 'sale',
  RENT = 'rent',
}
export enum InquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  APPOINTMENT = 'appointment_scheduled',
  NEGOTIATION = 'negotiation',
  CLOSED = 'closed',
  DISCARDED = 'discarded',
}
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
}

@Table({ tableName: 'users', underscored: true })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @Column({ allowNull: false }) declare name: string;
  @Column({ allowNull: false, unique: true }) declare email: string;
  @Column({ field: 'password_hash', allowNull: false })
  declare passwordHash: string;
  @Column({ defaultValue: true }) declare active: boolean;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({ tableName: 'real_estate_agencies', underscored: true })
export class RealEstateAgency extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @Column({ allowNull: false }) declare name: string;
  @Column({ unique: true, allowNull: false }) declare slug: string;
  @Column declare logoUrl?: string;
  @Column declare heroImageUrl?: string;
  @Column declare slogan?: string;
  @Column(DataType.TEXT) declare description?: string;
  @Column declare yearsOfExperience?: number;
  @Column declare address?: string;
  @Column declare province?: string;
  @Column declare city?: string;
  @Column declare phone?: string;
  @Column declare whatsapp?: string;
  @Column declare email?: string;
  @Column(DataType.TEXT) declare openingHours?: string;
  @Column declare instagramUrl?: string;
  @Column declare facebookUrl?: string;
  @Column({ defaultValue: '#0f766e' }) declare primaryColor: string;
  @Column({ defaultValue: '#d97706' }) declare secondaryColor: string;
  @Column({ defaultValue: true }) declare showPublicStats: boolean;
  @Column({ defaultValue: false }) declare showExactAddress: boolean;
  @HasMany(() => AgencyZone) declare zones: AgencyZone[];
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({ tableName: 'agency_zones', underscored: true })
export class AgencyZone extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @ForeignKey(() => RealEstateAgency)
  @Column({ allowNull: false })
  declare agencyId: number;
  @BelongsTo(() => RealEstateAgency) declare agency: RealEstateAgency;
  @Column({ allowNull: false }) declare name: string;
  @Column({ unique: true, allowNull: false }) declare slug: string;
  @Column(DataType.TEXT) declare description?: string;
  @Column declare imageUrl?: string;
  @Column({ defaultValue: true }) declare active: boolean;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'properties',
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['operation_type'] },
    { fields: ['property_type'] },
    { fields: ['status'] },
    { fields: ['province', 'city', 'neighborhood'] },
    { fields: ['price'] },
    { fields: ['rooms'] },
    { fields: ['bedrooms'] },
    { fields: ['featured'] },
    { fields: ['published_at'] },
  ],
})
export class Property extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @Column({ unique: true, allowNull: false }) declare referenceCode: string;
  @Column({ unique: true, allowNull: false }) declare slug: string;
  @Column({ allowNull: false }) declare title: string;
  @Column(DataType.TEXT) declare shortDescription?: string;
  @Column(DataType.TEXT) declare description?: string;
  @Column({
    type: DataType.ENUM(...Object.values(OperationType)),
    allowNull: false,
  })
  declare operationType: OperationType;
  @Column({ allowNull: false }) declare propertyType: string;
  @Column({
    type: DataType.ENUM(...Object.values(PropertyStatus)),
    defaultValue: PropertyStatus.DRAFT,
  })
  declare status: PropertyStatus;
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  declare price: number;
  @Column({ defaultValue: 'USD' }) declare currency: string;
  @Column declare province?: string;
  @Column declare city?: string;
  @Column declare neighborhood?: string;
  @Column declare street?: string;
  @Column declare streetNumber?: string;
  @Column declare postalCode?: string;
  @Column({ defaultValue: false }) declare showExactAddress: boolean;
  @Column(DataType.DECIMAL(10, 7)) declare latitude?: number;
  @Column(DataType.DECIMAL(10, 7)) declare longitude?: number;
  @Column declare rooms?: number;
  @Column declare bedrooms?: number;
  @Column declare bathrooms?: number;
  @Column declare toilets?: number;
  @Column declare garages?: number;
  @Column(DataType.DECIMAL(10, 2)) declare coveredArea?: number;
  @Column(DataType.DECIMAL(10, 2)) declare uncoveredArea?: number;
  @Column(DataType.DECIMAL(10, 2)) declare totalArea?: number;
  @Column declare floors?: number;
  @Column declare unitFloor?: number;
  @Column declare age?: number;
  @Column(DataType.DECIMAL(12, 2)) declare expenses?: number;
  @Column declare orientation?: string;
  @Column declare condition?: string;
  @Column({ defaultValue: false }) declare acceptsPets: boolean;
  @Column({ defaultValue: false }) declare mortgageEligible: boolean;
  @Column({ defaultValue: false }) declare professionalUse: boolean;
  @Column({ defaultValue: false }) declare featured: boolean;
  @Column declare publishedAt?: Date;
  @Column({ defaultValue: 0 }) declare viewCount: number;
  @HasMany(() => PropertyImage) declare images: PropertyImage[];
  @HasMany(() => PropertyFeature) declare features: PropertyFeature[];
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
  @DeletedAt declare deletedAt?: Date;
}

@Table({ tableName: 'property_images', underscored: true })
export class PropertyImage extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @ForeignKey(() => Property)
  @Column({ allowNull: false })
  declare propertyId: number;
  @BelongsTo(() => Property) declare property: Property;
  @Column({ allowNull: false }) declare url: string;
  @Column({ allowNull: false }) declare filename: string;
  @Column declare altText?: string;
  @Column({ defaultValue: 0 }) declare position: number;
  @Column({ defaultValue: false }) declare isMain: boolean;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'property_features',
  underscored: true,
  indexes: [{ unique: true, fields: ['property_id', 'name'] }],
})
export class PropertyFeature extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @ForeignKey(() => Property)
  @Column({ allowNull: false })
  declare propertyId: number;
  @BelongsTo(() => Property) declare property: Property;
  @Column({ allowNull: false }) declare featureType: string;
  @Column({ allowNull: false }) declare name: string;
  @Column declare value?: string;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'clients',
  underscored: true,
  indexes: [{ fields: ['email'] }, { fields: ['phone'] }],
})
export class Client extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @Column({ allowNull: false }) declare firstName: string;
  @Column declare lastName?: string;
  @Column declare phone?: string;
  @Column declare email?: string;
  @Column(DataType.DECIMAL(15, 2)) declare minimumBudget?: number;
  @Column(DataType.DECIMAL(15, 2)) declare maximumBudget?: number;
  @Column declare currency?: string;
  @Column declare desiredOperation?: string;
  @Column declare desiredPropertyType?: string;
  @Column declare desiredZone?: string;
  @Column declare desiredRooms?: number;
  @Column(DataType.TEXT) declare notes?: string;
  @HasMany(() => Inquiry) declare inquiries: Inquiry[];
  @HasMany(() => Appointment) declare appointments: Appointment[];
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'inquiries',
  underscored: true,
  indexes: [{ fields: ['status', 'created_at'] }],
})
export class Inquiry extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @ForeignKey(() => Property) @Column declare propertyId?: number;
  @ForeignKey(() => Client) @Column declare clientId?: number;
  @BelongsTo(() => Property) declare property?: Property;
  @BelongsTo(() => Client) declare client?: Client;
  @Column({ allowNull: false }) declare name: string;
  @Column({ allowNull: false }) declare phone: string;
  @Column declare email?: string;
  @Column(DataType.TEXT) declare message?: string;
  @Column({
    type: DataType.ENUM(...Object.values(InquiryStatus)),
    defaultValue: InquiryStatus.NEW,
  })
  declare status: InquiryStatus;
  @Column(DataType.TEXT) declare internalNotes?: string;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'appointments',
  underscored: true,
  indexes: [{ fields: ['scheduled_at', 'status'] }],
})
export class Appointment extends Model {
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;
  @ForeignKey(() => Property)
  @Column({ allowNull: false })
  declare propertyId: number;
  @ForeignKey(() => Client)
  @Column({ allowNull: false })
  declare clientId: number;
  @BelongsTo(() => Property) declare property: Property;
  @BelongsTo(() => Client) declare client: Client;
  @Column({ allowNull: false }) declare scheduledAt: Date;
  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    defaultValue: AppointmentStatus.PENDING,
  })
  declare status: AppointmentStatus;
  @Column(DataType.TEXT) declare notes?: string;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

export const MODELS = [
  User,
  RealEstateAgency,
  AgencyZone,
  Property,
  PropertyImage,
  PropertyFeature,
  Client,
  Inquiry,
  Appointment,
];
