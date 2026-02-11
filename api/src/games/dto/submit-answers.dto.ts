import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum SelectedChoice {
    A = 'A',
    B = 'B',
}

export class AnswerItemDto {
    @IsString()
    questionId: string;

    @IsEnum(SelectedChoice)
    selected: 'A' | 'B';
}

export class SubmitAnswersDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AnswerItemDto)
    answers: AnswerItemDto[];

    @IsOptional()
    @IsInt()
    @Min(0)
    timeTakenMs?: number;
}
