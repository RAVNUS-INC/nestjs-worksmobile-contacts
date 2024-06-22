import { Test, TestingModule } from '@nestjs/testing';
import { WorksmobileService } from './worksmobile.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

describe('WorksmobileService', () => {
  let service: WorksmobileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        RedisModule,
      ],
      providers: [WorksmobileService],
    }).compile();

    service = module.get<WorksmobileService>(WorksmobileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('인증', () => {
    it('JWT Payload 검증', async () => {
      const now = Math.floor(new Date().getTime() / 1000);
      const allowRange = 5000; // 오차 범위는 5초로 설정

      const payload = await service.generateJwtPayload();

      expect(payload.iss).toBeDefined();
      expect(payload.sub).toBeDefined();

      // iat, exp 는 테스트 돌리면서 시간 오차 범위 5초 허용
      expect(payload.iat).toBeGreaterThanOrEqual(now - allowRange);
      expect(payload.iat).toBeLessThanOrEqual(now + allowRange);

      const oneHourLater = now + 60 * 60;
      expect(payload.exp).toBeGreaterThanOrEqual(oneHourLater - allowRange);
      expect(payload.exp).toBeLessThanOrEqual(oneHourLater + allowRange);
    });

    it('JWT 토큰 발급', async () => {
      const token = await service.generateJwtToken();

      // jwt 는 header.payload.signature 형태
      const [header, payload, signature] = token.split('.');
      expect(header).toBeDefined();
      expect(payload).toBeDefined();
      expect(signature).toBeDefined();

      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64').toString(),
      );
      expect(decodedPayload.iss).toBeDefined();
      expect(decodedPayload.sub).toBeDefined();
      expect(decodedPayload.iat).toBeDefined();
    });

    it('토큰 요청', async () => {
      const token = await service.requestToken();

      expect(token).toHaveProperty('accessToken');
      expect(token).toHaveProperty('refreshToken');
      expect(token).toHaveProperty('scope');
      expect(token).toHaveProperty('tokenType', 'Bearer');
      expect(token).toHaveProperty('expiresIn', '86400');
    });
  });

  describe('연락처', () => {
    it('목록 조회', async () => {
      const contacts = await service.getContacts();

      console.log(JSON.stringify(contacts, null, 2));
    });

    it('목록 조회 옵션 전달 (옵션 존재)', async () => {
      const customParams = await service.getContactCustomParamByOptions({
        lastSyncTime: '2021-09-01T00:00:00Z',
      });

      expect(customParams).toHaveProperty('searchDateType', 'MODIFIED_TIME');
      expect(customParams).toHaveProperty('startDateTime');
      expect(customParams).toHaveProperty('endDateTime');
    });

    it('목록 조회 옵션 전달 (옵션 없음)', async () => {
      const customParams = await service.getContactCustomParamByOptions();

      expect(customParams).toEqual({});
    });
  });
});
