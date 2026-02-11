import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
    @ApiPropertyOptional({ example: '홍길동', maxLength: 20 })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    nickname?: string;
}
