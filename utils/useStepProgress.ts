// utlis/useStepProgress.ts
import { useState, useMemo } from 'react';

export function useStepProgress(totalSteps: number) {
  const [step, setStep] = useState(0);
  const progress = useMemo(
      () => (totalSteps <= 0 ? 0 : Math.min(1, step / totalSteps)),
      [step, totalSteps]
  );
  const next = () => setStep(s => Math.min(totalSteps, s + 1));
  const reset = () => setStep(0);
  const set = (n: number) => setStep(Math.max(0, Math.min(totalSteps, n)));
  return { step, setStep: set, next, reset, progress, totalSteps };
}
