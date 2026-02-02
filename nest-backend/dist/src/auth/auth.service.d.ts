import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            username: string;
            createdAt: Date;
        };
    }>;
    signin(signInDto: SignInDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            username: string;
            createdAt: Date;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
}
