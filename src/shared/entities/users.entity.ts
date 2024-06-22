import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * 네이버 웍스 Contact API
 *
 * https://developers.worksmobile.com/kr/docs/contact-list
 */
@Entity()
export class Users {
  @Column()
  @PrimaryColumn()
  id!: string;

  @Column()
  isInternal!: string;

  @Column()
  name!: string;

  @Column()
  emails!: string;

  @Column({
    nullable: true,
  })
  tcp?: string;

  @Column({
    nullable: true,
  })
  tw?: string;

  @Column({
    nullable: true,
  })
  twf?: string;

  @Column({
    nullable: true,
  })
  th?: string;

  @Column({
    nullable: true,
  })
  thf?: string;

  @Column({
    nullable: true,
  })
  to?: string;

  @Column({
    nullable: true,
  })
  tc?: string;

  @Column({
    nullable: true,
  })
  organizations!: string;

  // @Column()
  // events!: string;
  //
  // @Column()
  // locations!: string;
  //
  // @Column()
  // messengers!: string;
  //
  // @Column()
  // websites!: string;
  //
  // @Column()
  // memo!: string;
  //
  // @Column()
  // contactTagIds!: string;

  @Column()
  createdTime!: string;

  @Column()
  modifiedTime!: string;
}
