export class ChallengeResponseDto {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    questionCount: number;
    createdAt: Date;
}
