import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChallengesModule } from './challenges/challenges.module';

@Module({
    imports: [PrismaModule, ChallengesModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
