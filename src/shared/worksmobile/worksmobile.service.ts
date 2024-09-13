import { Injectable } from '@nestjs/common';
import axios, { HttpStatusCode } from 'axios';
import { WorksmobileEndpoint } from './constants/worksmobile-endpoint.constant';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { RedisService } from '../redis/redis.service';
import { RedisKey } from '../redis/constants/redis-key.constant';
import { WorksmobileTokenInterface } from './interfaces/worksmobile-token.interface';
import { ContactListResponseDto } from './dtos/response/contact-list-response.dto';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { DirectoryUserListResponseDto } from './dtos/response/directory-user-list-response.dto';

/**
 * 토큰 발급 - https://developers.worksmobile.com/kr/docs/auth-jwt
 */
@Injectable()
export class WorksmobileService {
  constructor(
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * JWT 토큰 생성하는 메서드
   */
  async generateJwtToken(): Promise<string> {
    const payload = await this.generateJwtPayload();

    const signOptions: SignOptions = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
      algorithm: 'RS256',
    };

    const privateKey = this.config.get('NAVER_WORKS_PRIVATE_KEY');

    try {
      return jwt.sign(payload, privateKey, signOptions);
    } catch (e) {
      console.error(e);
      throw new Error('JWT 토큰 생성에 실패');
    }
  }

  /**
   * JWT 토큰 페이로드 생성하는 메서드
   */
  async generateJwtPayload() {
    const now = Math.floor(new Date().getTime() / 1000);
    return {
      iss: this.config.get('NAVER_WORKS_CLIENT_ID'),
      sub: this.config.get('NAVER_WORKS_SERVICE_ID'),
      iat: now,
      exp: now + 60 * 60, // 현재 시간으로 부터 1시간
    };
  }

  async requestToken() {
    const token = await this.generateJwtToken();
    return await axios
      .post(
        `${WorksmobileEndpoint.AUTH}`,
        {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: token,
          client_id: this.config.get('NAVER_WORKS_CLIENT_ID'),
          client_secret: this.config.get('NAVER_WORKS_SECRET_ID'),
          scope: 'contact.read,directory.read',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      // return 은 하고 캐싱 처리
      .then(async (res): Promise<WorksmobileTokenInterface> => {
        const payload = {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          scope: res.data.scope,
          tokenType: res.data.token_type,
          expiresIn: res.data.expires_in,
        };

        await this.redisService.set(
          RedisKey.AUTH_WORKSMOBILE,
          JSON.stringify(payload),
          payload.expiresIn,
        );

        return payload;
      })
      .catch((err) => err.response.data);
  }

  async getToken(): Promise<string> {
    const redisToken = await this.redisService.get(RedisKey.AUTH_WORKSMOBILE);
    if (redisToken) {
      return JSON.parse(redisToken).accessToken;
    }

    const token = await this.requestToken();
    return token.accessToken;
  }

  /**
   * https://developers.worksmobile.com/kr/docs/contact-list#Request
   */
  async getContacts(options?: {
    lastSyncTime?: string | undefined;
  }): Promise<ContactListResponseDto> {
    try {
      const res = await axios.get(`${WorksmobileEndpoint.BASE}/contacts`, {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
        params: {
          count: 500, // 한 번에 가져오는 데이터 크기 (최대 500)
          orderBy: 'modifiedTime desc', // 수정 시간 기준으로 정렬 (마지막 시간을 기록하며 최신화 하기 위해)
          ...(await this.getContactCustomParamByOptions(options)),
        },
      });

      return plainToInstance(ContactListResponseDto, res.data);
    } catch (e) {
      console.error(e);
      if (
        axios.isAxiosError(e) &&
        e.response?.status === HttpStatusCode.Unauthorized
      ) {
        await this.redisService.del(RedisKey.AUTH_WORKSMOBILE);
      }

      throw new Error('getContacts 목록을 가져오는데 실패했습니다.');
    }
  }

  /**
   * https://developers.worksmobile.com/kr/docs/user-list
   */
  async getDirectoryUsers(): Promise<DirectoryUserListResponseDto> {
    try {
      const res = await axios.get(`${WorksmobileEndpoint.BASE}/users`, {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
        params: {
          count: 100, // 한 번에 가져오는 데이터 크기 (최대 100)
        },
      });

      return plainToInstance(DirectoryUserListResponseDto, res.data);
    } catch (e) {
      console.error(e);
      if (
        axios.isAxiosError(e) &&
        e.response?.status === HttpStatusCode.Unauthorized
      ) {
        await this.redisService.del(RedisKey.AUTH_WORKSMOBILE);
      }

      throw new Error('getDirectoryUsers 목록을 가져오는데 실패했습니다');
    }
  }

  async getContactCustomParamByOptions(options?: {
    lastSyncTime?: string | undefined;
  }): Promise<{ [key: string]: string }> {
    const customParams = {};
    if (options?.lastSyncTime) {
      customParams['searchDateType'] = 'MODIFIED_TIME';
      customParams['startDateTime'] = dayjs(options.lastSyncTime)
        .add(1, 'seconds')
        .format('YYYY-MM-DDTHH:mm:ss+09:00');
      customParams['endDateTime'] = dayjs().format('YYYY-MM-DDTHH:mm:ss+09:00');
    }

    return customParams;
  }

  convertToShortFieldKey(telephoneType: string): string {
    switch (telephoneType) {
      case 'CELLPHONE':
        return 'tcp';
      case 'WORK':
        return 'tw';
      case 'WORK_FAX':
        return 'twf';
      case 'HOME':
        return 'th';
      case 'HOME_FAX':
        return 'thf';
      case 'OTHER':
        return 'to';
      case 'CUSTOM':
        return 'tc';
      default:
        throw new Error('전화번호 타입이 잘못되었습니다.');
    }
  }
}
