import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Controller()
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Post('challenges/:slug/sessions')
    createSession(@Param('slug') slug: string, @Body() dto: CreateSessionDto) {
        return this.gamesService.createSession(slug, dto);
    }

    @Post('sessions/:sessionId/answers')
    submitAnswers(
        @Param('sessionId') sessionId: string,
        @Body() dto: SubmitAnswersDto,
    ) {
        return this.gamesService.submitAnswers(sessionId, dto);
    }

    @Get('sessions/:sessionId/result')
    getResult(@Param('sessionId') sessionId: string) {
        return this.gamesService.getResult(sessionId);
    }
}
