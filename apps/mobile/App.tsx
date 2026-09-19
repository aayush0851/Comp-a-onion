import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  PlusJakartaSans_400Regular, PlusJakartaSans_400Regular_Italic, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { JetBrainsMono_400Regular, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation';
import { AppProvider, useAppState } from './src/store';
import { colors } from './src/theme';
import { LoadingScreen } from './src/components/widgets';
import Signup from './src/screens/Signup';
import Auth from './src/screens/Auth';
import Name from './src/screens/Name';
import Birthday from './src/screens/Birthday';
import Gender from './src/screens/Gender';
import Vibe from './src/screens/Vibe';
import ProfilePhoto from './src/screens/ProfilePhoto';
import Highlights from './src/screens/Highlights';
import Verify from './src/screens/Verify';
import SelfieCheck from './src/screens/SelfieCheck';
import Lock from './src/screens/Lock';
import Board from './src/screens/Board';
import Detail from './src/screens/Detail';
import MyPlans from './src/screens/MyPlans';
import PlanManage from './src/screens/PlanManage';
import RequesterChat from './src/screens/RequesterChat';
import RequesterProfile from './src/screens/RequesterProfile';
import MyReviews from './src/screens/MyReviews';
import SentRequests from './src/screens/SentRequests';
import Create from './src/screens/Create';
import ChatList from './src/screens/ChatList';
import Chat from './src/screens/Chat';
import Profile from './src/screens/Profile';
import EditProfile from './src/screens/EditProfile';
import Settings from './src/screens/Settings';
import Safety from './src/screens/Safety';
import Review from './src/screens/Review';
import Filed from './src/screens/Filed';
import SearchFilters from './src/screens/SearchFilters';
import Notifications from './src/screens/Notifications';
import ReviewDetail from './src/screens/ReviewDetail';
import ReportReview from './src/screens/ReportReview';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const state = useAppState();

  if (!state.authReady) return <LoadingScreen />;

  const initialRouteName = !state.isAuthenticated ? 'Signup' : state.onboarded ? 'Board' : state.onboardingRoute;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false, animation: 'fade' }}
        // Edge-to-edge Android no longer resizes the window for the keyboard, so every screen
        // pads itself up by the keyboard height — keeps footers/composers above it on both platforms.
        screenLayout={({ children }) => <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">{children}</KeyboardAvoidingView>}
      >
        {!state.isAuthenticated ? (
          <>
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Auth" component={Auth} />
          </>
        ) : (
          <>
            <Stack.Screen name="Name" component={Name} />
            <Stack.Screen name="Birthday" component={Birthday} />
            <Stack.Screen name="Gender" component={Gender} />
            <Stack.Screen name="Vibe" component={Vibe} />
            <Stack.Screen name="ProfilePhoto" component={ProfilePhoto} />
            <Stack.Screen name="Highlights" component={Highlights} />
            <Stack.Screen name="Verify" component={Verify} />
            <Stack.Screen name="SelfieCheck" component={SelfieCheck} />
            <Stack.Screen name="Lock" component={Lock} />
            <Stack.Screen name="Board" component={Board} />
            <Stack.Screen name="Detail" component={Detail} />
            <Stack.Screen name="MyPlans" component={MyPlans} />
            <Stack.Screen name="PlanManage" component={PlanManage} />
            <Stack.Screen name="RequesterChat" component={RequesterChat} />
            <Stack.Screen name="RequesterProfile" component={RequesterProfile} />
            <Stack.Screen name="MyReviews" component={MyReviews} />
            <Stack.Screen name="SentRequests" component={SentRequests} />
            <Stack.Screen name="Create" component={Create} />
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Safety" component={Safety} />
            <Stack.Screen name="Review" component={Review} />
            <Stack.Screen name="Filed" component={Filed} />
            <Stack.Screen name="SearchFilters" component={SearchFilters} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="ReviewDetail" component={ReviewDetail} />
            <Stack.Screen name="ReportReview" component={ReportReview} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_400Regular_Italic, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    JetBrainsMono_400Regular, JetBrainsMono_600SemiBold,
    ...FontAwesome.font,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.white }} />;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
