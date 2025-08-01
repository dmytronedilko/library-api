import {Injectable, BadRequestException, NotFoundException} from "@nestjs/common";
import { User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import {PrismaService} from "../../prisma/prisma.service";
import {CreateUserDto} from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async register ({email, password, userName}: CreateUserDto): Promise<Omit<User, 'password'>> {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        const newUser = await this.prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                userName: userName
            }
        });
        const { password: _, ...result } = newUser;
        return result;
    }

    async login({ email, password }: LoginUserDto): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new BadRequestException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid email or password');
        }
        const { password: _, ...result } = user;
        return result;
    }

    async findAllUsers(): Promise<Omit<User, 'password'>[]> {
        const users = await this.prisma.user.findMany();
        if (!users) {
            throw new NotFoundException('Users not found');
        }
        return users.map(user => {
            const { password: _, ...result } = user;
            return result;
        });
    }

    async findUserById(userId: number): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { password: _, ...result } = user;
        return result;
    }

    async findUserByEmail(email: string): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { password: _, ...result } = user;
        return result;
    }

    async updateUser(userId: number, updateData: UpdateUserDto): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { userId },
            data: updateData,
        });
        const { password: _, ...result } = updatedUser;
        return result;
    }

    async deleteUser(userId: number): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.prisma.user.delete({ where: { userId } });
    }
}