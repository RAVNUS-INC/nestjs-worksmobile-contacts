# 네이버 웍스 주소록 mysql 저장

## 사용 방법
네이버 웍스 개발자 콘솔 접속
> https://dev.worksmobile.com/kr/console

앱 추가 클릭 (이름은 자유롭게)

![1](https://github.com/RAVNUS-INC/nestjs-worksmobile-contacts/assets/43020330/f6478eb0-60b6-40ff-8e09-41f4578b31df)

OAuth Scopes는 아래 두개 체크
- contact.read
- directory.read

![2](https://github.com/RAVNUS-INC/nestjs-worksmobile-contacts/assets/43020330/d0d70ff5-3ee7-4a53-988d-6e4203bc9275)

아래와 같이 설정했다면 Domain ID, Tenant ID, Client ID, Client Secret, Service Account, Private Key 등 중요 정보 메모 후 .env에 저장

![3](https://github.com/RAVNUS-INC/nestjs-worksmobile-contacts/assets/43020330/755b1cc6-c836-49e2-9a59-4306f256cc98)


```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=ravnus
DB_PASSWORD=ravnus
DB_DATABASE=ravnus

REDIS_HOST=localhost
REDIS_PORT=6379

NAVER_WORKS_CLIENT_ID=
NAVER_WORKS_SECRET_ID=
NAVER_WORKS_SERVICE_ID=
NAVER_WORKS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
~~~~~~~~~~~~~
-----END PRIVATE KEY-----
"
```

아래에서부터는 시놀로지 Container Manager를 활용한 사용방법임.

시놀로지 제어판 접속 후 Container Manager 실행
(Container Manager가 없다면 패키지 센터에서 설치)

프로젝트 > 생성
경로에서 아까 설정한 .env까지 포함된 폴더 선택 후
기존 docker-compose.yaml 사용하기 선택

<img width="1198" alt="2" src="https://github.com/RAVNUS-INC/nestjs-worksmobile-contacts/assets/43020330/3f4d1df0-331e-47e2-8e14-3b55500e75d9">

웹포털 설정은 사용안함 후 자동 시작

## 사용 기술
- NestJS
- MySQL
- Redis

## 구조 설명
- `src`: 소스코드
  - `cron`: 스케줄러
  - `shared`: 공통 모듈
    - `database`: DB
    - `entities`: 엔티티
    - `worksmobile`: 웍스모바일 API
    - ...

## 실행 방법

1. Docker (공통)
```bash
docker-compose up -d
```


---


## DB 스키마

```mysql
CREATE TABLE users
(
  id            varchar(255) primary key                  not null comment '구성원의 경우 worksmobile 의 domainId, 외부 연락처의 경우 contactId 를 사용',
  is_internal   enum ('Y', 'N') default 'Y'               not null comment '내부/외부 구분 (내부 구성원의 경우 Y)',
  name          varchar(255)                              not null,
  emails        text                                      null,
  `tcp`         varchar(20)                               null comment 'telephoneCellphone',
  `tw`          varchar(20)                               null comment 'telephoneWork',
  `twf`         varchar(20)                               null comment 'telephoneWorkFax',
  `th`          varchar(20)                               null comment 'telephoneHome',
  `thf`         varchar(20)                               null comment 'telephoneHomeFax',
  `to`          varchar(20)                               null comment 'telephoneOther',
  `tc`          varchar(20)                               null comment 'telephoneCustom',
  organizations text                                      null,
  createdTime   datetime                                  not null,
  modifiedTime  datetime                                  not null,
  createdAt     datetime        default current_timestamp not null,
  key (tcp,
       `th`,
       `thf`,
       `tc`,
       `to`,
       `tw`,
       `twf`),
  unique key (id)
) ENGINE = InnoDB
```

## 전화 서버 쿼리
```mysql
select
    name
from users
where `tcp` = '[CIDNUM]'
   or `th` = '[CIDNUM]'
   or `thf` = '[CIDNUM]'
   or `tc` = '[CIDNUM]'
   or `to` = '[CIDNUM]'
   or `tw` = '[CIDNUM]'
   or `twf` = '[CIDNUM]';
```

---

```
ALTER USER 'ravnus'@'%' IDENTIFIED WITH mysql_native_password BY 'ravnus';
```

## 자주 쓰는 명령어

### 컨테이너 up/down
```bash
# 컨테이너 실행
$ docker-compose up -d
  
# 컨테이너 종료
$ docker-compose down
```

### MySQL 접속
```bash
# mysql 칸테이너 접속
$ docker exec -it mysql /bin/bash

# 접속 후 mysql 접속
$ mysql -u root -p

# 스키마 접속
$ use ravnus;

# 데이터 확인
$ select * from contacts;
```


### Redis 접속
```bash
$ docker exec -it redis redis-cli

# db 0번 선택
$ select 0


# -----------------------------

# 인증 토큰 정보 조회
$ get auth:worksmobile

# 인증 토큰 정보 삭제 (만약 인증이 가끔 안된다 하면 캐시 삭제)
$ del auth:worksmobile

# -----------------------------

# 마지막으로 돌았던 시간 확인
$ get worksmobile:contact:list:sync-time

# 만약 db 데이터를 삭제했다 하면 마지막으로 돌았던 시간을 삭제해야함
$ del worksmobile:contact:list:sync-time
```
