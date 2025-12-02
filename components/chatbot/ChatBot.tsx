import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Clock, FileText, Scale, MessageSquare, ArrowRight, Bot, User, Loader2, Menu, X, UserCheck } from 'lucide-react';
import { chatWithConsumerAssistant } from '../../services/geminiService';

interface ChatBotProps {
  onNavigateToForm: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onNavigateToForm }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy el asistente virtual de Defensa del Consumidor de Catamarca. \n\nPuedo orientarte sobre **requisitos**, **horarios** y tus derechos según la **Ley 24.240** (Garantías, devoluciones, bajas). \n\nRecuerda que soy una guía informativa. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithConsumerAssistant(textToSend, history);
    
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 min-h-[1em] last:mb-0">
        {line.split('**').map((part, j) => 
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </p>
    ));
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 bg-institutional text-white flex justify-between items-start shrink-0">
          <div>
            <h1 className="text-xl font-bold leading-tight">Defensa del Consumidor</h1>
            <p className="text-institutional-light text-sm">Catamarca</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-blue-900 mb-2">¿Listo para denunciar?</h3>
            <p className="text-xs text-blue-700 mb-3">Si ya tienes la documentación lista, puedes iniciar el trámite formal.</p>
            <button 
              onClick={onNavigateToForm}
              className="w-full bg-institutional hover:bg-institutional-dark text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Iniciar Reclamo Formal <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
              <Clock className="w-5 h-5 text-institutional mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase">Horarios</p>
                <p className="text-sm text-gray-600">Lunes a Viernes</p>
                <p className="text-sm font-bold text-gray-800">07:30 - 12:30 hs</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-institutional mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase">Ubicación</p>
                <p className="text-sm text-gray-600">CAPE - Pabellón 27</p>
                <p className="text-xs text-gray-500">Av. Venezuela S/N</p>
              </div>
            </div>

            {/* DIRECTOR CARD */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-institutional mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase">Director Provincial</p>
                <p className="text-sm font-bold text-gray-800">Dr. Sergio Paredes Correa</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 pb-20 md:pb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Consultas Rápidas</p>
            <div className="space-y-2">
              <button onClick={() => handleQuickQuestion("¿Cuáles son los requisitos para denunciar?")} className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2 transition-colors">
                <FileText className="w-4 h-4 text-gray-400" /> Requisitos para denunciar
              </button>
              <button onClick={() => handleQuickQuestion("¿Qué dice la Ley 24.240 sobre garantías?")} className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2 transition-colors">
                <Scale className="w-4 h-4 text-gray-400" /> Garantía legal (Ley 24.240)
              </button>
              <button onClick={() => handleQuickQuestion("Quiero dar de baja un servicio")} className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2 transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-400" /> Bajas de servicios
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative bg-white min-w-0">
        
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-30 shrink-0">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
             >
               <Menu className="w-6 h-6" />
             </button>

             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-institutional rounded-full flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 leading-tight">Asistente Virtual</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> En línea
                  </p>
                </div>
             </div>
           </div>
           
           <button onClick={onNavigateToForm} className="md:hidden text-xs bg-institutional hover:bg-institutional-dark text-white px-3 py-1.5 rounded-full font-medium transition-colors shadow-sm">
             Denunciar
           </button>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-white"
          ref={chatContainerRef}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm
                  ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-institutional'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                  {renderText(msg.text)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex w-full justify-start animate-in fade-in duration-300">
              <div className="flex max-w-[80%] gap-3">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1 text-institutional shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Escribiendo</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu consulta aquí..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-institutional focus:border-transparent outline-none resize-none h-[52px] max-h-32 shadow-sm text-sm transition-all"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 p-2 bg-institutional hover:bg-institutional-dark text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2 select-none">
            La IA puede cometer errores. Por favor verifique la información importante.
          </p>
        </div>
      </main>
    </div>
  );
};