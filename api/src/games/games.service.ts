import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { CheckAnswerDto } from './dto/check-answer.dto';
import {
    AnswerResultDto,
    GameResultResponseDto,
} from './dto/game-result-response.dto';

/** shouldSwap과 동일한 로직 — challenges.service.ts와 일치해야 함 */
function shouldSwap(questionId: string): boolean {
    let hash = 0;
    for (let i = 0; i < questionId.length; i++) {
        hash = (hash * 31 + questionId.charCodeAt(i)) | 0;
    }
    return (hash & 1) === 1;
}

@Injectable()
export class GamesService {
    constructor(private readonly prisma: PrismaService) {}

    async createSession(slug: string, dto: CreateSessionDto) {
        const challenge = await this.prisma.challenge.findUnique({
            where: { slug },
        });

        if (!challenge) {
            throw new NotFoundException(
                `Challenge with slug "${slug}" not found`,
            );
        }

        const session = await this.prisma.gameSession.create({
            data: {
                challengeId: challenge.id,
                nickname: dto.nickname ?? null,
            },
        });

        return { sessionId: session.id };
    }

    async checkAnswer(dto: CheckAnswerDto) {
        const question = await this.prisma.question.findUnique({
            where: { id: dto.questionId },
        });

        if (!question) {
            throw new NotFoundException(
                `Question "${dto.questionId}" not found`,
            );
        }

        const swap = shouldSwap(question.id);
        // swap이면 A=ai,B=human / 아니면 A=human,B=ai → human을 골라야 정답
        const isCorrect = swap
            ? dto.selected === 'B'
            : dto.selected === 'A';

        return {
            questionId: dto.questionId,
            selected: dto.selected,
            isCorrect,
            aiImageUrl: question.aiImageUrl,
            humanImageUrl: question.humanImageUrl,
        };
    }

    async submitAnswers(sessionId: string, dto: SubmitAnswersDto) {
        const session = await this.prisma.gameSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException(`Session "${sessionId}" not found`);
        }

        if (session.completedAt) {
            throw new BadRequestException('Session already completed');
        }

        // 답변에 해당하는 문제들 조회
        const questionIds = dto.answers.map((a) => a.questionId);
        const questions = await this.prisma.question.findMany({
            where: {
                id: { in: questionIds },
                challengeId: session.challengeId,
            },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException(
                'Some question IDs are invalid for this challenge',
            );
        }

        const questionMap = new Map(questions.map((q) => [q.id, q]));

        // 채점: A/B → Human 이미지를 골랐는지 판정
        const answersData = dto.answers.map((a) => {
            const question = questionMap.get(a.questionId)!;
            const swap = shouldSwap(question.id);

            // swap이면: A=ai, B=human / swap이 아니면: A=human, B=ai
            // 유저가 Human을 골라야 정답
            const selectedIsHuman = swap ? a.selected === 'B' : a.selected === 'A';

            return {
                sessionId,
                questionId: a.questionId,
                selected: a.selected,
                isCorrect: selectedIsHuman,
            };
        });

        const score = answersData.filter((a) => a.isCorrect).length;

        // 트랜잭션: GameAnswer 생성 + GameSession 업데이트
        await this.prisma.$transaction([
            this.prisma.gameAnswer.createMany({ data: answersData }),
            this.prisma.gameSession.update({
                where: { id: sessionId },
                data: {
                    score,
                    completedAt: new Date(),
                    timeTakenMs: dto.timeTakenMs ?? null,
                },
            }),
        ]);

        return { sessionId, score, total: answersData.length };
    }

    async getResult(sessionId: string): Promise<GameResultResponseDto> {
        const session = await this.prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: {
                answers: {
                    include: { question: true },
                    orderBy: { question: { order: 'asc' } },
                },
            },
        });

        if (!session) {
            throw new NotFoundException(`Session "${sessionId}" not found`);
        }

        if (!session.completedAt) {
            throw new BadRequestException('Session not yet completed');
        }

        const answers: AnswerResultDto[] = session.answers.map((a) => ({
            questionId: a.questionId,
            selected: a.selected,
            isCorrect: a.isCorrect,
            humanImageUrl: a.question.humanImageUrl,
            aiImageUrl: a.question.aiImageUrl,
        }));

        return {
            sessionId: session.id,
            score: session.score,
            totalQuestions: session.answers.length,
            timeTakenMs: session.timeTakenMs,
            completedAt: session.completedAt,
            answers,
        };
    }
}
