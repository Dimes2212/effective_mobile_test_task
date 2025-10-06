export class AppError extends Error {
    public status: number;
    public code: string;
  
    constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
      super(message);
      this.status = status;
      this.code = code;
    }
  }

  export class ValidationError extends AppError {
    constructor(message = "Validation failed") {
      super(message, 400, "VALIDATION_ERROR");
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message = "Not found") {
      super(message, 404, "NOT_FOUND");
    }
  }
  
  export class AuthError extends AppError {
    constructor(message = "Unauthorized") {
      super(message, 401, "UNAUTHORIZED");
    }
  }
  