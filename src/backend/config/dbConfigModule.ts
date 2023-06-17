import { Injectable, Module } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import dbConfig from "./dbConfig.js";
import { ConfigType } from "@nestjs/config";
import redisStore from 'cache-manager-ioredis';

@Injectable()
export class DBConfigService {
  constructor(@Inject(dbConfig.KEY) public config: ConfigType<typeof dbConfig>) {}

  makeMongoDBUri(): string {
    const conf = this.config.mongodb;
    return `mongodb://${conf.auth.user}:${conf.auth.pass}@${conf.addr}:${conf.port}/${conf.name}`
  }

  makeRedisConf(): {[key: string]: any} {
      return {
        store: redisStore,
        host: this.config.redis.addr,
        port: this.config.redis.port,
        ttl: this.config.redis.TTL,
        // auth_pass: this.config.redis.auth,
      }
  }
}

@Module({
    providers: [DBConfigService],
    exports: [DBConfigService]
})
export class DBConfigModule {}