export interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 encoded image string
}
