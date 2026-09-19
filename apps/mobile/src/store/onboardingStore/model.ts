import type { Action } from '../actions';
import type { AppState } from '../index';
import type { ApiUser } from '../../api/types';
import { GENDER_OPTIONS } from '../../data/constants';
import type { HighlightMedia, OnboardingState } from './schema';

const SELF_DESCRIBE = 'Self-describe';
const VIDEO_URL = /\.(mp4|mov|m4v|webm)(\?|$)/i;

// Fills the onboarding screens back in from what the server already has, keeping local values where it has none.
function profileFromUser(state: OnboardingState, user: ApiUser): Partial<OnboardingState> {
  const [year, month, day] = user.dob ? user.dob.slice(0, 10).split('-') : [];
  const known = !!user.gender && (GENDER_OPTIONS as readonly string[]).includes(user.gender);
  return {
    name: user.name || state.name,
    dob: year ? { day, month, year } : state.dob,
    gender: user.gender ? (known ? user.gender : SELF_DESCRIBE) : state.gender,
    genderCustom: user.gender && !known ? user.gender : state.genderCustom,
    genderVisible: user.genderVisible,
    vibeTags: user.vibeTags.length ? user.vibeTags : state.vibeTags,
    profilePhoto: user.profilePicture || state.profilePhoto,
    highlights: user.highlights.length
      ? user.highlights.map((uri): HighlightMedia => ({ uri, type: VIDEO_URL.test(decodeURIComponent(uri)) ? 'video' : 'image' }))
      : state.highlights,
  };
}

export const onboardingInitialState: OnboardingState = {
  email: '',
  authProvider: null,
  name: '',
  dob: { day: '', month: '', year: '' },
  gender: null,
  genderCustom: '',
  genderVisible: true,
  vibeTags: [],
  selfieStatus: 'none',
  profilePhoto: null,
  highlights: [],
};

export function onboardingReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE_AUTH':
      return { ...state, email: action.email, name: action.name, authProvider: action.authProvider };
    case 'SET_OAUTH_IDENTITY':
      return {
        ...state,
        email: action.email,
        authProvider: action.provider,
        name: state.name || action.name,
      };
    case 'HYDRATE_PROFILE':
      return { ...state, ...profileFromUser(state, action.user) };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_DOB':
      return { ...state, dob: { ...state.dob, [action.field]: action.value } };
    case 'SET_GENDER':
      return { ...state, gender: action.gender };
    case 'SET_GENDER_CUSTOM':
      return { ...state, genderCustom: action.value };
    case 'TOGGLE_GENDER_VISIBLE':
      return { ...state, genderVisible: !state.genderVisible };
    case 'SET_SELFIE_QUEUED':
      return { ...state, selfieStatus: 'queued' };
    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhoto: action.uri };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.media].slice(0, 6) };
    case 'REMOVE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter((_, i) => i !== action.index) };
    case 'TOGGLE_VIBE_TAG': {
      const has = state.vibeTags.includes(action.tag);
      let tags = has ? state.vibeTags.filter((t) => t !== action.tag) : [...state.vibeTags, action.tag];
      if (tags.length > 3) tags = tags.slice(tags.length - 3);
      return { ...state, vibeTags: tags };
    }
    case 'LOG_OUT':
      return { ...state, ...onboardingInitialState };
    default:
      return state;
  }
}
