

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
  parking: string;
  weather: string;
  traffic: string;
  updated_at: string;
}

export interface GoogleDirectionsResponse {
  routes: Route[];
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
  Id: number;
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



