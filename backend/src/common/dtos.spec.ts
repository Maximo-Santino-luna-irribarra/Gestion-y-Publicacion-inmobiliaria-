import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto, PropertyDto, PropertyQueryDto } from './dtos';
describe('DTO validation', () => {
  it('rejects an invalid login', async () => {
    expect(
      await validate(
        plainToInstance(LoginDto, { email: 'bad', password: 'short' }),
      ),
    ).toHaveLength(2);
  });
  it('transforms pagination', async () => {
    const dto = plainToInstance(PropertyQueryDto, {
      page: '2',
      limit: '10',
      featured: 'true',
    });
    expect(dto).toMatchObject({ page: 2, limit: 10, featured: true });
  });
  it('requires property essentials', async () => {
    expect(
      (await validate(plainToInstance(PropertyDto, {}))).length,
    ).toBeGreaterThan(0);
  });
});
