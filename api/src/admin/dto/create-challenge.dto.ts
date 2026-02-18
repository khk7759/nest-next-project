import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChallengeDto {
    @ApiProperty({ example: 'AI 이미지 감별 #1' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ example: '첫 번째 AI 이미지 감별 퀴즈입니다.' })
    @IsString()
    @IsOptional()
    description?: string;
}
