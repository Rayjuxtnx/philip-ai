
export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  isCode?: boolean;
  codeLanguage?: string;
  createdAt: string;
};

export type Conversation = {
  id:string;
  title: string;
  messages: Message[];
  createdAt: Date;
};
