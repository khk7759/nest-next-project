import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { ChallengeDetailResponseDto } from './dto/challenge-detail-response.dto';
import { QuestionResponseDto } from './dto/question-response.dto';

/**
 * 결정론적 셔플: question ID의 간단한 해시로 A/B 배치 결정.
 * 같은 문제는 항상 같은 배치를 반환.
 */
function shouldSwap(questionId: string): boolean {
    let hash = 0;
    for (let i = 0; i < questionId.length; i++) {
        hash = (hash * 31 + questionId.charCodeAt(i)) | 0;
    }
    return (hash & 1) === 1;
}

@Injectable()
export class ChallengesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<ChallengeResponseDto[]> {
        const challenges = await this.prisma.challenge.findMany({
            where: { isActive: true },
            include: { _count: { select: { questions: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return challenges.map((c) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            description: c.description,
            questionCount: c._count.questions,
            createdAt: c.createdAt,
        }));
    }

    async findBySlug(slug: string): Promise<ChallengeDetailResponseDto> {
        const challenge = await this.prisma.challenge.findUnique({
            where: { slug },
            include: {
                questions: { orderBy: { order: 'asc' } },
            },
        });

        if (!challenge) {
            throw new NotFoundException(
                `Challenge with slug "${slug}" not found`,
            );
        }

        const questions: QuestionResponseDto[] = challenge.questions.map(
            (q) => {
                const swap = shouldSwap(q.id);
                return {
                    id: q.id,
                    order: q.order,
                    imageA: swap ? q.aiImageUrl : q.humanImageUrl,
                    imageB: swap ? q.humanImageUrl : q.aiImageUrl,
                };
            },
        );

        return {
            id: challenge.id,
            slug: challenge.slug,
            title: challenge.title,
            description: challenge.description,
            questions,
            createdAt: challenge.createdAt,
        };
    }
}
