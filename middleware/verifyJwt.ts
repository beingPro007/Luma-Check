import { ApiError } from '../utils/apiError';
import asyncHandler from '../utils/asyncHandler';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: any;
}

interface JwtPayload {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  iat: number;
  exp: number;
}

export const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('Access token missing');
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET_KEY!
      ) as JwtPayload;

      if (!decoded?.id) {
        throw ApiError.unauthorized(
          'Token payload is invalid (missing user ID)'
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      req.user = user;
      next();
    } catch (error: any) {
      throw ApiError.unauthorized(error.message || 'Invalid access token');
    }
  }
);
