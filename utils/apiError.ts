export class ApiError extends Error{
    constructor(
        public status: number,
        public message: string,
        public data?: any
    ) {
        super(message);
        this.status = status;
        this.message = message;
        this.data = data || null;
    }
    
    static badRequest(message = "Bad Request", data?: any) {
        return new ApiError(400, message, data);
    }
    
    static unauthorized(message = "Unauthorized", data?: any) {
        return new ApiError(401, message, data);
    }
    
    static forbidden(message = "Forbidden", data?: any) {
        return new ApiError(403, message, data);
    }
    
    static notFound(message = "Not Found", data?: any) {
        return new ApiError(404, message, data);
    }
    
    static internalServerError(message = "Internal Server Error", data?: any) {
        return new ApiError(500, message, data);
    }

    static conflict(message= "fields already exists", data?: any){
        return new ApiError(409, message, data)
    }

    static incorrectCredentials(message = "Incorrect Credentials", data?: any) {
        return new ApiError(401, message, data);
    }
}