import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Zorg ervoor dat dit overeenkomt met je backend
});

export default api;
