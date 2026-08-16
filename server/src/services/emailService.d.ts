declare const transporter: {
  verify: (callback: (error: Error | null, success: boolean) => void) => void;
  sendMail: (mailOptions: Record<string, unknown>) => Promise<{ messageId: string }>;
};

export const sendPasswordResetEmail: (
  email: string,
  resetToken: string,
  resetUrl: string
) => Promise<{ success: boolean; messageId?: string }>;

export const sendPasswordResetConfirmationEmail: (
  email: string,
  userName: string
) => Promise<{ success: boolean; messageId?: string }>;

export default transporter;
