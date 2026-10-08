import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role, IssueStatus, Priority, Category } from '../enums';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @Field()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Field(() => Role, { defaultValue: Role.STUDENT })
  @IsEnum(Role)
  role: Role;

  @Field({ nullable: true })
  @IsOptional()
  departmentId?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

@InputType()
export class CreateIssueInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Field(() => Category)
  @IsEnum(Category)
  category: Category;

  @Field(() => Priority, { defaultValue: Priority.MEDIUM })
  @IsEnum(Priority)
  priority: Priority;

  @Field()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  imageUrls?: string[];
}

@InputType()
export class UpdateIssueInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => Category, { nullable: true })
  @IsOptional()
  category?: Category;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  location?: string;
}

@InputType()
export class AssignIssueInput {
  @Field(() => ID)
  @IsNotEmpty()
  issueId: string;

  @Field({ nullable: true })
  @IsOptional()
  departmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  staffId?: string;
}

@InputType()
export class UpdateIssueStatusInput {
  @Field(() => ID)
  @IsNotEmpty()
  issueId: string;

  @Field(() => IssueStatus)
  @IsEnum(IssueStatus)
  status: IssueStatus;
}

@InputType()
export class CreateDepartmentInput {
  @Field()
  @IsNotEmpty({ message: 'Department name is required' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;
}

@InputType()
export class UpdateDepartmentInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;
}

@InputType()
export class IssueFilterInput {
  @Field(() => IssueStatus, { nullable: true })
  @IsOptional()
  status?: IssueStatus;

  @Field(() => Category, { nullable: true })
  @IsOptional()
  category?: Category;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  departmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}
