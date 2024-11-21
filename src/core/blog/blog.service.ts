import { ForbiddenException, Injectable } from '@nestjs/common';
import { PostDTO } from '../../common/dto/blog.dto';
import { BlogPostRepository } from '../../datalake/blog-post/blog.repository';
import { UsersRepository } from '../../datalake/users/users.repository';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepo: BlogPostRepository,
    private readonly userRepo: UsersRepository
  ) {}

  async create(dto: Partial<PostDTO>, user) {
    const { name, avatar, _id } = user;
    return this.blogRepo.create({
      ...dto,
      author: {
        name,
        avatar,
        userId: _id,
      },
    });
  }

  async getAllPosts() {
    return this.blogRepo.find({});
  }

  async getPost(postId: string) {
    return this.blogRepo.findById(postId);
  }

  async updatePost(postId: string, updateDto: PostDTO, user) {
    const { author } = await this.blogRepo.findById(postId);

    if (!user.isRoot && author.userId !== user._id) {
      throw new ForbiddenException('Вы не можете редактировать чужой пост');
    }

    return this.blogRepo.findByIdAndUpdate(postId, updateDto, {});
  }

  async deletePost(postId: string, user) {
    const { author } = await this.blogRepo.findById(postId);

    if (!user.isRoot && author.userId !== user._id) {
      throw new ForbiddenException('Вы не можете удалить чужой пост');
    }

    await this.blogRepo.findByIdAndDelete(postId);
    return {};
  }
}
