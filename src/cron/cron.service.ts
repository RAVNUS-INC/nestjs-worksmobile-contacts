import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WorksmobileService } from '../shared/worksmobile/worksmobile.service';
import { UserBulkInsertInterface } from './interfaces/user-bulk-insert.interface';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { stringUtil } from '../shared/utils/string.util';
import { Users } from '../shared/entities/users.entity';
import {
  WorksmobileDataMethod,
  WorksmobileDataMethodType,
} from '../shared/worksmobile/constants/worksmobile-data-method.constant';
import dayjs from 'dayjs';

@Injectable()
export class CronService {
  constructor(
    private readonly worksmobileService: WorksmobileService,
    @InjectRepository(Users) private userRepository: Repository<Users>,
  ) {}

  /**
   * 네이버 웍스모바일 주소록 동기화
   *
   * 삭제된 연락처를 동기화하기 위해 모든 연락처의 contactId 를 조회하여
   * API 응답으로 받은 contactId 와 비교하여 삭제된 연락처를 찾아내는 방식으로 동작
   */
  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: WorksmobileDataMethod.GetContacts,
    timeZone: 'Asia/Seoul',
  })
  async syncWorksmobileContacts(): Promise<void> {
    await this.syncWorksmobileData(
      WorksmobileDataMethod.GetContacts,
      { isInternal: 'N' },
      'contacts',
      (contact) => ({
        ...contact,
        name: `${contact?.contactName?.lastName ?? ''}${contact?.contactName?.firstName ?? ''} ${contact?.organizations?.[0]?.title ?? ''}`,
        isInternal: 'N',
        id: contact.contactId,
        emails: JSON.stringify(contact.emails),
        organizations: JSON.stringify(contact.organizations),
        ...(contact.telephones
          ? contact.telephones.reduce(
              (
                acc: { [x: string]: string },
                telephone: { type: string; telephone: string },
              ) => {
                acc[
                  this.worksmobileService.convertToShortFieldKey(telephone.type)
                ] = stringUtil.removeDash(telephone.telephone);
                return acc;
              },
              {},
            )
          : {}),
      }),
    );
  }

  /**
   * 네이버 웍스모바일 구성원 목록 조회
   *
   * 로직은 위 함수와 동일하게 동작
   */
  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: WorksmobileDataMethod.GetDirectoryUsers,
    timeZone: 'Asia/Seoul',
  })
  async syncWorksmobileDirectoryUsers(): Promise<void> {
    await this.syncWorksmobileData(
      WorksmobileDataMethod.GetDirectoryUsers,
      { isInternal: 'Y' },
      'users',
      (user) => ({
        name: `${user?.userName?.lastName ?? ''}${user?.userName?.firstName ?? ''} ${user?.organizations?.[0]?.positionName ?? ''}`,
        isInternal: 'Y',
        id: user.userId,
        emails: JSON.stringify([]),
        tcp: stringUtil.removeDash(user?.cellPhone.replace(/^(\+82|0) /, '')),
        createdTime: dayjs().format(),
        modifiedTime: dayjs().format(),
      }),
    );
  }

  /**
   * 네이버 웍스모바일 데이터 동기화
   *
   * @param getDataMethod
   * @param findCriteria
   * @param idKey
   * @param mapToBulkData
   * @private
   */
  private async syncWorksmobileData(
    getDataMethod: WorksmobileDataMethodType,
    findCriteria: Record<string, any>,
    idKey: string,
    mapToBulkData: (item: any) => UserBulkInsertInterface,
  ): Promise<void> {
    console.log(`${getDataMethod} - cron start`);

    const bulkData: UserBulkInsertInterface[] = [];

    const response = await this.worksmobileService[getDataMethod]();
    if (!response[idKey]) {
      return;
    }

    console.log(`${getDataMethod} - ${response[idKey].length} data found`);

    const originalData = await this.userRepository.findBy(findCriteria);
    const originalIds = originalData.map((item) => item.id);

    if (originalIds.length > 0) {
      const deletedIds = originalIds.filter(
        (id) =>
          !response[idKey].some(
            (item: { [x: string]: string }) => item[idKey] === id,
          ),
      );

      if (deletedIds.length > 0) {
        await this.userRepository.delete(deletedIds);
      }
    }

    for (const item of response[idKey]) {
      bulkData.push(mapToBulkData(item));
    }

    if (bulkData.length > 0) {
      await this.userRepository.upsert(plainToInstance(Users, bulkData), [
        'id',
      ]);
    }
  }
}
