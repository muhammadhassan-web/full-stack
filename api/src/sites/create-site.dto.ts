import { IsString, Length, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @IsString() @Length(1, 60) address: string;
  @IsString() @Length(1, 100) title: string;
  @IsString() @Length(1, 50000) html: string;
  @IsString() @Length(1, 60) authorId: string;
}