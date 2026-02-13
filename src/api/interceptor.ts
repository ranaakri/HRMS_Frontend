import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const AxiosInterceptor = ({ children } :any) => {
  const navigate = useNavigate();

  useEffect(() => {
    const resInterceptor = (response : any) => {
      return response.data;
    };

    const errInterceptor = (error: any) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            navigate('/login');
            break;
          case 404:
            navigate('/404');
            break;
          case 500:
            navigate('/500');
            break;
          default:
        }
      }

      return Promise.reject(error);
    };

    const interceptor = api.interceptors.response.use(resInterceptor, errInterceptor);

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return children;
};

export default AxiosInterceptor;