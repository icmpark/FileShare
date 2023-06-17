import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import dbConfig from './config/dbConfig.js';
import { DBConfigModule, DBConfigService} from './config/dbConfigModule.js';
import { UserModule } from './user/user.module.js';
import authConfig from './config/authConfig.js';
import { SignModule } from './sign/sign.module.js';
import { FileModule } from './file/file.module.js';
import fileConfig from './config/fileConfig.js';
import { RouterModule } from '@nestjs/core';

const controllerModules = [
  UserModule,
  SignModule,
  FileModule,
];

@Module({
  imports: [
    ...controllerModules,
    RouterModule.register(
      controllerModules.map(
        (module) => ({
          path: '/v',
          module: module
        })
      )
    ),
    ConfigModule.forRoot({
      // envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      load: [dbConfig, authConfig, fileConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [DBConfigModule],
      inject: [DBConfigService],
      useFactory: async (conf: DBConfigService) => ({
        uri: conf.makeMongoDBUri(),
      }),
    }),
    CacheModule.registerAsync({
      imports: [DBConfigModule],
      inject: [DBConfigService],
      useFactory: async (conf: DBConfigService) => conf.makeRedisConf(),
      isGlobal: true
    }),
  ]
})
export class BackendModule {}
