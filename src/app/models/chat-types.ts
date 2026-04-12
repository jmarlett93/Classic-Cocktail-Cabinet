import { Liqour } from './recipe-book';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  recommendations?: Liqour[];
  reasoning?: string;
  confidence?: number;
}
