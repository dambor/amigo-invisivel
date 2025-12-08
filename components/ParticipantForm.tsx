import React, { useState } from 'react';
import { Participant } from '../types';
import { Plus, Trash2, User, Phone, Users } from 'lucide-react';

interface ParticipantFormProps {
  participants: Participant[];
  onAdd: (participant: Participant) => void;
  onRemove: (id: string) => void;
}

export const ParticipantForm: React.FC<ParticipantFormProps> = ({ participants, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [ddi, setDdi] = useState('+55');
  const [phoneSuffix, setPhoneSuffix] = useState('34');

  const handleDdiChange = (newDdi: string) => {
    setDdi(newDdi);
    // Se mudou para Brasil e o campo está vazio, sugere 34
    if (newDdi === '+55' && !phoneSuffix) {
      setPhoneSuffix('34');
    }
    // Se mudou para fora do Brasil e o campo era apenas o 34 padrão, limpa
    if (newDdi !== '+55' && phoneSuffix === '34') {
      setPhoneSuffix('');
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneSuffix.trim()) return;

    // Combina DDI e o número digitado
    const fullPhone = `${ddi}${phoneSuffix}`;
    // Remove não-dígitos para salvar limpo
    const cleanPhone = fullPhone.replace(/\D/g, '');

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: cleanPhone,
    };

    onAdd(newParticipant);
    setName('');
    // Reseta para os padrões solicitados
    setDdi('+55');
    setPhoneSuffix('34');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          Adicionar Participante
        </h2>
        {/* Adjusted layout: flex-col on mobile, flex-row on tablet, flex-col on desktop */}
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row lg:flex-col gap-4">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Silva"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white shadow-sm">
              <select
                value={ddi}
                onChange={(e) => handleDdiChange(e.target.value)}
                className="bg-gray-50 px-2 py-2 border-r border-gray-300 text-gray-700 font-medium outline-none cursor-pointer hover:bg-gray-100 min-w-[90px] text-sm"
              >
                <option value="+55">🇧🇷 +55</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+351">🇵🇹 +351</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+54">🇦🇷 +54</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+39">🇮🇹 +39</option>
                <option value="+81">🇯🇵 +81</option>
              </select>
              <input
                id="phone"
                type="tel"
                value={phoneSuffix}
                onChange={(e) => setPhoneSuffix(e.target.value)}
                placeholder="DDD + Número"
                className="flex-1 px-4 py-2 outline-none bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Insira o número com DDD (ex: 34999998888)</p>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!name.trim() || !phoneSuffix.trim()}
              className="w-full md:w-auto lg:w-full px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 h-[42px]"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Lista de Participantes ({participants.length})
        </h2>
        
        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Nenhum participante adicionado ainda.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {participants.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between group hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-3 h-3" />
                      {p.phone}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(p.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};