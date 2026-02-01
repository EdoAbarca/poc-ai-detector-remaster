import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    signup(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            username: string;
            createdAt: Date;
        };
    }>;
}
