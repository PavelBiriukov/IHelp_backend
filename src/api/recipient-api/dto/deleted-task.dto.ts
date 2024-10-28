import { ApiProperty } from '@nestjs/swagger';

export class DeletedTaskDto {
  @ApiProperty({
    example: true,
    description: 'признанние операции',
  })
  acknowledged: boolean;

  @ApiProperty({
    example: 1,
    description: 'количество удаленных запией',
  })
  deletedCount: number;
}
