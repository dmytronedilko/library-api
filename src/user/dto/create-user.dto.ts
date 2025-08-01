import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8, description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'username', description: 'User name' })
  @IsString()
  userName: string;
}