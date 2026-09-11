import type { Action } from '../actions';
import type { AppState } from '../index';
import type { OnboardingState } from './schema';

export const onboardingInitialState: OnboardingState = {
  phone: '',
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
    case 'SET_PHONE':
      return { ...state, phone: action.phone };
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
