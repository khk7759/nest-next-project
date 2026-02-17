import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

enum SelectedChoice {
    A = 'A',
    B = 'B',
}

export class CheckAnswerDto {
    @ApiProperty({ example: 'uuid-1234' })
    @IsString()
    questionId: string;

    @ApiProperty({ enum: SelectedChoice, example: 'A' })
    @IsEnum(SelectedChoice)
    selected: 'A' | 'B';
}
