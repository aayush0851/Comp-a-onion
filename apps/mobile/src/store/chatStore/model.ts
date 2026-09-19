import type { Action } from '../actions';
import type { AppState } from '../index';
import type { ChatState } from './schema';

export const chatInitialState: ChatState = {
  chatUnread: {},
};

export function chatReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CHAT_UNREAD':
      return { ...state, chatUnread: action.counts };
    case 'BUMP_CHAT_UNREAD':
      return { ...state, chatUnread: { ...state.chatUnread, [action.key]: (state.chatUnread[action.key] ?? 0) + 1 } };
    case 'CLEAR_CHAT_UNREAD': {
      if (!(action.key in state.chatUnread)) return state;
      const { [action.key]: _, ...rest } = state.chatUnread;
      return { ...state, chatUnread: rest };
    }
    case 'LOG_OUT':
      return { ...state, ...chatInitialState };
    default:
      return state;
  }
}
