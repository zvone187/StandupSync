import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: Record<string, unknown>;
}
declare const requireUser: (allowedRoles?: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to require specific role(s)
 * Usage: requireRole('admin') or requireRole(['admin', 'moderator'])
 */
declare const requireRole: (roles: string | string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export { requireUser, requireRole, };
//# sourceMappingURL=auth.d.ts.map