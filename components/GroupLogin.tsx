import React, { useState } from 'react';
import { Group, Participant } from '../types';
import { Users, ArrowRight, Gift, Search } from 'lucide-react';

interface GroupLoginProps {
  group: Group;
  onSelectUser: (user: Participant) => void;
}

export const GroupLogin: React.FC<GroupLoginProps> = ({ group, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = group.participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-indigo-600 p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>
          <Gift className="w-12 h-12 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1">{group.name}</h1>
          <p className="text-indigo-200 text-sm">Quem é você?</p>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar seu nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredParticipants.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhum participante encontrado.</p>
            ) : (
              filteredParticipants.map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => onSelectUser(participant)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-indigo-700 ${participant.avatarColor || 'bg-indigo-100'}`}>
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-indigo-700">
                      {participant.name}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
                </button>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">Selecione seu nome para entrar no grupo</p>
        </div>
      </div>
    </div>
  );
};