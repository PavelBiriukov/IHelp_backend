import { ApiProperty } from '@nestjs/swagger';
import { BlogPostInterface } from '../../../common/types/blog-post.types';
import { AuthorDto } from './author.dto';

export class CreatedPostDto implements BlogPostInterface {
  @ApiProperty({
    example: 'Благотворительность в рекламе',
    description: 'Заголовок блога',
    required: true,
  })
  title: string;

  @ApiProperty({
    example: 'Благотворительность в рекламеБлаготворительность в рекламе...',
    description: 'Текст блога',
    required: true,
  })
  text: string;

  @ApiProperty({ type: AuthorDto, description: 'Автор блога', required: true })
  author: AuthorDto;

  @ApiProperty({
    example: [],
    description: 'Файлы, связанные с блогом',
    required: false,
    type: [String],
  })
  files?: string[];
}
