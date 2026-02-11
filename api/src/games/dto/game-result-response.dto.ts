export class AnswerResultDto {
    questionId: string;
    selected: string;
    isCorrect: boolean;
    humanImageUrl: string;
    aiImageUrl: string;
}

export class GameResultResponseDto {
    sessionId: string;
    score: number;
    totalQuestions: number;
    timeTakenMs: number | null;
    completedAt: Date | null;
    answers: AnswerResultDto[];
}
