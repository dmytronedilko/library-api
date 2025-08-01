import {Controller, Post, Body, Param, Get, Patch, Delete, UsePipes, ValidationPipe, ParseIntPipe, NotFoundException} from "@nestjs/common";
import {UserService} from "./user.service";
import {User} from "@prisma/client";
import {LoginUserDto} from "./dto/login-user.dto";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User registered successfully.' })
    @ApiResponse({ status: 400, description: 'User with this email already exists.' })
    @UsePipes(new ValidationPipe())
    async signup(@Body() registerData: CreateUserDto): Promise<Omit<User, 'password'>> {
        return await this.userService.register(registerData);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({ status: 200, description: 'User logged in successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid email or password.' })
    @UsePipes(new ValidationPipe())
    async login(@Body() loginData: LoginUserDto): Promise<Omit<User, 'password'>> {
        return await this.userService.login(loginData);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of users.' })
    @ApiResponse({ status: 404, description: 'Users not found.' })
    async getAllUsers(): Promise<{ status: string, data: Omit<User, 'password'>[], message?: string }> {
        try {
            const users = await this.userService.findAllUsers();
            return { status: 'success', data: users };
        } catch (error) {
            return { status: 'error', data: [], message: error.message };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User found.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async getUserById(@Param('id', ParseIntPipe) id: number): Promise<{ status: string, data?: Omit<User, 'password'>, message?: string }> {
        try {
            const user = await this.userService.findUserById(id);
            return { status: 'success', data: user };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { status: 'error', message: error.message };
            }
            throw error;
        }
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Get user by email' })
    @ApiParam({ name: 'email', type: String })
    @ApiResponse({ status: 200, description: 'User found.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async getUserByEmail(@Param('email') email: string): Promise<{ status: string, data?: Omit<User, 'password'>, message?: string }> {
        try {
            const user = await this.userService.findUserByEmail(email);
            return { status: 'success', data: user };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { status: 'error', message: error.message };
            }
            throw error;
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UsePipes(new ValidationPipe())
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: UpdateUserDto
    ): Promise<{ status: string, data?: Omit<User, 'password'>, message?: string }> {
        try {
            const user = await this.userService.updateUser(id, updateData);
            return { status: 'success', data: user };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { status: 'error', message: error.message };
            }
            throw error;
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<{ status: string; message?: string }> {
        try {
            await this.userService.deleteUser(id);
            return { status: 'success', message: 'User deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { status: 'error', message: error.message };
            }
            throw error;
        }
    }
}