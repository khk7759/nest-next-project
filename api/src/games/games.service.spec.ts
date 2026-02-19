import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma/prisma.service';

// shouldSwap 로직 복제 — 서비스 내부 함수와 동일해야 함
function shouldSwap(questionId: string): boolean {
    let hash = 0;
    for (let i = 0; i < questionId.length; i++) {
        hash = (hash * 31 + questionId.charCodeAt(i)) | 0;
    }
    return (hash & 1) === 1;
}

describe('GamesService', () => {
    let service: GamesService;
    let prisma: {
        challenge: { findUnique: jest.Mock };
        question: { findUnique: jest.Mock; findMany: jest.Mock };
        gameSession: {
            create: jest.Mock;
            findUnique: jest.Mock;
            update: jest.Mock;
        };
        gameAnswer: { createMany: jest.Mock };
        $transaction: jest.Mock;
    };

    beforeEach(async () => {
        prisma = {
            challenge: { findUnique: jest.fn() },
            question: { findUnique: jest.fn(), findMany: jest.fn() },
            gameSession: {
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            gameAnswer: { createMany: jest.fn() },
            $transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamesService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<GamesService>(GamesService);
    });

    // createSession

    describe('createSession', () => {
        it('세션 생성', async () => {
            prisma.challenge.findUnique.mockResolvedValue({
                id: 'c-1',
                slug: 'ch00001',
            });
            prisma.gameSession.create.mockResolvedValue({
                id: 's-1',
                challengeId: 'c-1',
                nickname: '홍길동',
            });

            const result = await service.createSession('ch00001', {
                nickname: '홍길동',
            });

            expect(result).toEqual({ sessionId: 's-1' });
            expect(prisma.gameSession.create).toHaveBeenCalledWith({
                data: {
                    challengeId: 'c-1',
                    nickname: '홍길동',
                },
            });
        });

        it('존재하지 않는 slug이면 NotFoundException을 던진다', async () => {
            prisma.challenge.findUnique.mockResolvedValue(null);

            await expect(
                service.createSession('unknown', { nickname: 'test' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    // checkAnswer

    describe('checkAnswer', () => {
        const questionId = 'q-1';
        const swap = shouldSwap(questionId);

        it('정답 판별', async () => {
            prisma.question.findUnique.mockResolvedValue({
                id: questionId,
                aiImageUrl: 'ai.jpg',
                humanImageUrl: 'human.jpg',
            });

            // swap이면 B가 정답, 아니면 A가 정답
            const correctChoice = swap ? 'B' : 'A';
            const result = await service.checkAnswer({
                questionId,
                selected: correctChoice,
            });

            expect(result.isCorrect).toBe(true);
        });

        it('오답 판별', async () => {
            prisma.question.findUnique.mockResolvedValue({
                id: questionId,
                aiImageUrl: 'ai.jpg',
                humanImageUrl: 'human.jpg',
            });

            const wrongChoice = swap ? 'A' : 'B';
            const result = await service.checkAnswer({
                questionId,
                selected: wrongChoice,
            });

            expect(result.isCorrect).toBe(false);
        });

        it('존재하지 않는 문제이면 NotFoundException을 던진다', async () => {
            prisma.question.findUnique.mockResolvedValue(null);

            await expect(
                service.checkAnswer({ questionId: 'unknown', selected: 'A' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    // submitAnswers

    describe('submitAnswers', () => {
        const sessionId = 'session-1';
        const questionId = 'q-1';

        it('답변을 제출하고 채점 결과를 반환한다', async () => {
            prisma.gameSession.findUnique.mockResolvedValue({
                id: sessionId,
                challengeId: 'challenge-1',
                completedAt: null,
            });

            prisma.question.findMany.mockResolvedValue([
                { id: questionId, challengeId: 'challenge-1' },
            ]);

            prisma.$transaction.mockResolvedValue(undefined);

            const swap = shouldSwap(questionId);
            const correctChoice = swap ? 'B' : 'A';

            const result = await service.submitAnswers(sessionId, {
                answers: [{ questionId, selected: correctChoice }],
                timeTakenMs: 5000,
            });

            expect(result).toEqual({
                sessionId,
                score: 1,
                total: 1,
            });
            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('이미 완료된 세션이면 BadRequestException을 던진다', async () => {
            prisma.gameSession.findUnique.mockResolvedValue({
                id: sessionId,
                challengeId: 'challenge-1',
                completedAt: new Date(),
            });

            await expect(
                service.submitAnswers(sessionId, {
                    answers: [{ questionId, selected: 'A' }],
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('잘못된 questionId가 포함되면 BadRequestException을 던진다', async () => {
            prisma.gameSession.findUnique.mockResolvedValue({
                id: sessionId,
                challengeId: 'challenge-1',
                completedAt: null,
            });

            // 요청은 2개인데 DB에서 1개만 찾음
            prisma.question.findMany.mockResolvedValue([
                { id: questionId, challengeId: 'challenge-1' },
            ]);

            await expect(
                service.submitAnswers(sessionId, {
                    answers: [
                        { questionId, selected: 'A' },
                        { questionId: 'invalid-id', selected: 'B' },
                    ],
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('존재하지 않는 세션이면 NotFoundException을 던진다', async () => {
            prisma.gameSession.findUnique.mockResolvedValue(null);

            await expect(
                service.submitAnswers('unknown', {
                    answers: [{ questionId, selected: 'A' }],
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    // getResult

    describe('getResult', () => {
        it('완료된 세션의 결과를 반환한다', async () => {
            const completedAt = new Date();
            prisma.gameSession.findUnique.mockResolvedValue({
                id: 'session-1',
                score: 1,
                timeTakenMs: 5000,
                completedAt,
                answers: [
                    {
                        questionId: 'q-1',
                        selected: 'A',
                        isCorrect: true,
                        question: {
                            humanImageUrl: 'human.jpg',
                            aiImageUrl: 'ai.jpg',
                        },
                    },
                ],
            });

            const result = await service.getResult('session-1');

            expect(result).toEqual({
                sessionId: 'session-1',
                score: 1,
                totalQuestions: 1,
                timeTakenMs: 5000,
                completedAt,
                answers: [
                    {
                        questionId: 'q-1',
                        selected: 'A',
                        isCorrect: true,
                        humanImageUrl: 'human.jpg',
                        aiImageUrl: 'ai.jpg',
                    },
                ],
            });
        });

        it('미완료 세션이면 BadRequestException을 던진다', async () => {
            prisma.gameSession.findUnique.mockResolvedValue({
                id: 'session-1',
                completedAt: null,
                answers: [],
            });

            await expect(service.getResult('session-1')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('존재하지 않는 세션이면 NotFoundException을 던진다', async () => {
            prisma.gameSession.findUnique.mockResolvedValue(null);

            await expect(service.getResult('unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
