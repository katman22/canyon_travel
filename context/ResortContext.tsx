
export type ResortId = "brighton" | "alta" | "snowbird" | "solitude";

export interface Resort {
    id: ResortId;
    name: string;
    theme: string;
}

export const RESORTS: Record<ResortId, Resort> = {
    brighton: {
        id: "brighton",
        name: "Brighton Resort",
        theme: "purps",
    },
    alta: {
        id: "alta",
        name: "Alta Ski Area",
        theme: "cloudy",
    },
    snowbird: {
        id: "snowbird",
        name: "Snowbird",
        theme: "clock",
    },
    solitude: {
        id: "solitude",
        name: "Solitude Mountain Resort",
        theme: "ocean",
    },
};

