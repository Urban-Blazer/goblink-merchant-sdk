export class GoBlinkError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = "GoBlinkError";
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, GoBlinkError.prototype);
  }

  static authenticationFailed(message = "Authentication failed. Check your API key."): GoBlinkError {
    return new GoBlinkError(message, 401, "AUTHENTICATION_FAILED");
  }

  static validationError(message: string, details?: unknown): GoBlinkError {
    return new GoBlinkError(message, 400, "VALIDATION_ERROR", details);
  }

  static notFound(message = "Resource not found."): GoBlinkError {
    return new GoBlinkError(message, 404, "NOT_FOUND");
  }

  static rateLimited(message = "Rate limit exceeded. Please retry later."): GoBlinkError {
    return new GoBlinkError(message, 429, "RATE_LIMITED");
  }

  static serverError(message = "Internal server error."): GoBlinkError {
    return new GoBlinkError(message, 500, "SERVER_ERROR");
  }

  static fromResponse(status: number, body: Record<string, unknown>): GoBlinkError {
    const message = (body.message as string) || (body.error as string) || `Request failed with status ${status}`;
    const code = (body.code as string) || `HTTP_${status}`;
    const details = body.details ?? body;

    switch (status) {
      case 400:
        return GoBlinkError.validationError(message, details);
      case 401:
        return GoBlinkError.authenticationFailed(message);
      case 404:
        return GoBlinkError.notFound(message);
      case 429:
        return GoBlinkError.rateLimited(message);
      default:
        if (status >= 500) return GoBlinkError.serverError(message);
        return new GoBlinkError(message, status, code, details);
    }
  }
}
