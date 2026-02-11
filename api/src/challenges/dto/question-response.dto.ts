import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponseDto {
    @ApiProperty({ example: 'uuid-1234' })
    id: string;

    @ApiProperty({ example: 1 })
    order: number;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    imageA: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    imageB: string;
}
