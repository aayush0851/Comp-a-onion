export type HighlightMedia = { uri: string; type: 'image' | 'video' };

export type OnboardingState = {
  phone: string;
  name: string;
  dob: { day: string; month: string; year: string };
  gender: string | null;
  genderCustom: string;
  genderVisible: boolean;
  vibeTags: string[];
  selfieStatus: 'none' | 'queued';
  profilePhoto: string | null;
  highlights: HighlightMedia[];
};

export type OnboardingAction =
  | { type: 'SET_PHONE'; phone: string }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_DOB'; field: 'day' | 'month' | 'year'; value: string }
  | { type: 'SET_GENDER'; gender: string }
  | { type: 'SET_GENDER_CUSTOM'; value: string }
  | { type: 'TOGGLE_GENDER_VISIBLE' }
  | { type: 'TOGGLE_VIBE_TAG'; tag: string }
  | { type: 'SET_SELFIE_QUEUED' }
  | { type: 'SET_PROFILE_PHOTO'; uri: string }
  | { type: 'ADD_HIGHLIGHT'; media: HighlightMedia }
  | { type: 'REMOVE_HIGHLIGHT'; index: number };
