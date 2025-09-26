
export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  isCode?: boolean;
  codeLanguage?: string;
};

export type Conversation = {
  id:string;
  title: string;
  messages: Message[];
};
