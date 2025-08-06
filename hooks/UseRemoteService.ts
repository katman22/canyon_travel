// hooks/useRemoteService.ts
import axios from 'axios';
import Constants from 'expo-constants';
import {AlertEventResponse, GoogleDirectionsResponse, TravelTimes, UdotCameraResponse} from "@/constants/types";
import {Resort} from "@/context/ResortListContext"
const api_server = "https://pumanawa-kam.onrender.com/api/v1";
const token =  "eyJhbGciOiJIUzI1NiJ9.eyJhcHAiOiJtb2JpbGUiLCJleHAiOjIwNjIyODY1MzZ9.SeN6BWPJtm-_dADD37jqFKWoVkgjq_bnwbDWza-JEdc";
//Constants.expoConfig?.extra?.apiJwtToken ??
//Constants.expoConfig?.extra?.apiUrl ??

export const fetchTravelData = async (resort: Resort): Promise<TravelTimes> => {
console.log(resort)
  const response = await axios.get(`${api_server}/canyon_times/times`, {
    params: { resort_id: resort.id },
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data)
  return response.data;
};

export const fetchDirections = async (resort: Resort): Promise<GoogleDirectionsResponse> => {
  const response = await axios.get(`${api_server}/canyon_times/directions`, {
    params: { resort_id: resort.id },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchCameras = async (resort: Resort): Promise<UdotCameraResponse> => {
  const response = await axios.get(`${api_server}/canyon_times/cameras`, {
    params: { resort_id: resort.id },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchAlertsEvents = async (resort: Resort): Promise<AlertEventResponse> => {
  const response = await axios.get(`${api_server}/canyon_times/alerts_events`, {
    params: { resort_id: resort.id },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


