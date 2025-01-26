export const AUTH_MODES = {
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  FORGOT_PASSWORD: 'forgot_password'
} as const;

export type AuthMode = typeof AUTH_MODES[keyof typeof AUTH_MODES];

export const AUTH_MESSAGES = {
  CHECK_EMAIL: 'Check your email for the confirmation link.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  NETWORK_ERROR: 'Network error. Please try again.',
  PASSWORD_RESET: 'Password reset email sent. Check your inbox.',
} as const; 