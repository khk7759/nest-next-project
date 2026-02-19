import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    // --- Auth ---

    @Post('login')
    @ApiOperation({ summary: '어드민 로그인' })
    login(@Body() dto: LoginDto) {
        return this.adminService.login(dto);
    }

    //--- Challenges ---

    @Get('challenges')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '모든 챌린지 조회' })
    findAllChallenges() {
        return this.adminService.findAllChallenges();
    }

    @Get('challenges/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '챌린지 상세 조회' })
    findChallengeById(@Param('id') id: string) {
        return this.adminService.findChallengeById(id);
    }

    @Post('challenges')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '챌린지 생성' })
    createChallenge(@Body() dto: CreateChallengeDto) {
        return this.adminService.createChallenge(dto);
    }

    @Patch('challenges/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '챌린지 수정' })
    updateChallenge(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
        return this.adminService.updateChallenge(id, dto);
    }

    @Delete('challenges/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '챌린지 삭제' })
    deleteChallenge(@Param('id') id: string) {
        return this.adminService.deleteChallenge(id);
    }

    // ── Questions ──

    @Post('challenges/:id/questions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '문제 추가' })
    createQuestion(
        @Param('id') challengeId: string,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.adminService.createQuestion(challengeId, dto);
    }

    @Patch('questions/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '문제 수정' })
    updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
        return this.adminService.updateQuestion(id, dto);
    }

    @Delete('questions/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '문제 삭제' })
    deleteQuestion(@Param('id') id: string) {
        return this.adminService.deleteQuestion(id);
    }

    // ── Upload ──

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @ApiOperation({ summary: '이미지 업로드 → Cloudinary URL 반환' })
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('파일이 없습니다.');
        }
        const result = await this.cloudinaryService.uploadImage(file);
        const url = result.secure_url.replace(
            '/upload/',
            '/upload/f_auto,q_auto,w_800/',
        );
        return { url };
    }
}
