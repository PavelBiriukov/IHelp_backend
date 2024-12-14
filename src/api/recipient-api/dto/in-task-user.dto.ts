import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InTaskUserDto {
  @ApiProperty({
    example: 'Москва, Красная Площадь, д.1',
    description: 'адрес',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'www.leningrad.spb.tochka.ru',
    description: 'аватар',
  })
  @IsString()
  avatar: string;

  @ApiProperty({
    example: 'Сергей Шнуров',
    description: 'имя',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '777-555',
    description: 'телефон',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: '66d15caf4243330792c8d7b3',
    description: 'ай ди',
  })
  @IsString()
  _id: string;
}
