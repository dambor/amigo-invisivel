import React, { useState } from 'react';
import { MessageSquare, Wand2, RefreshCw } from 'lucide-react';
import { generateHolidayMessage } from '../services/geminiService';

interface MessageConfigProps {
  template: string;
  setTemplate: (template: string) => void;
}

export const MessageConfig: React.FC<MessageConfigProps> = ({ template, setTemplate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (tone: string) => {
    setIsGenerating(true);
    try {
      const newMessage = await generateHolidayMessage(tone);
      setTemplate(newMessage);
    } catch (error) {
      alert("Erro ao gerar mensagem. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Modelo da Mensagem
        </h2>
      </div>
      
      <p className="text-sm text-gray-600">
        Personalize a mensagem que será enviada no WhatsApp. Use <strong>{'{{NOME}}'}</strong> para o nome do participante e <strong>{'{{AMIGO}}'}</strong> para o amigo sorteado.
      </p>

      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none bg-white text-gray-900 placeholder-gray-400"
      />

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 mr-2 flex items-center gap-1">
          <Wand2 className="w-4 h-4" />
          IA Criativa:
        </span>
        {[
          { label: 'Divertido', value: 'Engraçado e descontraído' },
          { label: 'Natalino', value: 'Espírito de Natal caloroso' },
          { label: 'Misterioso', value: 'Misterioso e instigante' },
          { label: 'Formal', value: 'Direto e educado' }
        ].map((tone) => (
          <button
            key={tone.label}
            onClick={() => handleGenerate(tone.value)}
            disabled={isGenerating}
            className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : tone.label}
          </button>
        ))}
      </div>
    </div>
  );
};