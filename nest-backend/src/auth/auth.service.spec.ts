import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const createUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully create a new user', async () => {
      // Mock that no user exists
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Mock password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Mock user creation
      const createdUser = {
        id: 1,
        email: createUserDto.email,
        username: createUserDto.username,
        createdAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.signup(createUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: createUserDto.username },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          username: createUserDto.username,
          password: 'hashedPassword123',
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        },
      });
      expect(result).toEqual({
        message: 'User registered successfully',
        user: createdUser,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Mock that user with email exists
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: createUserDto.email,
      });

      await expect(service.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when username already exists', async () => {
      // Mock that email doesn't exist but username does
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({
          // username check
          id: 1,
          username: createUserDto.username,
        });

      await expect(service.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException when user creation fails', async () => {
      // Mock that no user exists
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Mock password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Mock user creation failure
      mockPrismaService.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.signup(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signin', () => {
    const signInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedPassword123',
      createdAt: new Date(),
    };

    it('should successfully sign in user with valid credentials', async () => {
      // Mock finding user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock password comparison
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock JWT token generation
      mockJwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');

      const result = await service.signin(signInDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          createdAt: mockUser.createdAt,
        },
        tokens: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Mock user not found
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signin(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signin(signInDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Mock finding user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock password comparison failure
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signin(signInDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout and return success message', async () => {
      const result = await service.logout();

      expect(result).toEqual({
        message: 'Logout successful',
      });
    });
  });
});
