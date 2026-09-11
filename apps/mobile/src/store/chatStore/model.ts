import { CHAT_SEED, ChatMessage } from '../../data';
import type { Action } from '../actions';
import type { AppState } from '../index';
import type { ChatState } from './schema';

export const chatInitialState: ChatState = {
  msgs: CHAT_SEED,
  requesterMsgs: {},
};

export function chatReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SEND_MSG': {
      const text = action.text.trim();
      if (!text) return state;
      const msg: ChatMessage = { id: `m${state.msgs.length + 1}`, author: 'You', mine: true, text };
      return { ...state, msgs: [...state.msgs, msg] };
    }
    case 'SEND_REQUESTER_MSG': {
      const text = action.text.trim();
      if (!text) return state;
      const existing = state.requesterMsgs[action.requesterId] ?? [];
      const msg: ChatMessage = { id: `rm${existing.length + 1}`, author: 'You', mine: true, text };
      return { ...state, requesterMsgs: { ...state.requesterMsgs, [action.requesterId]: [...existing, msg] } };
    }
    case 'LOG_OUT':
      return { ...state, ...chatInitialState };
    default:
      return state;
  }
}
