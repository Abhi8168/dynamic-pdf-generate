import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { CustomerModule } from 'src/customer/customer.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from 'src/user/user.module';
require('dotenv').config();
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: {},
    }),
    UserModule,
  ],
  providers: [
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [],
  exports: [],
})
export class AuthModule {}
