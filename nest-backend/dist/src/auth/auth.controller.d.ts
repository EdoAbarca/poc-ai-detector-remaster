import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
