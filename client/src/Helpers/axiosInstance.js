import axios from "axios";
//backend url
const BASE_URL = "http://localhost:5002/api/v1";

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = BASE_URL;
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;