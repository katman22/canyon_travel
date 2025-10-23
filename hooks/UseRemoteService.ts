// hooks/useRemoteService.ts
import { http } from "@/lib/http";
import Constants from "expo-constants";
import {
  AlertEventResponse, GoogleDirectionsResponse, TravelTimes, UdotCameraResponse,
  Resort, Resorts, LocationHourlyForecast, Alerts, Discussion, ParkingResponse, SunriseSunset, SignResponse
} from "@/constants/types";
import {Platform} from "react-native";

// Small helper to add a cache-buster param on reads that must be fresh
const noCache = () => ({ params: { _: Date.now() } });
const API_BASE = 'https://pumanawa-kam.onrender.com/api/v1';

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithAbortOnce(input: RequestInfo, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // force new TCP on iOS (header is advisory but helps servers) + no-cache
    const headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      ...(Constants.expoConfig?.extra?.apiJwtToken
          ? { Authorization: `Bearer ${Constants.expoConfig.extra.apiJwtToken}` }
          : {}),
      ...(Platform.OS === 'ios' ? { Connection: 'close' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    };
    const res = await fetch(input, { ...init, headers, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(to);
  }
}

export const fetchResorts = async (): Promise<Resorts> => {
  const url = `${API_BASE}/canyon_times/resorts?_=${Date.now()}`;

  // Try once with a short fuse to break any stale connection,
  // then immediately retry with a normal timeout if it aborted/failed.
  try {
    const first = await fetchWithAbortOnce(url, { method: 'GET' }, 2500);
    if (!first.ok) throw new Error(`HTTP ${first.status} /canyon_times/resorts`);
    return first.json();
  } catch (e: any) {
    // Only treat abort / network-ish errors as retryable here
    const msg = String(e?.message ?? '').toLowerCase();
    if (msg.includes('abort') || msg.includes('network') || msg.includes('timed')) {
      await delay(200); // tiny settle
      const second = await fetchWithAbortOnce(url, { method: 'GET' }, 10000);
      if (!second.ok) throw new Error(`HTTP ${second.status} /canyon_times/resorts`);
      return second.json();
    }
    throw e;
  }
};

export const fetchTravelData = async (resort: Resort): Promise<TravelTimes> => {

  const res = await http.get("/canyon_times/times", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/times`);
};

export const fetchTravelDataTo = async (resort: Resort): Promise<TravelTimes> => {

  const res = await http.get("/canyon_times/times", {
    params: { resort_id: resort.resort_id, _: Date.now(), type: "to" },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/times`);
};

export const fetchTravelDataFrom = async (resort: Resort): Promise<TravelTimes> => {

  const res = await http.get("/canyon_times/times", {
    params: { resort_id: resort.resort_id, _: Date.now(), type: "from" },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/times`);
};

export const fetchParkingProfile = async (resort: Resort): Promise<ParkingResponse> => {
  const res = await http.get("/canyon_times/parking_profile", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/parking_profile`);
};

export const fetchSunriseSunSet = async (resort: Resort): Promise<SunriseSunset> => {
  const res = await http.get("/weather/sunrise_sunset", {
    params: { slug: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /weather/sunrise_sunset`);
};

export const fetchDirections = async (resort: Resort): Promise<GoogleDirectionsResponse> => {
  const res = await http.get("/canyon_times/directions", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/directions`);
};

export const fetchAlerts = async (resort: Resort): Promise<Alerts> => {
  const res = await http.get("/weather/alerts", {
    params: { lat: resort.latitude, long: resort.longitude, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data.alerts;
  throw new Error(`HTTP ${res.status} /weather/alerts`);
};

export const fetchDiscussion = async (resort: Resort): Promise<Discussion> => {
  const res = await http.get("/weather/discussion", {
    params: { lat: resort.latitude, long: resort.longitude, country_code: "us", _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /weather/discussion`);
};

export const fetchHourlyWeather = async (resort: Resort): Promise<LocationHourlyForecast> => {
  const res = await http.get("/weather/hourly", {
    params: { lat: resort.latitude, long: resort.longitude, name: resort.resort_name, country_code: "us", _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /weather/hourly`);
};

export const fetchCameras = async (resort: Resort): Promise<UdotCameraResponse> => {
  const res = await http.get("/canyon_times/cameras", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/cameras`);
};

export const featuredCameras = async (resort: Resort): Promise<UdotCameraResponse> => {
  const res = await http.get("/canyon_times/featured_cameras", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/featured_cameras`);
};

export const parkingCameras = async (resort: Resort): Promise<UdotCameraResponse> => {
  const res = await http.get("/canyon_times/parking_cameras", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/parking_cameras`);
};

export const fetchAlertsEvents = async (resort: Resort): Promise<AlertEventResponse> => {
  const res = await http.get("/canyon_times/alerts_events", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/alerts_events`);
};

export const fetchSigns = async (resort: Resort): Promise<SignResponse> => {
  const res = await http.get("/canyon_times/signs", {
    params: { resort_id: resort.resort_id, _: Date.now() },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`HTTP ${res.status} /canyon_times/signs`);
};
