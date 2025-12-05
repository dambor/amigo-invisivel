import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHolidayMessage = async (tone: string): Promise<string> => {
  try {
    const prompt = `
      Crie um modelo de mensagem de WhatsApp curto, criativo e formatado para um sorteio de Amigo Oculto (Amigo Secreto).
      
      O tom da mensagem deve ser: ${tone}.
      
      Regras OBRIGATÓRIAS:
      1. Use a variável {{NOME}} onde deve aparecer o nome da pessoa que recebe a mensagem.
      2. Use a variável {{AMIGO}} onde deve aparecer o nome do amigo sorteado.
      3. Use formatação do WhatsApp como negrito (*texto*).
      4. A mensagem deve ser completa, pronta para envio.
      5. Não inclua explicações extras, apenas o texto da mensagem.
      6. NÃO utilize emojis sob nenhuma hipótese, apenas texto e pontuação.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar mensagem com Gemini:", error);
    throw new Error("Falha ao conectar com a IA.");
  }
};