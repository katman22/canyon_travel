
export type ResortId = "brighton" | "alta" | "snowbird" | "solitude";

export interface Resort {
    id: ResortId;
    name: string;
    theme: string;
    departure_point: string;
}

export const RESORTS: Record<ResortId, Resort> = {
    brighton: {
        id: "brighton",
        name: "Brighton Resort",
        theme: "purps",
        departure_point: ""
    },
    alta: {
        id: "alta",
        name: "Alta Ski Area",
        theme: "cloudy",
        departure_point: ""
    },
    snowbird: {
        id: "snowbird",
        name: "Snowbird",
        theme: "clock",
        departure_point: ""
    },
    solitude: {
        id: "solitude",
        name: "Solitude Mountain Resort",
        theme: "ocean",
        departure_point: ""
    },
};

