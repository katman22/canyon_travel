// hooks/useRemoteService.ts
import {
  AlertEventResponse, TravelTimes, UdotCameraResponse,
  Resort, Resorts, LocationHourlyForecast, Alerts, Discussion, ParkingResponse, SunriseSunset, SignResponse
} from "@/constants/types";
import { apiAuth } from "@/lib/apiAuth";

export const fetchResorts = async (): Promise<Resorts> => {
  console.log("getting resorts");
  const RESORTS_PATH = "canyon_times/resorts";
  return apiAuth.get(RESORTS_PATH);
};

const PATH = "canyon_times/times";

export const fetchTravelData = async (
    resort: Resort,
    type: "to" | "from" | "all"
): Promise<TravelTimes> => {
  return apiAuth.get(PATH, { resort_id: resort.resort_id, type });
};

export const fetchTravelDataTo = (resort: Resort) =>
    fetchTravelData(resort, "to");

export const fetchTravelDataFrom = (resort: Resort) =>
    fetchTravelData(resort, "from");

export const fetchParkingProfile = async (
    resort: Resort
): Promise<ParkingResponse> => {
  return apiAuth.get("canyon_times/parking_profile", { resort_id: resort.resort_id });
};

export const fetchSunriseSunSet = async (
    resort: Resort
): Promise<SunriseSunset> => {
  return apiAuth.get("weather/sunrise_sunset", { resort_id: resort.resort_id});
};

export const fetchAlerts = async (
    resort: Resort
): Promise<Alerts> => {
  return apiAuth.get("weather/alerts", { lat: resort.latitude, long: resort.longitude, _: Date.now() });
};


export const fetchDiscussion = async (
    resort: Resort
): Promise<Discussion> => {
  return apiAuth.get("weather/discussion", { lat: resort.latitude, long: resort.longitude, country_code: "us", _: Date.now() });
};

export const fetchHourlyWeather = async (
    resort: Resort
): Promise<LocationHourlyForecast> => {
  return apiAuth.get("weather/hourly", { lat: resort.latitude, long: resort.longitude, name: resort.resort_name, country_code: "us", _: Date.now() });
};

export const fetchCameras = async (
    resort: Resort
): Promise<UdotCameraResponse> => {
  return apiAuth.get("canyon_times/cameras", { resort_id: resort.resort_id});
};

export const featuredCameras = async (
    resort: Resort
): Promise<UdotCameraResponse> => {
  return apiAuth.get("canyon_times/featured_cameras", { resort_id: resort.resort_id });
};

export const parkingCameras = async (
    resort: Resort
): Promise<UdotCameraResponse> => {
  return apiAuth.get("canyon_times/parking_cameras", { resort_id: resort.resort_id });
};

export const fetchAlertsEvents = async (
    resort: Resort
): Promise<AlertEventResponse> => {
  return apiAuth.get("canyon_times/alerts_events", { resort_id: resort.resort_id });
};


export const fetchSigns = async (
    resort: Resort
): Promise<SignResponse> => {
  return apiAuth.get("canyon_times/signs", { resort_id: resort.resort_id });
};
