import { ApiProperty } from '@nestjs/swagger';
import { PointGeoJSONInterface } from '../../../common/types/point-geojson.types';

export class LocationDto implements PointGeoJSONInterface {
  @ApiProperty({ example: 'Point', description: 'Тип местоположения' })
  type: 'Point';

  @ApiProperty({
    example: [47.249366, 39.710494],
    description: 'Координаты местоположения',
  })
  coordinates: [number, number];

  @ApiProperty({
    example: '66bcbaf831bd2d046260a91c',
    description: 'Идентификатор местоположения',
  })
  _id: string;

  @ApiProperty({
    example: '2024-08-14T14:11:04.559Z',
    description: 'Дата создания местоположения',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-08-14T14:11:04.559Z',
    description: 'Дата обновления местоположения',
  })
  updatedAt: string;
}
