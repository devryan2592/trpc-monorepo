import { z } from "zod";

// Password validation constants
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

// Helper function to validate password match
const validatePasswordMatch = (data: {
  password: string;
  confirmPassword: string;
}) => {
  return data.password === data.confirmPassword;
};

// Helper function to generate password match error
const generatePasswordMatchError = (data: {
  password: string;
  confirmPassword: string;
}) => {
  if (data.password !== data.confirmPassword) {
    return {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    };
  }
  return {};
};

// Base schemas for reusability
const EmailSchema = z.string().email({
  message: "Please enter a valid email address.",
});

const PasswordSchema = z.string().min(MIN_PASSWORD_LENGTH, {
  message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
});

const NameSchema = z.string().min(MIN_NAME_LENGTH, {
  message: `Name must be at least ${MIN_NAME_LENGTH} characters.`,
});

const TokenSchema = z.string().min(1, {
  message: "Token is required.",
});

// Sign In Schema
export const SignInRequest = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});
export type SignInRequestType = z.infer<typeof SignInRequest>;

// Sign Up Schema
export const SignUpRequest = z
  .object({
    name: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(validatePasswordMatch, generatePasswordMatchError);
export type SignUpRequestType = z.infer<typeof SignUpRequest>;

// Reset Password Request Schema
export const ResetPasswordRequestRequest = z.object({
  email: EmailSchema,
});
export type ResetPasswordRequestRequestType = z.infer<
  typeof ResetPasswordRequestRequest
>;

// Reset Password Confirm Schema
export const ResetPasswordConfirmRequest = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    token: TokenSchema,
  })
  .refine(validatePasswordMatch, generatePasswordMatchError);
export type ResetPasswordConfirmRequestType = z.infer<
  typeof ResetPasswordConfirmRequest
>;

// Verify Email Schema
export const VerifyEmailRequest = z.object({
  token: TokenSchema,
});
export type VerifyEmailRequestType = z.infer<typeof VerifyEmailRequest>;

// Response schemas for consistency
export const AuthSuccessResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});
export type AuthSuccessResponseType = z.infer<typeof AuthSuccessResponse>;

// Error response schema
export const AuthErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});
export type AuthErrorResponseType = z.infer<typeof AuthErrorResponse>;
