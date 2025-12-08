import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateHolidayMessage = async (tone: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key não configurada. Usando template padrão.");
    return `Olá *{{NOME}}*! (Mensagem gerada localmente pois a IA não está configurada).\n\nO Sorteio do Amigo Invisível do grupo *{{GRUPO}}* foi realizado!\n\n🤫 *VEJA QUEM VOCÊ TIROU:* \n{{LINK_REVELACAO}}\n\n🎁 *PARTICIPE DO GRUPO:* \n{{LINK_GRUPO}}`;
  }

  try {
    const prompt = `
      Crie um modelo de mensagem de WhatsApp curto, convidativo e formatado para um grupo de Amigo Invisível.
      
      O objetivo da mensagem é fornecer DOIS links para o participante:
      1. Um link para ele descobrir quem tirou (revelação).
      2. Um link para entrar no grupo social e postar o que quer ganhar.
      
      O tom da mensagem deve ser: ${tone}.
      
      Regras OBRIGATÓRIAS:
      1. Use a variável {{NOME}} para o nome da pessoa.
      2. Use a variável {{GRUPO}} para o nome do grupo.
      3. Use {{LINK_REVELACAO}} para o link onde ela descobre o amigo secreto.
      4. Use {{LINK_GRUPO}} para o link da página do grupo/lista de desejos.
      5. NÃO utilize emojis.
      6. Formatação de WhatsApp (*negrito*) permitida.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar mensagem com Gemini:", error);
    // Silent fallback
    return `Olá *{{NOME}}*!\n\nO Sorteio do Amigo Invisível do grupo *{{GRUPO}}* foi realizado!\n\n🤫 *VEJA QUEM VOCÊ TIROU:* \n{{LINK_REVELACAO}}\n\n🎁 *PARTICIPE DO GRUPO:* \n{{LINK_GRUPO}}`;
  }
};