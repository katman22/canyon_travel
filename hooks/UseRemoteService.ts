// hooks/useWeatherService.ts
import axios from 'axios';
import Constants from 'expo-constants';
import {
  ForecastPeriod,
  LocationData,
  LocationForecast,
  LocationHourlyForecast,
  RadarLocation,
  Alerts,
  Discussion, WatchesAndAlerts
} from "@/constants/types"
import {LatLong} from "@/components/LatLongContext"

const api_server = Constants.expoConfig?.extra?.apiServer ?? "";

export const fetchLocations = async (location: string): Promise<LocationData[]> => {
  const token =  Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/index`, {
    params: { location },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchWeather = async (location: LocationData): Promise<LocationForecast> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/forecasts`, {
    params: { lat: location.lat, long: location.lng, name: location.name },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchAlerts = async (lat: string, long: string): Promise<Alerts> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/alerts`, {
    params: { lat: lat, long: long },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchWatchesAndAlerts = async (lat: string, long: string): Promise<WatchesAndAlerts> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/watches_fire_alerts`, {
    params: { lat: lat, long: long },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchDiscussion = async (lat: string, long: string): Promise<Discussion> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/discussion`, {
    params: { lat: lat, long: long },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchHourlyWeather = async (location: LocationData): Promise<LocationHourlyForecast> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/hourly`, {
    params: { lat: location.lat, long: location.lng, name: location.name },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchPeriodForecast = async (location: LocationData, period: string): Promise<ForecastPeriod> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/period`, {
    params: { lat: location.lat, long: location.lng, name: location.name, period: period },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.period;
};

export const fetchRadar = async (latLong: LatLong): Promise<RadarLocation> => {
  const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";
  const response = await axios.get(`${api_server}/weather/radar`, {
    params: { lat: latLong.lat, long: latLong.long },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
