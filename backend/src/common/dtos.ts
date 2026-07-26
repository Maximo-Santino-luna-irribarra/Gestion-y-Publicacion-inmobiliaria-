import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  AppointmentStatus,
  InquiryStatus,
  OperationType,
  PropertyStatus,
} from '../database/models';

const bool = ({ value }: { value: unknown }) =>
  value === true || value === 'true';
export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @Length(8, 128) password!: string;
}
export class PageDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 12;
  @IsOptional() @IsString() sort?: string;
}
export class PropertyQueryDto extends PageDto {
  @IsOptional() @IsEnum(OperationType) operationType?: OperationType;
  @IsOptional() @IsString() propertyType?: string;
  @IsOptional() @IsEnum(PropertyStatus) status?: PropertyStatus;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @Type(() => Number) @IsInt() rooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() bedrooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() bathrooms?: number;
  @IsOptional() @Type(() => Number) @IsNumber() minArea?: number;
  @IsOptional() @Transform(bool) @IsBoolean() featured?: boolean;
  @IsOptional() @Transform(bool) @IsBoolean() mortgageEligible?: boolean;
  @IsOptional() @Transform(bool) @IsBoolean() professionalUse?: boolean;
  @IsOptional() @Transform(bool) @IsBoolean() acceptsPets?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() garages?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Transform(bool) @IsBoolean() includeDeleted?: boolean;
}
export class PropertyDto {
  @IsString() @Length(3, 160) title!: string;
  @IsString() @Length(2, 40) referenceCode!: string;
  @IsEnum(OperationType) operationType!: OperationType;
  @IsString() propertyType!: string;
  @IsOptional() @IsEnum(PropertyStatus) status?: PropertyStatus;
  @Type(() => Number) @IsPositive() price!: number;
  @IsString() currency!: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() streetNumber?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @Transform(bool) @IsBoolean() showExactAddress?: boolean;
  @IsOptional() @Type(() => Number) @IsNumber() latitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() longitude?: number;
  @IsOptional() @Type(() => Number) @IsInt() rooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() bedrooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() bathrooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() toilets?: number;
  @IsOptional() @Type(() => Number) @IsInt() garages?: number;
  @IsOptional() @Type(() => Number) @IsNumber() coveredArea?: number;
  @IsOptional() @Type(() => Number) @IsNumber() uncoveredArea?: number;
  @IsOptional() @Type(() => Number) @IsNumber() totalArea?: number;
  @IsOptional() @Type(() => Number) @IsInt() floors?: number;
  @IsOptional() @Type(() => Number) @IsInt() unitFloor?: number;
  @IsOptional() @Type(() => Number) @IsInt() age?: number;
  @IsOptional() @Type(() => Number) @IsNumber() expenses?: number;
  @IsOptional() @IsString() orientation?: string;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @Transform(bool) @IsBoolean() acceptsPets?: boolean;
  @IsOptional() @Transform(bool) @IsBoolean() mortgageEligible?: boolean;
  @IsOptional() @Transform(bool) @IsBoolean() professionalUse?: boolean;
  @IsOptional() @Transform(bool) @IsBoolean() featured?: boolean;
  @IsOptional() features?: {
    featureType: string;
    name: string;
    value?: string;
  }[];
}
export class InquiryDto {
  @IsOptional() @Type(() => Number) @IsInt() propertyId?: number;
  @IsString() name!: string;
  @IsString() phone!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() message?: string;
}
export class InquiryUpdateDto {
  @IsOptional() @IsEnum(InquiryStatus) status?: InquiryStatus;
  @IsOptional() @IsString() internalNotes?: string;
}
export class ClientDto {
  @IsString() firstName!: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minimumBudget?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maximumBudget?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() desiredOperation?: string;
  @IsOptional() @IsString() desiredPropertyType?: string;
  @IsOptional() @IsString() desiredZone?: string;
  @IsOptional() @Type(() => Number) @IsInt() desiredRooms?: number;
  @IsOptional() @IsString() notes?: string;
}
export class AppointmentDto {
  @Type(() => Number) @IsInt() propertyId!: number;
  @Type(() => Number) @IsInt() clientId!: number;
  @IsDateString() scheduledAt!: string;
  @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
  @IsOptional() @IsString() notes?: string;
}
export class AppointmentUpdateDto extends PartialType(AppointmentDto) {}
export class StatusDto {
  @IsEnum(PropertyStatus) status!: PropertyStatus;
}
