

export type Alert= {
  effective: string;
  headline: string;
  onset: string;
  expires: string;
  ends: string;
  status: string;
  message_type: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  sender_name: string;
  sender: string;
  description: string;
  instruction: string;
  response: string;
};

export type TravelTimes= {
  resort: string;
  to_resort: string;
  from_resort: string;
  departure_point: string;
  parking: ParkingData;
  weather: WeatherData;
  traffic: string;
  updated_at: string;
}

export type WeatherData = {
  summary: string;
  hourly: LocationHourlyForecast;
}

export interface GoogleDirectionsResponse {
  routes: Route[];
}

export interface ParkingData {
  operations: OperatingHours;
}

export type OperatingHours={
  operating_days: OperatingDays[];
  holiday_open_days: OperatingHolidays[];
}

export type OperatingDays={
  day: string,
  hours: string,
  order: number;
}

export type OperatingHolidays={
  date: string,
  label: string,
  hours: string,
  order: number;
}


export interface Route {
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: Polyline;
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

export interface Bounds {
  northeast: LatLng;
  southwest: LatLng;
}

export interface Leg {
  distance: TextValue;
  duration: TextValue;
  duration_in_traffic: TextValue;
  end_address: string;
  end_location: LatLng;
  start_address: string;
  start_location: LatLng;
  steps: Step[];
  traffic_speed_entry: any[]; // Usually empty
  via_waypoint: any[];        // Usually empty
}

export interface Step {
  distance: TextValue;
  duration: TextValue;
  end_location: LatLng;
  html_instructions: string;
  maneuver?: string;
  polyline: Polyline;
  start_location: LatLng;
  travel_mode: string;
}

export interface TextValue {
  text: string;
  value: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Polyline {
  points: string;
}

export interface UdotCamera {
  Id: string;
  Source: string;
  SourceId: string;
  Roadway: string;
  Direction: string;
  Latitude: number;
  Longitude: number;
  Location: string;
  SortOrder: number;
  Views: UdotCameraView[];
}

export interface UdotCameraView {
  Id: number;
  Url: string;
  Status: string;
  Description: string;
}

export interface UdotCameraResponse {
  cameras: UdotCamera[];
}
export interface AlertEventResponse {
  alerts_events: AlertsEvents;
}

export interface AlertsEvents {
  conditions: RoadCondition[];
  events: UdotEvent[];
  alerts: WeatherAlert[]; // Assuming you may expand this
  summary: string;
}

export interface RoadCondition {
  Id: number;
  SourceId: string;
  RoadCondition: string;
  WeatherCondition: string;
  Restriction: string;
  RoadwayName: string;
  LastUpdated: number;
}

export interface UdotEvent {
  RoadwayName: string;
  Organization: string;
  Description: string;
  Comment: string;
  IsFullClosure: boolean;
  EventCategory: string;
  Location: string;
  MPStart: string;
  MPEnd: string;
}

export interface WeatherAlert {
  title: string;
  description?: string;
  severity?: string;
  source?: string;
  expires_at?: string;
}

export interface SignResponse {
  signs: Sign[];
}

export interface Resorts{
  resorts: Resort[]
}

export type Resort= {
  id: number;
  resort_id: string;
  resort_name: string;
  departure_point: string;
  latitude: number;
  longitude: number;
  location: string;
  theme: "purps";
}

export interface Sign {
  Id: string;
  Name: string;
  Roadway?: string;
  DirectionOfTravel?: string;
  Messages?: string[];
  Latitude?: number;
  Longitude?: number;
  LastUpdated?: number;
}

export type ForecastPeriod = {
  number: string;
  name: string;
  icon: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
  windSpeed: string,
  windDirection: string,
  startTime: string,
  dewpoint:{
    unitCode: string,
    value: number | null;
  };
  relativeHumidity: {
    "unitCode": string,
    "value": number | null;
  },
  probabilityOfPrecipitation: {
    unitCode: string;
    value: number | null; // sometimes it might be null
  };
};

export type LocationHourlyForecast = {
  periods: ForecastPeriod[];
};

export type Alerts= {
  alerts: AlertWeather[]
};

export type AlertWeather= {
  effective: string;
  headline: string;
  onset: string;
  expires: string;
  ends: string;
  status: string;
  message_type: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  sender_name: string;
  sender: string;
  description: string;
  instruction: string;
  response: string;
};

export type Discussion = {
  discussion: DiscussionData;
}

export type DiscussionData = {
  synopsis: string;
  short_term: string;
  long_range: string;
  aviation: string;
  fire_weather: string;
  watches_warnings: string;
}

export type ParkingLink = {
  url: string;
  label: string;
};

export type ParkingMedia = {
  // expand later if you add non-YouTube media here
  youtube_ids?: string[]; // optional array of youtube IDs if you choose to store them here later
};

export type ParkingResponse = {
  profile: ParkingProfile;
};

export type ParkingProfile = {
  id: number;
  resort_id: number;
  label: string;       // "Parking for 2025-26 Season"
  season: string;      // "2025-26F548t0"
  effective_from?: string | null; // ISO
  effective_to?: string | null;   // ISO
  overnight?: boolean | null;
  version?: number;
  rules?: ParkingRule[];
  faqs?: ParkingFAQ[];
  operations?: OperatingHours;
  highway_parking?: Record<string, unknown>;
  links?: ParkingLink[];
  accessibility?: Record<string, unknown>;
  media?: ParkingMedia;
  sources?: string[];
  summary?: string | null;
  source_digest?: string | null;
  updated_by?: string | null;
  created_at?: string; // ISO
  updated_at?: string; // ISO
  live?: boolean;
};

export type SunriseSunset = {
 sunrise_sunset: SunData
};

export type SunData = {
  date: string;
  sunrise: string,
  sunset: string,
  first_light: string,
  last_light: string,
  dawn: string,
  dusk: string,
  solar_noon: string,
  golden_hour: string,
  day_length: string,
  timezone: string,
  utc_offset: number
}

export type ParkingRule = {
  topic: string;
  details: string;
};

export type ParkingFAQ = {
  q: string;
  a: string;
};


