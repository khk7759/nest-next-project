import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChallengesModule } from './challenges/challenges.module';
import { GamesModule } from './games/games.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [PrismaModule, ChallengesModule, GamesModule, AdminModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
