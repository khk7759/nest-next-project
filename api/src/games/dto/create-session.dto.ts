import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
    @IsOptional()
    @IsString()
    @MaxLength(20)
    nickname?: string;
}
