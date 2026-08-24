/**
 * Supabase Auth identifies users by email, but the salon staff sign in with a
 * plain username. Anything without an "@" gets the salon domain appended, so
 * "sarah" and "sarah@shearmadnesshoboken.com" are the same account.
 */
export const LOGIN_EMAIL_DOMAIN = "shearmadnesshoboken.com"

export function toLoginEmail(usernameOrEmail: string): string {
  const value = usernameOrEmail.trim().toLowerCase()
  return value.includes("@") ? value : `${value}@${LOGIN_EMAIL_DOMAIN}`
}

/** Inverse of toLoginEmail — what to show staff as their username. */
export function toDisplayUsername(email: string): string {
  const suffix = `@${LOGIN_EMAIL_DOMAIN}`
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email
}
