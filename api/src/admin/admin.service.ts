import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    // ── Auth ──
    login(dto: LoginDto) {
if (
            dto.username !== process.env.ADMIN_USERNAME ||
            dto.password !== process.env.ADMIN_PASSWORD
        ) {
            throw new UnauthorizedException(
                '아이디 또는 비밀번호가 올바르지 않습니다.',
            );
        }

        const payload = { sub: 'admin', username: dto.username };
        // jwtService.sign()이 JwtModule.register()에서 설정한 secret과 expiresIn을 자동으로 사용
        return { accessToken: this.jwtService.sign(payload) };
    }

    // ── Challenges ──

    async findAllChallenges() {
        return this.prisma.challenge.findMany({
            include: { _count: { select: { questions: true } } },
            orderBy: { order: 'asc' },
        });
    }

    async findChallengeById(id: string) {
        const challenge = await this.prisma.challenge.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: 'asc' } },
            },
        });
        if (!challenge) {
            throw new NotFoundException(`챌린지(${id})를 찾을 수 없습니다.`);
        }
        return challenge;
    }

    async createChallenge(dto: CreateChallengeDto) {
        const last = await this.prisma.challenge.findFirst({
            orderBy: { slug: 'desc' },
            select: { slug: true },
        });
        const nextNum = last ? parseInt(last.slug.slice(2)) + 1 : 1;
        const slug = `ch${String(nextNum).padStart(5, '0')}`;
        return this.prisma.challenge.create({ data: { ...dto, slug } });
    }

    async updateChallenge(id: string, dto: UpdateChallengeDto) {
        await this.findChallengeById(id);
        return this.prisma.challenge.update({
            where: { id },
            data: dto,
        });
    }

    async deleteChallenge(id: string) {
        await this.findChallengeById(id);
        return this.prisma.challenge.delete({ where: { id } });
    }

    // ── Questions ──

    async createQuestion(challengeId: string, dto: CreateQuestionDto) {
        await this.findChallengeById(challengeId);
        return this.prisma.question.create({
            data: { ...dto, challengeId },
        });
    }

    async updateQuestion(id: string, dto: UpdateQuestionDto) {
        const question = await this.prisma.question.findUnique({
            where: { id },
        });
        if (!question) {
            throw new NotFoundException(`문제(${id})를 찾을 수 없습니다.`);
        }
        return this.prisma.question.update({
            where: { id },
            data: dto,
        });
    }

    async deleteQuestion(id: string) {
        const question = await this.prisma.question.findUnique({
            where: { id },
        });
        if (!question) {
            throw new NotFoundException(`문제(${id})를 찾을 수 없습니다.`);
        }
        return this.prisma.question.delete({ where: { id } });
    }
}
