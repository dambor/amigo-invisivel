import React, { useState, useEffect } from 'react';
import { Participant, AppStep, DEFAULT_TEMPLATE, Group } from './types';
import { ParticipantForm } from './components/ParticipantForm';
import { MessageConfig } from './components/MessageConfig';
import { ResultList } from './components/ResultList';
import { SocialFeed } from './components/SocialFeed';
import { GroupLogin } from './components/GroupLogin';
import { store } from './store';
import { isConfigured } from './supabaseClient';
import { Shuffle, Users, MessageSquare, PlusCircle, ArrowRight, Gift, Loader2, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Specific state for the "Reveal Mode" (Action = reveal)
  const [isRevealMode, setIsRevealMode] = useState(false);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'participants' | 'config'>('participants');

  // Load Data function
  const loadGroupData = async (gid: string) => {
    setLoading(true);
    try {
      const group = await store.getGroup(gid);
      if (group) {
        setCurrentGroup(group);
      }
      return group;
    } catch (e) {
      console.error(e);
      // Fail silently on load to avoid spamming alerts on navigation
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for login parameters (Group ID and User ID)
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const gid = params.get('gid');
      const uid = params.get('uid');
      const action = params.get('action');

      if (gid) {
        const group = await loadGroupData(gid);

        if (group) {
          // Cenário 1: Link direto com usuário (ex: link de revelação)
          if (uid) {
            const user = group.participants.find(p => p.id === uid);
            if (user) {
              setCurrentUser(user);
              setStep(AppStep.SOCIAL);
              if (action === 'reveal') {
                setIsRevealMode(true);
              }
              return;
            }
          }

          // Cenário 2: O sorteio já foi feito e o usuário caiu aqui sem UID (link do grupo)
          // Manda para tela de Login/Seleção
          if (group.isDrawn) {
            setStep(AppStep.LOGIN);
            return;
          }

          // Cenário 3: O grupo existe mas ainda não foi sorteado (Configuração)
          setStep(AppStep.SETUP);
        }
      }
    };
    init();
  }, []);

  const createGroup = async () => {
    if (!groupNameInput.trim()) return;
    setLoading(true);

    try {
      const newGroup = await store.createGroup(groupNameInput, 'admin');
      if (newGroup) {
        setCurrentGroup(newGroup);
        setStep(AppStep.SETUP);
        const url = new URL(window.location.href);
        url.searchParams.set('gid', newGroup.id);
        window.history.pushState({}, '', url);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Erro ao criar grupo: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (p: Participant) => {
    if (!currentGroup) return;
    setLoading(true);

    const colors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
    const color = colors[currentGroup.participants.length % colors.length];

    try {
      await store.addParticipant(currentGroup.id, {
        name: p.name,
        phone: p.phone,
        avatarColor: color
      });
      await loadGroupData(currentGroup.id);
    } catch (e: any) {
      alert(`Erro ao adicionar participante: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (id: string) => {
    if (!currentGroup) return;
    if (!confirm("Tem certeza que deseja remover este participante?")) return;

    setLoading(true);
    try {
      await store.removeParticipant(id);
      await loadGroupData(currentGroup.id);
    } catch (e: any) {
      alert(`Erro ao remover participante: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const performDraw = async () => {
    if (!currentGroup || currentGroup.participants.length < 3) {
      alert("Adicione pelo menos 3 participantes!");
      return;
    }

    setLoading(true);
    const participants = [...currentGroup.participants];
    const shuffled = [...participants];
    let valid = false;

    let attempt = 0;
    while (!valid && attempt < 1000) {
      attempt++;
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      valid = true;
      for (let i = 0; i < participants.length; i++) {
        if (shuffled[i].id === participants[i].id) {
          valid = false;
          break;
        }
      }
    }

    if (!valid) {
      setLoading(false);
      alert("Não foi possível realizar o sorteio. Tente novamente.");
      return;
    }

    const updatedParticipants = participants.map((p, index) => ({
      ...p,
      secretFriendId: shuffled[index].id,
      secretFriendName: shuffled[index].name
    }));

    try {
      await store.saveDrawResults(currentGroup.id, updatedParticipants);
      await loadGroupData(currentGroup.id);
      setStep(AppStep.RESULTS);
    } catch (e: any) {
      alert(`Erro ao salvar o sorteio: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setCurrentGroup(null);
    setGroupNameInput('');
    setStep(AppStep.LANDING);
    window.history.pushState({}, '', window.location.pathname.split('?')[0]);
  };

  const handleLogin = (user: Participant) => {
    setCurrentUser(user);
    setStep(AppStep.SOCIAL);
  };

  // --- RENDER LOGIN (SELECT USER) ---
  if (step === AppStep.LOGIN && currentGroup) {
    return (
      <GroupLogin
        group={currentGroup}
        onSelectUser={handleLogin}
      />
    );
  }

  // --- RENDER REVEAL SCREEN ---
  if (isRevealMode && currentUser) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden text-center animate-fade-in-up">
          <div className="bg-indigo-900 p-8 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>
            <Gift className="w-16 h-16 text-white mx-auto mb-4 animate-bounce" />
            <h1 className="text-2xl text-indigo-200 font-medium">Olá, {currentUser.name}!</h1>
            <p className="text-white mt-2">Seu amigo invisível é...</p>
          </div>
          <div className="p-10">
            <div className="text-4xl font-extrabold text-indigo-600 tracking-tight transform hover:scale-105 transition-transform duration-300">
              {currentUser.secretFriendName || 'Sorteio Pendente'}
            </div>
            <p className="mt-8 text-gray-500 text-sm">
              Shhh! 🤫 Não conte para ninguém!
            </p>

            <button
              onClick={() => setIsRevealMode(false)}
              className="mt-8 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Entrar no Grupo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER SOCIAL FEED ---
  if (step === AppStep.SOCIAL && currentGroup && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
          <h1 className="font-bold text-indigo-600 flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-600" />
            Amigo Invisível
          </h1>
          <button onClick={resetApp} className="text-xs text-gray-400">Sair</button>
        </header>
        <main className="px-4 py-6">
          <SocialFeed
            group={currentGroup}
            currentUser={currentUser}
            onReload={() => loadGroupData(currentGroup.id)}
          />
        </main>
      </div>
    );
  }

  // --- RENDER LANDING (CREATE GROUP) ---
  if (step === AppStep.LANDING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Amigo Invisível</h1>
          <p className="text-gray-500 mb-8">Crie um grupo, convide seus amigos e compartilhem seus desejos de presente!</p>

          {!isConfigured && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Cofiguração Pendente</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>Para criar grupos, configure suas credenciais do Supabase no arquivo <code>.env.local</code>.</p>
                    <p className="mt-1 text-xs opacity-80">Edite as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY com os dados do seu projeto.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-left mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo</label>
            <input
              type="text"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              placeholder="Ex: Natal da Família"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            onClick={createGroup}
            disabled={!groupNameInput.trim() || loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
            Criar Grupo
          </button>
        </div>
        <p className="text-indigo-200 text-xs mt-8 opacity-60">Modo Offline (LocalStorage)</p>
      </div>
    );
  }

  // --- RENDER SETUP & DRAW (ADMIN) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24 lg:pb-0">
      <header className="bg-white shadow-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Amigo Invisível</h1>
              <p className="text-xs text-gray-500">{currentGroup?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hidden md:block">
              {step === AppStep.SETUP ? 'Configuração' : 'Enviar Convites'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === AppStep.SETUP ? (
          <>
            <div className="text-center max-w-2xl mx-auto mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Configurar Grupo</h2>
              <p className="text-gray-600">
                Adicione os participantes ao grupo <strong>{currentGroup?.name}</strong> e realize o sorteio.
              </p>
            </div>

            <div className="lg:hidden mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'participants' ? 'Participantes' : 'Mensagem & Sorteio'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`space-y-8 ${activeTab === 'participants' ? 'block' : 'hidden lg:block'}`}>
                <ParticipantForm
                  participants={currentGroup?.participants || []}
                  onAdd={addParticipant}
                  onRemove={removeParticipant}
                />
                {loading && (
                  <div className="text-center text-indigo-600 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Atualizando...
                  </div>
                )}
              </div>

              <div className={`space-y-8 ${activeTab === 'config' ? 'block' : 'hidden lg:block'}`}>
                <MessageConfig
                  template={template}
                  setTemplate={setTemplate}
                />

                <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-xl overflow-hidden relative">
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-2">Realizar Sorteio</h3>
                    <p className="text-indigo-200 mb-6 text-sm">
                      Isso sorteará os amigos secretos e permitirá enviar os links de acesso ao grupo.
                    </p>
                    <button
                      onClick={performDraw}
                      disabled={(currentGroup?.participants?.length || 0) < 3 || loading}
                      className="w-full py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shuffle className="w-5 h-5" />}
                      Sortear e Gerar Links
                    </button>
                    {(currentGroup?.participants?.length || 0) < 3 && (
                      <p className="text-xs text-center mt-2 text-indigo-300">
                        Mínimo de 3 participantes
                      </p>
                    )}
                  </div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-800 rounded-full opacity-50" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-700 rounded-full opacity-50" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <ResultList
            group={currentGroup!}
            template={template}
            onReset={resetApp}
          />
        )}
      </main>

      {step === AppStep.SETUP && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 px-2 py-2 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'participants'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
              <div className="relative">
                <Users className={`w-6 h-6 ${activeTab === 'participants' ? 'fill-current' : ''}`} />
                {(currentGroup?.participants?.length || 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {currentGroup?.participants.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium mt-1">Participantes</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'config'
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
    </div>
  );
};

export default App;