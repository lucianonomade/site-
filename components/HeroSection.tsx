
import React from 'react';
import RequestForm from './RequestForm';

const HeroSection: React.FC = () => {
  return (
    <section className="relative hero-bg min-h-screen lg:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Maintenance Text */}
          <div className="lg:col-span-7 text-white space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold tracking-tight">Agro<span className="font-light">biotech</span></span>
              <div className="h-6 w-[1px] bg-white/40"></div>
              <span className="text-sm uppercase tracking-[0.2em] font-medium text-white/80">Agronegócio</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                ESTAMOS EM
              </h1>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                <span className="text-primary relative inline-block">
                  MANUTENÇÃO
                  <span className="absolute left-0 bottom-2 w-full h-1 bg-primary"></span>
                </span>
              </h1>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                TEMPORÁRIA
              </h1>
            </div>

            <div className="max-w-xl space-y-6 text-lg text-white/90 font-medium leading-relaxed">
              <p>
                Nosso site está passando por uma atualização programada para melhorar sua experiência.
              </p>
              <p>
                Voltaremos ao ar em breve — agradecemos pela compreensão! Enquanto isso, você pode continuar acompanhando novidades, produtos e informações através dos nossos canais oficiais:
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <SocialIcon icon="fab fa-instagram" href="#" />
              <SocialIcon icon="fab fa-linkedin-in" href="#" />
              <SocialIcon icon="fab fa-youtube" href="#" />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <RequestForm />
          </div>

        </div>
      </div>
    </section>
  );
};

const SocialIcon: React.FC<{ icon: string; href: string }> = ({ icon, href }) => (
  <a 
    href={href}
    className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-white text-xl hover:bg-primary hover:scale-110 transition-all duration-300"
  >
    <i className={icon}></i>
  </a>
);

export default HeroSection;
