import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDetectDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
