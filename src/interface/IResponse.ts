interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface IResponse <T>{
    data: Response<T>;
    status: number;
}
