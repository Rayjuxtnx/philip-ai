import { FieldValue } from 'firebase/firestore';

export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  isCode?: boolean;
  codeLanguage?: string;
  filename?: string;
  createdAt: FieldValue | Date;
};

export type Conversation = {
  id:string;
  title: string;
  createdAt: FieldValue | Date;
};
