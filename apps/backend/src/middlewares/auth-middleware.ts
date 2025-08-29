import { HTTP_STATUS } from "../constants/http-status";
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
// import { auth } from "@/config/auth"; // TODO: Implement auth config
// import { Session, User } from "@/generated/prisma"; // TODO: Check if these types exist

// Only check for access token and if it is valid, set the user in the request object (else 401)

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Implement auth middleware when auth config is available
  // const response = await auth.api.getSession({
  //   headers: fromNodeHeaders(req.headers),
  // });

  // if (!response) {
  //   return res.status(HTTP_STATUS.UNAUTHORIZED).json({
  //     message: "Unauthorized",
  //   });
  // }

  // const { session, user } = response;
  // req.session = session as Session;
  // req.user = user as User;
  
  // For now, just pass through without authentication
  next();
};
