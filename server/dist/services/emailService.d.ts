export interface InvitationEmailData {
    toEmail: string;
    toName: string;
    inviterName: string;
    tempPassword: string;
    loginUrl: string;
}
/**
 * Send invitation email to a new user
 */
export declare function sendInvitationEmail(data: InvitationEmailData): Promise<void>;
/**
 * Send welcome email to the first admin user
 */
export declare function sendWelcomeEmail(email: string, name: string): Promise<void>;
//# sourceMappingURL=emailService.d.ts.map