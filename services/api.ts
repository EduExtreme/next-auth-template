
import axios, { AxiosError } from 'axios'
import {parseCookies, setCookie} from 'nookies'
import { signOut } from '../context/AuthContext';

type AxiosErrorCode = {
  code?: string;
}

type FailedRequestQueue = {
  onSuccess: (token: string) => void,
  onFailure: (err: AxiosError) => void
}

let cookies = parseCookies();


let isRefreshing = false;
let failedRequestQeue: FailedRequestQueue[] = [];

export const api = axios.create({
  baseURL:'http://localhost:3333',
  headers: {
    Authorization: ` Bearer ${cookies['auth.token']}`
  }
})

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError<AxiosErrorCode>) => {

  
  console.log('axios error',error.response)
  if (error.response?.status === 401) {
    if (error.response.data?.code === "token.expired") {

      cookies = parseCookies();


      const {"auth.refreshToken" : refreshToken} = cookies
      const originalConfig = error.config

      if (!isRefreshing) {
        isRefreshing = true
        api.post('/refresh', {
          refreshToken,
        }).then(response => {
          const {token} = response.data
          setCookie(undefined, "auth.token", token, {
            maxAge: 60 * 60 * 24 * 30,
            path: "./",
          });
          setCookie(undefined, "auth.refreshToken", response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30,
            path: "./",
          });
          
      api.defaults.headers['Authorization'] = `Bearer ${token}`;   

      failedRequestQeue.forEach(request => request.onSuccess(token))
      failedRequestQeue = [];
        }).catch(err => {
          failedRequestQeue.forEach(request => request.onFailure(err))
          failedRequestQeue =[];
        }).finally(()=> {
          isRefreshing = false
        });
      }
      return new Promise ((resolve, reject) => {
        failedRequestQeue.push({
          onSuccess: (token: string)=> {
            if(!originalConfig?.headers) {
              return
            }

            originalConfig.headers['Authorization'] = `Bearer ${token}`

            resolve(api(originalConfig))
            
          },
          onFailure: (err: AxiosError) => {
            reject(err)
          }
        })
      }) 

    } else {
      signOut();
    }

    return Promise.reject(error);
  }
})