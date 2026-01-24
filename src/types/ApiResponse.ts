export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean; // Kept from reference, though may not be used
    messages?: Array<any>;
    [key: string]: any; // Allow dynamic fields for our specific data
}
