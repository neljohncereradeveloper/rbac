export interface RequestInfo {
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  user_name: string;
}

/**
 * Creates a RequestInfo object from a NestJS/Express Request object
 * @param request - The NestJS Request object (or any object with user, ip, headers, sessionId)
 * @returns RequestInfo object with user_name, ip_address, user_agent, and session_id
 */
export function createRequestInfo(request: any): RequestInfo {
  return {
    user_name: request?.user?.username || 'system',
    ip_address: request?.ip,
    user_agent:
      typeof request?.headers?.['user-agent'] === 'string'
        ? request.headers['user-agent']
        : undefined,
    session_id: request?.sessionId,
  };
}
