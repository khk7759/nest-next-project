import { Controller, Get, Param } from '@nestjs/common';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    // 챌린지 목록 조회
    @Get()
    findAll() {
        return this.challengesService.findAll();
    }

    // 챌린지 상세
    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.challengesService.findBySlug(slug);
    }
}
