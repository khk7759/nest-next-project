import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty({ example: 1, description: '문제 순서 (1부터)' })
    @IsInt()
    @Min(1)
    order: number;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    @IsString()
    @IsNotEmpty()
    humanImageUrl: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    @IsString()
    @IsNotEmpty()
    aiImageUrl: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    humanAuthor?: string;

    @ApiPropertyOptional({ example: 'https://unsplash.com/...' })
    @IsString()
    @IsOptional()
    humanSourceUrl?: string;

    @ApiPropertyOptional({ example: 'DALL-E 3' })
    @IsString()
    @IsOptional()
    aiModel?: string;
}
