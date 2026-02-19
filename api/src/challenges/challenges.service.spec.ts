import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { PrismaService } from '../prisma/prisma.service';

// shouldSwap 로직 복제
function shouldSwap(questionId: string): boolean {
    let hash = 0;
    for (let i = 0; i < questionId.length; i++) {
        hash = (hash * 31 + questionId.charCodeAt(i)) | 0;
    }
    return (hash & 1) === 1;
}

describe('ChallengesService', () => {
    let service: ChallengesService;
    let prisma: {
        challenge: { findMany: jest.Mock; findUnique: jest.Mock };
    };

    beforeEach(async () => {
        prisma = {
            challenge: { findMany: jest.fn(), findUnique: jest.fn() },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChallengesService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<ChallengesService>(ChallengesService);
    });

    // findAll
    describe('findAll', () => {
        it('챌린지 목록을 반환', async () => {
            const createdAt = new Date();
            prisma.challenge.findMany.mockResolvedValue([
                {
                    id: 'c-1',
                    slug: 'ch00001',
                    title: '챌린지',
                    description: '설명',
                    createdAt,
                    _count: { questions: 5 },
                },
            ]);

            const result = await service.findAll();

            expect(result).toEqual([
                {
                    id: 'c-1',
                    slug: 'ch00001',
                    title: '챌린지',
                    description: '설명',
                    questionCount: 5,
                    createdAt,
                },
            ]);
            expect(prisma.challenge.findMany).toHaveBeenCalledWith({
                where: { isActive: true, questions: { some: {} } },
                include: { _count: { select: { questions: true } } },
                orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            });
        });

        it('챌린지가 없으면 빈 배열을 반환', async () => {
            prisma.challenge.findMany.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    // findBySlug
    describe('findBySlug', () => {
        it('챌린지 상세를 셔플 적용하여 반환', async () => {
            const questionId = 'q-1';
            const swap = shouldSwap(questionId);
            const createdAt = new Date();

            prisma.challenge.findUnique.mockResolvedValue({
                id: 'c-1',
                slug: 'ch00001',
                title: '챌린지',
                description: '설명',
                createdAt,
                questions: [
                    {
                        id: questionId,
                        order: 1,
                        humanImageUrl: 'human.jpg',
                        aiImageUrl: 'ai.jpg',
                    },
                ],
            });

            const result = await service.findBySlug('ch00001');

            expect(result.questions[0]).toEqual({
                id: questionId,
                order: 1,
                imageA: swap ? 'ai.jpg' : 'human.jpg',
                imageB: swap ? 'human.jpg' : 'ai.jpg',
            });
            expect(result.slug).toBe('ch00001');
        });

        it('존재하지 않는 slug이면 NotFoundException을 던진다', async () => {
            prisma.challenge.findUnique.mockResolvedValue(null);

            await expect(service.findBySlug('unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
