export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  likes: string[]; // Array of user IDs who liked
  comments: Comment[];
  timestamp: number;
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  secretFriendId?: string;
  secretFriendName?: string;
  avatarColor?: string; // To generate consistent avatars
}

export interface Group {
  id: string;
  name: string;
  adminId: string; // ID of the creator (usually the first user or a system id)
  participants: Participant[];
  posts: Post[];
  isDrawn: boolean;
  createdAt: number;
}

export enum AppStep {
  LANDING = 'LANDING',
  SETUP = 'SETUP',
  RESULTS = 'RESULTS',
  SOCIAL = 'SOCIAL', // The social feed view
  LOGIN = 'LOGIN' // New step for selecting user when entering via group link
}

export const DEFAULT_TEMPLATE = "Olá *{{NOME}}*!\n\nO Sorteio do Amigo Invisível do grupo *{{GRUPO}}* foi realizado!\n\n🤫 *VEJA QUEM VOCÊ TIROU:* \n{{LINK_REVELACAO}}\n\n🎁 *PARTICIPE DO GRUPO:* \n{{LINK_GRUPO}}";