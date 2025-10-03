import React, { createContext, useContext, PropsWithChildren } from 'react';

type FontAvailability = { orbitronAvailable: boolean };

const FontCtx = createContext<FontAvailability>({ orbitronAvailable: false });

export function FontAvailabilityProvider({
                                             orbitronAvailable,
                                             children,
                                         }: PropsWithChildren<{ orbitronAvailable: boolean }>) {
    return <FontCtx.Provider value={{ orbitronAvailable }}>{children}</FontCtx.Provider>;
}

export function useFontAvailability() {
    return useContext(FontCtx);
}
