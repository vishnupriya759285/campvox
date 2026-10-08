import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Resolver()
export class UploadsResolver {
  constructor(private readonly uploadsService: UploadsService) {}

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async uploadImage(
    @Args('base64Data') base64Data: string,
    @Args('fileName', { nullable: true }) fileName?: string,
  ): Promise<string> {
    return this.uploadsService.uploadBase64Image(base64Data, fileName);
  }
}
