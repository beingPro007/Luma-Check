export class ApiResponse {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
    public error?: any
  ) {
    this.status = status;
    this.message = message;
    this.data = data || null;
    this.error = error || null;
  }

  static success(data: any, message = "Success") {
    return new ApiResponse(200, message, data);
  }

  static error(error: any, message = "Error") {
    return new ApiResponse(500, message, null, error);
  }

  static notFound(message = "Not Found") {
    return new ApiResponse(404, message);
  }

  static badRequest(message = "Bad Request") {
    return new ApiResponse(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiResponse(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiResponse(403, message);
  }

}
