import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { Send, Share2, CheckCircle, ArrowRight, List, PlayCircle } from 'lucide-react';

interface ResultListProps {
  group: Group;
  template: string;
  onReset: () => void;
}

export const ResultList: React.FC<ResultListProps> = ({ group, template, onReset }) => {
  const [sendingIndex, setSendingIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'wizard' | 'list'>('wizard');
  const [lastSentIndex, setLastSentIndex] = useState<number>(-1);
  const participants = group.participants;

  const generateBaseUrl = () => {
    return window.location.origin + window.location.pathname;
  };

  const generateRevealLink = (p: Participant) => {
    const params = new URLSearchParams();
    params.set('gid', group.id);
    params.set('uid', p.id);
    params.set('action', 'reveal');
    return `${generateBaseUrl()}?${params.toString()}`;
  };

  const generateGroupLink = (p: Participant) => {
    const params = new URLSearchParams();
    params.set('gid', group.id);
    params.set('uid', p.id);
    params.set('action', 'group');
    return `${generateBaseUrl()}?${params.toString()}`;
  };

  const getWhatsappLink = (p: Participant) => {
    if (!p.secretFriendName) return '#';
    const phone = p.phone.replace(/\D/g, '');
    
    const revealLink = generateRevealLink(p);
    const groupLink = generateGroupLink(p);
    
    let message = template
      .replace(/{{NOME}}/g, p.name)
      .replace(/{{GRUPO}}/g, group.name)
      .replace(/{{LINK_REVELACAO}}/g, revealLink)
      .replace(/{{LINK_GRUPO}}/g, groupLink);

    // Fallback for old templates or simple placeholders
    if (message.includes('{{LINK}}')) {
       message = message.replace(/{{LINK}}/g, groupLink);
       message += `\n\nQuem você tirou: ${revealLink}`;
    } else if (!message.includes(revealLink) && !message.includes(groupLink)) {
       // Safety net if user deleted placeholders
       message += `\n\nQuem você tirou: ${revealLink}\nGrupo: ${groupLink}`;
    }
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleSend = (p: Participant, index: number) => {
    setLastSentIndex(Math.max(lastSentIndex, index));
    window.open(getWhatsappLink(p), '_blank');

    if (index < participants.length - 1) {
      setTimeout(() => {
        setSendingIndex(index + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setSendingIndex(index + 1); 
      }, 1000);
    }
  };

  const renderWizard = () => {
    const isFinished = sendingIndex >= participants.length;
    const currentParticipant = participants[sendingIndex];

    if (isFinished) {
      return (
        <div className="text-center space-y-8 animate-fade-in-up py-4">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tudo Enviado!</h2>
            <p className="text-gray-600 mb-8">
              Todos foram convidados para o grupo <strong>{group.name}</strong>.
            </p>
            <div className="flex flex-col gap-3">
               <button
                onClick={() => setViewMode('list')}
                className="px-6 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Ver Lista de Envios
              </button>
              <button
                onClick={onReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Criar Novo Grupo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg text-center">
           <h2 className="text-2xl font-bold mb-2">🎁 Enviar Convites</h2>
           <p className="text-indigo-100 text-sm">
             Envie os links de acesso para cada participante.
           </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl border border-indigo-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${((sendingIndex) / participants.length) * 100}%` }}
            />
          </div>
          
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold mb-6 mt-2">
            ENVIO {sendingIndex + 1} DE {participants.length}
          </span>

          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-inner">
            {currentParticipant.name.charAt(0).toUpperCase()}
          </div>
          
          <h3 className="text-xl text-gray-500 mb-1">Convidar</h3>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">{currentParticipant.name}</h2>

          <button
            onClick={() => handleSend(currentParticipant, sendingIndex)}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-95"
          >
            <Send className="w-6 h-6" />
            Enviar no WhatsApp
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            A mensagem conterá o link do resultado e o link do grupo.
          </p>
        </div>

        <div className="text-center lg:block hidden">
          <button 
            onClick={() => setViewMode('list')}
            className="text-gray-500 hover:text-indigo-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
          >
            <List className="w-4 h-4" />
            Preferir ver lista completa
          </button>
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="space-y-6">
      <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-2">🎉 Sorteio Realizado!</h2>
        <p className="text-indigo-100">
          Envie os links para os participantes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((p, idx) => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800">{p.name}</p>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                  {idx <= lastSentIndex ? 'Enviado' : 'Aguardando envio'}
                </div>
              </div>
            </div>
            
            <a
              href={getWhatsappLink(p)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setLastSentIndex(Math.max(lastSentIndex, idx))}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm ${
                idx <= lastSentIndex 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              {idx <= lastSentIndex ? 'Reenviar' : 'Enviar'}
            </a>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <button
            onClick={() => {
              setSendingIndex(0);
              setViewMode('wizard');
            }}
            className="mx-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 lg:flex hidden"
          >
            <ArrowRight className="w-5 h-5" />
            Voltar para Modo Automático
          </button>

        <button
          onClick={onReset}
          className="mx-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Criar Novo Grupo
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={viewMode === 'wizard' ? 'block' : 'hidden lg:block'}>
         {viewMode === 'wizard' && renderWizard()}
      </div>
      <div className={viewMode === 'list' ? 'block' : 'hidden'}>
         {viewMode === 'list' && renderList()}
      </div>
      
       {/* Mobile Bottom Tabs for Results */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 px-2 py-2 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setViewMode('wizard')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                viewMode === 'wizard' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <PlayCircle className={`w-6 h-6 ${viewMode === 'wizard' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium mt-1">Passo a Passo</span>
            </button>
            
            <button 
              onClick={() => setViewMode('list')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <List className={`w-6 h-6 ${viewMode === 'list' ? 'stroke-2' : ''}`} />
              <span className="text-xs font-medium mt-1">Lista Geral</span>
            </button>
          </div>
        </div>
    </>
  );
};