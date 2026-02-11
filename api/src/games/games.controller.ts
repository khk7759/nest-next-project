import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Post(':slug/sessions')
    @ApiOperation({ summary: '게임 세션 생성' })
    createSession(@Param('slug') slug: string, @Body() dto: CreateSessionDto) {
        return this.gamesService.createSession(slug, dto);
    }

    @Post(':sessionId/answers')
    @ApiOperation({ summary: '답변 제출' })
    submitAnswers(
        @Param('sessionId') sessionId: string,
        @Body() dto: SubmitAnswersDto,
    ) {
        return this.gamesService.submitAnswers(sessionId, dto);
    }

    @Get(':sessionId/result')
    @ApiOperation({ summary: '게임 결과 조회' })
    getResult(@Param('sessionId') sessionId: string) {
        return this.gamesService.getResult(sessionId);
    }
}
