export class AdminToken {
  // token字段
  token: string;
  // 失效时长(秒)
  expires = 3600;
  // 上次续期时间
  lastRenewalTime = Date.now() / 1000;
  // 下次失效时间
  expiredTime = this.lastRenewalTime + this.expires;
}
