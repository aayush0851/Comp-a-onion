import { useCallback } from 'react';
import { usersApi } from '../../api';
import { useAppDispatch } from '../index';

// Call this whenever the app learns a new position for the user. The server reads the profile
// location when the board loads and when its stream opens, so the board has to reload and
// reconnect for the new location to take effect.
export function useUpdateLocation() {
  const dispatch = useAppDispatch();
  return useCallback(async (latitude: number, longitude: number) => {
    await usersApi.updateMe({ latitude, longitude });
    dispatch({ type: 'REFRESH_BOARD' });
  }, [dispatch]);
}
