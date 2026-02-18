import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateChallengeDto {
    @ApiPropertyOptional({ example: 'AI 이미지 감별 #1' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: '설명 변경' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
