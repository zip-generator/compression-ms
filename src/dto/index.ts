// DTO para IPayload
import { IsNumber, IsDefined, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para IData
export class DataDto {
  @IsString()
  fileName: string;
}

// DTO para IPayload
export class PayloadDto {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => DataDto)
  data: DataDto;

  @IsNumber()
  jobId: number;
}
