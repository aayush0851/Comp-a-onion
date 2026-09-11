export type ChatMessage = { id: string; author: string; mine: boolean; host?: boolean; text: string };

export const CHAT_SEED: ChatMessage[] = [
  { id: 'm1', author: 'Priya M.', mine: false, host: true, text: 'Three of us so far. I’ll be the one reading a paperback so you can find me.' },
  { id: 'm2', author: 'Sasha V.', mine: false, text: 'Marufuku queue on a Tuesday is genuinely 40 minutes. Iza is a walk-in.' },
  { id: 'm3', author: 'You', mine: true, text: 'Either works — coming from work so 19:30 is tight.' },
  { id: 'm4', author: 'Priya M.', mine: false, host: true, text: 'Same three rules, and let’s stop discussing broth.' },
];
