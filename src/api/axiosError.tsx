import { AxiosError } from 'axios';

interface SpringErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export type ApiError = AxiosError<SpringErrorResponse>;