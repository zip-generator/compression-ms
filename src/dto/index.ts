import { IsNumber, IsObject, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para IData
export class IDataDto<T> {
  @IsObject()
  data: { [key: string]: T[] };
}

// DTO para IPayload
export class PayloadDto {
  @IsDefined()
  @ValidateNested({ each: true }) // Validación de un objeto anidado
  @Type(() => IDataDto) // Indica que `data` es del tipo `IDataDto`
  data: IDataDto<unknown>;

  @IsNumber()
  jobId: number;
}
