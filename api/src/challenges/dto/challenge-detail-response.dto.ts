import { QuestionResponseDto } from './question-response.dto';

export class ChallengeDetailResponseDto {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    questions: QuestionResponseDto[];
    createdAt: Date;
}
