import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CloudinaryService } from './cloudinary.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule, // Passport 인증 프레임워크
        JwtModule.register({
            secret: process.env.JWT_SECRET, // .env에서 비밀키 읽음
            signOptions: { expiresIn: '1h' }, // 토큰 유효기간 1시간
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService, CloudinaryService, JwtStrategy],
})
export class AdminModule {}
