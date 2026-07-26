import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/sequelize';
import {
  AppointmentDto,
  AppointmentUpdateDto,
  ClientDto,
  InquiryDto,
  InquiryUpdateDto,
  LoginDto,
  PropertyDto,
  PropertyQueryDto,
} from './common/dtos';
import { JwtAuthGuard } from './common/auth.guard';
import {
  AgencyService,
  AuthService,
  CrmService,
  DashboardService,
  PropertiesService,
} from './app.service';
import { PropertyImage } from './database/models';
import { StorageProvider } from './storage/storage.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }
}
@ApiTags('agency')
@Controller('agency')
export class AgencyController {
  constructor(private service: AgencyService) {}
  @Get() get() {
    return this.service.get();
  }
  @Get('zones') zones() {
    return this.service.listZones();
  }
  @Put() @UseGuards(JwtAuthGuard) @ApiBearerAuth() update(
    @Body() dto: Record<string, unknown>,
  ) {
    return this.service.update(dto);
  }
}
@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private service: PropertiesService) {}
  @Get() list(@Query() q: PropertyQueryDto) {
    return this.service.list(q);
  }
  @Get(':id') one(@Param('id') id: string) {
    return this.service.one(id, true);
  }
  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth() create(
    @Body() dto: PropertyDto,
  ) {
    return this.service.create(dto);
  }
  @Put(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PropertyDto,
  ) {
    return this.service.update(id, dto);
  }
  @Post(':id/duplicate') @UseGuards(JwtAuthGuard) duplicate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.duplicate(id);
  }
  @Delete(':id') @UseGuards(JwtAuthGuard) remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }
  @Post(':id/restore') @UseGuards(JwtAuthGuard) restore(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.restore(id);
  }
}
@ApiTags('admin-properties')
@Controller('admin/properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminPropertiesController {
  constructor(private service: PropertiesService) {}
  @Get() list(@Query() q: PropertyQueryDto) {
    return this.service.list(q, true);
  }
}
@ApiTags('images')
@Controller('properties/:propertyId/images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImagesController {
  constructor(
    @InjectModel(PropertyImage) private images: typeof PropertyImage,
    private storage: StorageProvider,
  ) {}
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_r, f, cb) =>
        cb(
          null,
          ['image/jpeg', 'image/png', 'image/webp'].includes(f.mimetype),
        ),
    }),
  )
  async upload(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('altText') altText?: string,
  ) {
    if (!file) throw new Error('Imagen inválida');
    const stored = await this.storage.save(file);
    const count = await this.images.count({ where: { propertyId } });
    return this.images.create({
      propertyId,
      ...stored,
      altText,
      position: count,
      isMain: count === 0,
    });
  }
  @Patch(':id/main') async main(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.images.update({ isMain: false }, { where: { propertyId } });
    await this.images.update({ isMain: true }, { where: { id, propertyId } });
    return this.images.findAll({
      where: { propertyId },
      order: [['position', 'ASC']],
    });
  }
  @Patch(':id') async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { altText?: string; position?: number },
  ) {
    const item = await this.images.findByPk(id);
    return item?.update(dto);
  }
  @Delete(':id') async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.images.findByPk(id);
    if (item) {
      await this.storage.remove(item.filename);
      await item.destroy();
    }
    return { message: 'Imagen eliminada' };
  }
}
@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private service: CrmService) {}
  @Post() create(@Body() dto: InquiryDto) {
    return this.service.createInquiry(dto);
  }
  @Get() @UseGuards(JwtAuthGuard) list(@Query() q: PropertyQueryDto) {
    return this.service.listInquiries(q);
  }
  @Patch(':id') @UseGuards(JwtAuthGuard) update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InquiryUpdateDto,
  ) {
    return this.service.updateInquiry(id, dto);
  }
}
@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private service: CrmService) {}
  @Get() list(@Query() q: PropertyQueryDto) {
    return this.service.listClients(q);
  }
  @Post() create(@Body() dto: ClientDto) {
    return this.service.createClient(dto);
  }
  @Patch(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClientDto,
  ) {
    return this.service.updateClient(id, dto);
  }
}
@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private service: CrmService) {}
  @Get() list(@Query() q: PropertyQueryDto) {
    return this.service.listAppointments(q);
  }
  @Post() create(@Body() dto: AppointmentDto) {
    return this.service.createAppointment(dto);
  }
  @Patch(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AppointmentUpdateDto,
  ) {
    return this.service.updateAppointment(id, dto);
  }
}
@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private service: DashboardService) {}
  @Get() get() {
    return this.service.get();
  }
}
