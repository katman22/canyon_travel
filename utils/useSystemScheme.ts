// theme/useSystemScheme.ts
import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export function useSystemScheme() {
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setScheme(colorScheme));
    return () => sub.remove();
  }, []);

  return scheme ?? 'light';
}
