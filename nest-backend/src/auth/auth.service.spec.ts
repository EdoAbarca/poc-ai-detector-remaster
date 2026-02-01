import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockPrisma = (service as any).prisma;

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
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Mock password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Mock user creation
      const createdUser = {
        id: 1,
        email: createUserDto.email,
        username: createUserDto.username,
        createdAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.signup(createUserDto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: createUserDto.username },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
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
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: createUserDto.email,
      });

      await expect(service.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when username already exists', async () => {
      // Mock that email doesn't exist but username does
      mockPrisma.user.findUnique
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
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Mock password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Mock user creation failure
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.signup(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
