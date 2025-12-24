
import React, { useState } from 'react';

const RequestForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="w-full max-w-md form-overlay rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/10 min-h-[500px] flex flex-col justify-center transition-all duration-500">
      {!isSubmitted ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-white text-lg font-bold uppercase tracking-wider mb-8 flex items-center gap-4">
            <span className="w-1.5 h-8 bg-primary block rounded-full"></span>
            Preencha o formulário abaixo para solicitações:
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome completo" 
              required
              className="w-full h-14 bg-white/95 rounded-xl px-5 border-none focus:ring-2 focus:ring-primary text-gray-800 placeholder-gray-500 transition-all"
            />
            <input 
              type="tel" 
              placeholder="Telefone" 
              required
              className="w-full h-14 bg-white/95 rounded-xl px-5 border-none focus:ring-2 focus:ring-primary text-gray-800 placeholder-gray-500 transition-all"
            />
            <input 
              type="email" 
              placeholder="E-mail" 
              required
              className="w-full h-14 bg-white/95 rounded-xl px-5 border-none focus:ring-2 focus:ring-primary text-gray-800 placeholder-gray-500 transition-all"
            />
            <textarea 
              placeholder="Mensagem" 
              rows={4}
              required
              className="w-full bg-white/95 rounded-xl px-5 py-4 border-none focus:ring-2 focus:ring-primary text-gray-800 placeholder-gray-500 transition-all resize-none"
            ></textarea>

            <button 
              type="submit"
              className="w-full h-14 bg-primary hover:bg-green-600 text-white font-bold rounded-xl uppercase tracking-widest text-lg shadow-lg shadow-green-900/40 transition-all hover:-translate-y-1 active:scale-95"
            >
              Enviar
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center space-y-6 animate-in zoom-in-95 fade-in duration-500">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary animate-bounce">
            <i className="fas fa-check text-4xl text-primary"></i>
          </div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Obrigado!</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Sua solicitação foi enviada com sucesso. Nossa equipe entrará em contato em breve.
          </p>
          <button 
            onClick={handleReset}
            className="text-primary font-bold uppercase tracking-widest text-sm hover:text-white transition-colors"
          >
            Enviar outra mensagem
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
