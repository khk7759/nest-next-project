import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateQuestionDto {
    @ApiPropertyOptional({ example: 1 })
    @IsInt()
    @IsOptional()
    @Min(1)
    order?: number;

    @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
    @IsString()
    @IsOptional()
    humanImageUrl?: string;

    @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
    @IsString()
    @IsOptional()
    aiImageUrl?: string;

    @ApiPropertyOptional({ example: 'Author Name' })
    @IsString()
    @IsOptional()
    humanAuthor?: string;

    @ApiPropertyOptional({ example: 'https://unsplash.com/...' })
    @IsString()
    @IsOptional()
    humanSourceUrl?: string;

    @ApiPropertyOptional({ example: 'chatGPT' })
    @IsString()
    @IsOptional()
    aiModel?: string;
}
