import { ApiProperty } from '@nestjs/swagger';

export class ChallengeResponseDto {
    @ApiProperty({ example: 'uuid-1234' })
    id: string;

    @ApiProperty({ example: 'ch00001' })
    slug: string;

    @ApiProperty({ example: '챌린지 #1' })
    title: string;

    @ApiProperty({ example: null, nullable: true })
    description: string | null;

    @ApiProperty({ example: 12 })
    questionCount: number;

    @ApiProperty()
    createdAt: Date;
}
