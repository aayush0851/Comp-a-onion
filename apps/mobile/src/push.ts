import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deviceTokensApi } from './api';

const DEVICE_TOKEN_ID_KEY = 'companion:deviceTokenId';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Expo push tokens need an EAS project id (from `eas init`) to be issued.
// Without one, registration is skipped rather than crashing the login flow.
async function getExpoPushToken(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;

    const pushToken = await getExpoPushToken();
    if (!pushToken) return;

    const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    const { id } = await deviceTokensApi.registerDeviceToken(platform, pushToken);
    await AsyncStorage.setItem(DEVICE_TOKEN_ID_KEY, id);
  } catch {
    // best-effort — a failed push registration shouldn't block using the app
  }
}

export async function unregisterPushNotifications(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(DEVICE_TOKEN_ID_KEY);
    if (!id) return;
    await AsyncStorage.removeItem(DEVICE_TOKEN_ID_KEY);
    await deviceTokensApi.unregisterDeviceToken(id);
  } catch {
    // best-effort
  }
}
