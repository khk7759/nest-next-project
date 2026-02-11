import { Controller, Get, Param } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    @Get()
    @ApiOperation({ summary: '챌린지 목록 조회' })
    findAll() {
        return this.challengesService.findAll();
    }

    @Get(':slug')
    @ApiOperation({ summary: '챌린지 상세 조회' })
    findBySlug(@Param('slug') slug: string) {
        return this.challengesService.findBySlug(slug);
    }
}
