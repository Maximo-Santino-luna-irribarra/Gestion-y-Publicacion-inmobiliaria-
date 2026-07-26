import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
export interface StoredFile {
  url: string;
  filename: string;
}
export abstract class StorageProvider {
  abstract save(file: Express.Multer.File): Promise<StoredFile>;
  abstract remove(filename: string): Promise<void>;
}
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private config: ConfigService) {}
  async save(file: Express.Multer.File) {
    const dir = this.config.get('UPLOAD_DIR', 'uploads');
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(dir, filename), file.buffer);
    return { filename, url: `/uploads/${filename}` };
  }
  async remove(filename: string) {
    await unlink(
      join(this.config.get('UPLOAD_DIR', 'uploads'), filename),
    ).catch(() => undefined);
  }
}
