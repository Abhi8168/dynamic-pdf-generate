import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PdfLogModule } from './pdf-log/pdf-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pdf_UPLOAD',
      {
        dbName: process.env.MONGO_DBNAME,
        auth: {
          username: process.env.MONGO_USER,
          password: process.env.MONGO_PASS,
        },
      },
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '',
    }),
    AuthModule,
    UserModule,
    PdfLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
