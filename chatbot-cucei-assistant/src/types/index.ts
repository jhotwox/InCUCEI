export interface AcademicMaterialRequest {
    subject: string;
    type: 'pdf' | 'video' | 'notes';
}

export interface AcademicMaterialResponse {
    title: string;
    url: string;
    description: string;
}

export interface ErrorResponse {
    message: string;
    statusCode: number;
}