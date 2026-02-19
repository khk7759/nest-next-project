import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
    let service: AdminService;
    let jwtService: { sign: jest.Mock };
    let prisma: {
        challenge: {
            findMany: jest.Mock;
            findUnique: jest.Mock;
            findFirst: jest.Mock;
            create: jest.Mock;
            update: jest.Mock;
            delete: jest.Mock;
        };
        question: {
            findUnique: jest.Mock;
            create: jest.Mock;
            update: jest.Mock;
            delete: jest.Mock;
        };
    };

    beforeEach(async () => {
        // 환경변수 설정
        process.env.ADMIN_USERNAME = 'admin';
        process.env.ADMIN_PASSWORD = 'test1234';

        jwtService = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

        prisma = {
            challenge: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            question: {
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                { provide: JwtService, useValue: jwtService },
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
    });

    // Auth
    describe('login', () => {
        it('올바른 자격 증명으로 JWT 토큰을 반환한다', () => {
            const result = service.login({
                username: 'admin',
                password: 'test1234',
            });

            expect(result).toEqual({ accessToken: 'mock-jwt-token' });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 'admin',
                username: 'admin',
            });
        });

        it('잘못된 비밀번호로 UnauthorizedException을 던진다', () => {
            expect(() =>
                service.login({ username: 'admin', password: 'wrong' }),
            ).toThrow(UnauthorizedException);
        });

        it('잘못된 사용자명으로 UnauthorizedException을 던진다', () => {
            expect(() =>
                service.login({ username: 'wrong', password: 'test1234' }),
            ).toThrow(UnauthorizedException);
        });
    });

    // Challenges
    describe('findAllChallenges', () => {
        it('비활성 포함 모든 챌린지를 반환한다', async () => {
            const challenges = [
                { id: 'c-1', slug: 'ch00001', title: 'Test', isActive: true },
                { id: 'c-2', slug: 'ch00002', title: 'Test2', isActive: false },
            ];
            prisma.challenge.findMany.mockResolvedValue(challenges);

            const result = await service.findAllChallenges();

            expect(result).toEqual(challenges);
            expect(prisma.challenge.findMany).toHaveBeenCalledWith({
                include: { _count: { select: { questions: true } } },
                orderBy: { order: 'asc' },
            });
        });
    });

    describe('findChallengeById', () => {
        it('챌린지 상세를 원본 데이터로 반환한다', async () => {
            const challenge = {
                id: 'c-1',
                slug: 'ch00001',
                title: 'Test',
                questions: [],
            };
            prisma.challenge.findUnique.mockResolvedValue(challenge);

            const result = await service.findChallengeById('c-1');

            expect(result).toEqual(challenge);
        });

        it('존재하지 않는 ID로 NotFoundException을 던진다', async () => {
            prisma.challenge.findUnique.mockResolvedValue(null);

            await expect(service.findChallengeById('unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('createChallenge', () => {
        it('slug를 자동 생성하여 챌린지를 생성한다', async () => {
            const dto = { title: 'New Challenge' };
            prisma.challenge.findFirst.mockResolvedValue({ slug: 'ch00002' });
            const created = {
                id: 'c-3',
                slug: 'ch00003',
                ...dto,
                isActive: true,
            };
            prisma.challenge.create.mockResolvedValue(created);

            const result = await service.createChallenge(dto as any);

            expect(result).toEqual(created);
            expect(prisma.challenge.create).toHaveBeenCalledWith({
                data: { ...dto, slug: 'ch00003' },
            });
        });

        it('챌린지가 없을 때 ch00001로 생성한다', async () => {
            const dto = { title: 'First Challenge' };
            prisma.challenge.findFirst.mockResolvedValue(null);
            const created = {
                id: 'c-1',
                slug: 'ch00001',
                ...dto,
                isActive: true,
            };
            prisma.challenge.create.mockResolvedValue(created);

            const result = await service.createChallenge(dto as any);

            expect(result).toEqual(created);
            expect(prisma.challenge.create).toHaveBeenCalledWith({
                data: { ...dto, slug: 'ch00001' },
            });
        });
    });

    describe('updateChallenge', () => {
        it('챌린지를 수정한다', async () => {
            prisma.challenge.findUnique.mockResolvedValue({
                id: 'c-1',
                questions: [],
            });
            const updated = { id: 'c-1', title: 'Updated' };
            prisma.challenge.update.mockResolvedValue(updated);

            const result = await service.updateChallenge('c-1', {
                title: 'Updated',
            });

            expect(result).toEqual(updated);
        });

        it('존재하지 않는 챌린지 수정 시 NotFoundException', async () => {
            prisma.challenge.findUnique.mockResolvedValue(null);

            await expect(
                service.updateChallenge('unknown', { title: 'x' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteChallenge', () => {
        it('챌린지를 삭제한다', async () => {
            prisma.challenge.findUnique.mockResolvedValue({
                id: 'c-1',
                questions: [],
            });
            prisma.challenge.delete.mockResolvedValue({ id: 'c-1' });

            const result = await service.deleteChallenge('c-1');

            expect(result).toEqual({ id: 'c-1' });
        });
    });

    // Questions
    describe('createQuestion', () => {
        it('문제를 추가한다', async () => {
            prisma.challenge.findUnique.mockResolvedValue({
                id: 'c-1',
                questions: [],
            });
            const dto = {
                order: 1,
                humanImageUrl: 'human.jpg',
                aiImageUrl: 'ai.jpg',
            };
            const created = { id: 'q-1', ...dto, challengeId: 'c-1' };
            prisma.question.create.mockResolvedValue(created);

            const result = await service.createQuestion('c-1', dto);

            expect(result).toEqual(created);
            expect(prisma.question.create).toHaveBeenCalledWith({
                data: { ...dto, challengeId: 'c-1' },
            });
        });
    });

    describe('updateQuestion', () => {
        it('문제를 수정한다', async () => {
            prisma.question.findUnique.mockResolvedValue({ id: 'q-1' });
            const updated = { id: 'q-1', order: 2 };
            prisma.question.update.mockResolvedValue(updated);

            const result = await service.updateQuestion('q-1', { order: 2 });

            expect(result).toEqual(updated);
        });

        it('존재하지 않는 문제 수정 시 NotFoundException', async () => {
            prisma.question.findUnique.mockResolvedValue(null);

            await expect(
                service.updateQuestion('unknown', { order: 1 }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteQuestion', () => {
        it('문제를 삭제한다', async () => {
            prisma.question.findUnique.mockResolvedValue({ id: 'q-1' });
            prisma.question.delete.mockResolvedValue({ id: 'q-1' });

            const result = await service.deleteQuestion('q-1');

            expect(result).toEqual({ id: 'q-1' });
        });

        it('존재하지 않는 문제 삭제 시 NotFoundException', async () => {
            prisma.question.findUnique.mockResolvedValue(null);

            await expect(service.deleteQuestion('unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
