// api.ts
import axios from 'axios';
import { Platform } from 'react-native';

export const api = axios.create({
    baseURL: 'https://pumanawa-kam.onrender.com/api/v1/canyon_times',
    timeout: Platform.select({ ios: 20000, android: 8000 }), // iOS gets more headroom
});
