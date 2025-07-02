

export type ForecastItem = {
  name: string;
  icon: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
  number: string;
};

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

export interface LocationData {
  name: string;
  lat: string;
  lng: string;
  favorite?: boolean;
  notify?: boolean;
  favoritedAt?: string;
}

export type LocationHourlyForecast = {
  periods: ForecastPeriod[];
};

export type LocationPeriodForecast = {
  period: ForecastPeriod;
};

export type LocationForecast = {
  forecast_locale: string;
  forecasts: ForecastItem[];
  lat: string;
  long: string;
  favorite?: boolean;
  name: string;
};

export type RadarLocation = {
  radar: {
    radar: string;
  };
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

export type WatchesAndAlerts= {
  alerts: Alert[];
  fire_weather: string;
  watches_warnings: string;
};


export type Alerts= {
  alerts: Alert[]
};

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
