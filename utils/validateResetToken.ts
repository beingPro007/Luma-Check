import { ApiError } from "./apiError";
import asyncHandler from "./asyncHandler";
import crypto from "crypto"
import prisma from "./prismaClient";
import { ApiResponse } from "./apiResponse";
import { Request, Response } from 'express';

export const validateResetToken = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id: resetToken } = req.params;

    if (!resetToken) {
      throw ApiError.badRequest('Reset token is required');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        forgottenPasswordToken: hashedToken,
        forgottenPasswordExpiryTime: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    res.status(200).json(ApiResponse.success('Valid token'));
  }
);
