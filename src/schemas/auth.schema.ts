import { z } from 'zod';
import { emailSchema, passwordSchema } from 'src/schemas/common.schema';
import i18n from 'src/i18n';

/** Login form schema — generic auth stub, no product assumptions. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, i18n.t('FORM_TOO_SHORT')),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Signup form schema — password strength enforced, confirm-password must match. */
export const signupSchema = z
  .object({
    name: z.string().trim().min(1, i18n.t('FORM_REQUIRED')),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: i18n.t('FORM_PASSWORDS_DO_NOT_MATCH'),
    path: ['confirmPassword'],
  });

export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, i18n.t('FORM_INVALID_OTP')),
});

export type OtpValues = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    code: z.string().regex(/^\d{6}$/, i18n.t('FORM_INVALID_OTP')),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: i18n.t('FORM_PASSWORDS_DO_NOT_MATCH'),
    path: ['confirmPassword'],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
