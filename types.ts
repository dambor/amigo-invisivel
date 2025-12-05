export interface Participant {
  id: string;
  name: string;
  phone: string; // Should be numbers only
  secretFriendId?: string;
  secretFriendName?: string;
}

export enum AppStep {
  SETUP = 'SETUP',
  DRAWING = 'DRAWING',
  RESULTS = 'RESULTS'
}

export const DEFAULT_TEMPLATE = "Olá *{{NOME}}*!\n\nO sorteio do Amigo Oculto foi realizado!\n\nSeu amigo secreto é: *{{AMIGO}}*\n\nPrepare o presente e boa festa!";