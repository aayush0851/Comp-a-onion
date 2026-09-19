import { useState } from 'react';
import { usersApi } from '../api';
import type { UpdateMeInput } from '../api/users';

// Saves one onboarding step to the server before moving on, so a reinstall can resume from it.
export function useOnboardingSave() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (dto: UpdateMeInput | (() => Promise<UpdateMeInput>), onSaved: () => void) => {
    setSaving(true);
    setError('');
    try {
      await usersApi.updateMe(typeof dto === 'function' ? await dto() : dto);
      onSaved();
    } catch (e) {
      console.error('Onboarding step save failed', e);
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}
