import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

let supabaseInstance: SupabaseClient;

// Verificação de segurança para evitar crash se as envs não existirem ou forem inválidas
const isValidUrl = (url: string) => url.startsWith('http') && !url.includes('your_supabase_project_url');

if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Erro ao inicializar Supabase:', e);
    // Fallback to mock if initialization fails
    supabaseInstance = null as any;
  }
}

export const isConfigured = !!supabaseInstance;

// Check if instance was created safely
if (!supabaseInstance) {
  console.warn('⚠️ AVISO: Credenciais do Supabase (SUPABASE_URL / SUPABASE_KEY) não encontradas em process.env.');

  // Cria um Proxy que intercepta todas as chamadas e retorna um erro amigável ao tentar executar
  // Isso impede que a tela fique branca (crash) se as variáveis estiverem faltando.
  const mockChain = () => {
    return new Proxy(() => { }, {
      get: (_target, prop) => {
        // Se tentar usar await (.then), retorna o erro
        if (prop === 'then') {
          return (resolve: (val: any) => void) => resolve({
            data: null,
            error: { message: 'Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_KEY não configuradas.' }
          });
        }
        // Para qualquer outro método (.select, .insert, from, etc), continua encadeando
        return () => mockChain();
      },
      apply: () => mockChain()
    });
  };

  supabaseInstance = {
    from: () => mockChain()
  } as unknown as SupabaseClient;
}

export const supabase = supabaseInstance;