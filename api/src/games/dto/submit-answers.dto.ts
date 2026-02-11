import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    @ApiProperty({ example: 'uuid-1234' })
    @IsString()
    questionId: string;

    @ApiProperty({ enum: SelectedChoice, example: 'A' })
    @IsEnum(SelectedChoice)
    selected: 'A' | 'B';
}

export class SubmitAnswersDto {
    @ApiProperty({ type: [AnswerItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AnswerItemDto)
    answers: AnswerItemDto[];

    @ApiPropertyOptional({ example: 30000, minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    timeTakenMs?: number;
}
