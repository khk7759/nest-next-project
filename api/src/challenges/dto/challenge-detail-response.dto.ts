import { ApiProperty } from '@nestjs/swagger';
import { QuestionResponseDto } from './question-response.dto';

export class ChallengeDetailResponseDto {
    @ApiProperty({ example: 'uuid-1234' })
    id: string;

    @ApiProperty({ example: 'ch00001' })
    slug: string;

    @ApiProperty({ example: '챌린지 #1' })
    title: string;

    @ApiProperty({ example: null, nullable: true })
    description: string | null;

    @ApiProperty({ type: [QuestionResponseDto] })
    questions: QuestionResponseDto[];

    @ApiProperty()
    createdAt: Date;
}
