import React, { useState, useEffect } from 'react';
import { Participant, AppStep, DEFAULT_TEMPLATE } from './types';
import { ParticipantForm } from './components/ParticipantForm';
import { MessageConfig } from './components/MessageConfig';
import { ResultList } from './components/ResultList';
import { Gift, Shuffle, Users, MessageSquare, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'participants' | 'config'>('participants');
  
  // State for Reveal Mode
  const [revealData, setRevealData] = useState<{n: string, t: string} | null>(null);

  useEffect(() => {
    // Check for reveal parameter in URL
    const params = new URLSearchParams(window.location.search);
    const revealParam = params.get('reveal');

    if (revealParam) {
      try {
        // Decode base64 utf-8
        const json = decodeURIComponent(escape(atob(revealParam)));
        const data = JSON.parse(json);
        if (data.n && data.t) {
          setRevealData(data);
        }
      } catch (e) {
        console.error("Invalid reveal link", e);
      }
    }
  }, []);

  const addParticipant = (p: Participant) => {
    setParticipants([...participants, p]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const performDraw = () => {
    if (participants.length < 3) {
      alert("Adicione pelo menos 3 participantes!");
      return;
    }

    const shuffled = [...participants];
    let valid = false;
    
    // Simple derangement shuffle
    let attempt = 0;
    while (!valid && attempt < 1000) {
      attempt++;
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Check if valid derangement (no one has themselves)
      valid = true;
      for (let i = 0; i < participants.length; i++) {
        if (shuffled[i].id === participants[i].id) {
          valid = false;
          break;
        }
      }
    }

    if (!valid) {
      alert("Não foi possível realizar o sorteio. Tente novamente.");
      return;
    }

    // Assign secret friends
    const updatedParticipants = participants.map((p, index) => ({
      ...p,
      secretFriendId: shuffled[index].id,
      secretFriendName: shuffled[index].name
    }));

    setParticipants(updatedParticipants);
    setStep(AppStep.RESULTS);
  };

  const resetApp = () => {
    setParticipants([]); 
    setStep(AppStep.SETUP);
    setActiveTab('participants');
  };

  // --- RENDER REVEAL SCREEN ---
  if (revealData) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden text-center animate-fade-in-up">
          <div className="bg-indigo-900 p-8 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>
            <Gift className="w-16 h-16 text-white mx-auto mb-4 animate-bounce" />
            <h1 className="text-2xl text-indigo-200 font-medium">Olá, {revealData.n}!</h1>
            <p className="text-white mt-2">Seu amigo invisível é...</p>
          </div>
          <div className="p-10">
            <div className="text-4xl font-extrabold text-indigo-600 tracking-tight transform hover:scale-105 transition-transform duration-300">
              {revealData.t}
            </div>
            <p className="mt-8 text-gray-500 text-sm">
              Shhh! 🤫 Não conte para ninguém!
            </p>
            <button 
              onClick={() => window.location.href = window.location.pathname}
              className="mt-6 text-indigo-600 font-medium hover:underline text-sm"
            >
              Criar meu próprio sorteio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24 lg:pb-0">
      <header className="bg-white shadow-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Amigo Invisível</h1>
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hidden md:block">
            {step === AppStep.SETUP ? 'Configuração' : 'Resultados'}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === AppStep.SETUP ? (
          <>
            <div className="text-center max-w-2xl mx-auto mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Organize seu sorteio em minutos</h2>
              <p className="text-gray-600">
                Adicione os participantes, personalize a mensagem com IA e envie os resultados pelo WhatsApp sem que ninguém descubra quem tirou quem!
              </p>
            </div>
            
            {/* Mobile Header Title change based on Tab */}
            <div className="lg:hidden mb-6">
               <h2 className="text-2xl font-bold text-gray-900">
                 {activeTab === 'participants' ? 'Participantes' : 'Mensagem & Sorteio'}
               </h2>
               <p className="text-sm text-gray-500 mt-1">
                 {activeTab === 'participants' 
                   ? 'Adicione quem vai participar da brincadeira.' 
                   : 'Configure a mensagem e realize o sorteio.'}
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`space-y-8 ${activeTab === 'participants' ? 'block' : 'hidden lg:block'}`}>
                <ParticipantForm 
                  participants={participants}
                  onAdd={addParticipant}
                  onRemove={removeParticipant}
                />
              </div>
              
              <div className={`space-y-8 ${activeTab === 'config' ? 'block' : 'hidden lg:block'}`}>
                <MessageConfig 
                  template={template} 
                  setTemplate={setTemplate} 
                />
                
                <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-xl overflow-hidden relative">
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-2">Pronto para sortear?</h3>
                    <p className="text-indigo-200 mb-6 text-sm">
                      Certifique-se de que todos os participantes foram adicionados. O sorteio é irreversível!
                    </p>
                    <button
                      onClick={performDraw}
                      disabled={participants.length < 3}
                      className="w-full py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Shuffle className="w-5 h-5" />
                      Realizar Sorteio
                    </button>
                    {participants.length < 3 && (
                      <p className="text-xs text-center mt-2 text-indigo-300">
                        Mínimo de 3 participantes
                      </p>
                    )}
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-800 rounded-full opacity-50" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-700 rounded-full opacity-50" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <ResultList 
            participants={participants} 
            template={template} 
            onReset={resetApp} 
          />
        )}
      </main>

      {/* Mobile Bottom Tabs for Setup */}
      {step === AppStep.SETUP && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 px-2 py-2 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setActiveTab('participants')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === 'participants' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Users className={`w-6 h-6 ${activeTab === 'participants' ? 'fill-current' : ''}`} />
                {participants.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {participants.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium mt-1">Participantes</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('config')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === 'config' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className={`w-6 h-6 ${activeTab === 'config' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium mt-1">Sorteio</span>
            </button>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-gray-400 text-sm hidden lg:block">
        <p>Desenvolvido com IA & React</p>
      </footer>
    </div>
  );
};

export default App;