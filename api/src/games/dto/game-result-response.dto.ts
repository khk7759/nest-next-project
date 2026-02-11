import { ApiProperty } from '@nestjs/swagger';

export class AnswerResultDto {
    @ApiProperty({ example: 'uuid-1234' })
    questionId: string;

    @ApiProperty({ example: 'A' })
    selected: string;

    @ApiProperty({ example: true })
    isCorrect: boolean;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    humanImageUrl: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    aiImageUrl: string;
}

export class GameResultResponseDto {
    @ApiProperty({ example: 'uuid-1234' })
    sessionId: string;

    @ApiProperty({ example: 8 })
    score: number;

    @ApiProperty({ example: 12 })
    totalQuestions: number;

    @ApiProperty({ example: 30000, nullable: true })
    timeTakenMs: number | null;

    @ApiProperty({ nullable: true })
    completedAt: Date | null;

    @ApiProperty({ type: [AnswerResultDto] })
    answers: AnswerResultDto[];
}
