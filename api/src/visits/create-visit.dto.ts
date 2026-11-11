import { IsIn, IsString, Length } from 'class-validator';

export class CreateVisitDto {
  @IsString() @Length(1, 200) address: string;
  @IsIn(['typed', 'link', 'back', 'forward', 'history', 'search']) via: string;
  @IsString() @Length(8, 80) visitId: string;
}