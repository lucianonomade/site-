
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-8 px-6">
      <div className="container mx-auto text-center space-y-2">
        <p className="text-sm sm:text-base font-medium opacity-90">
          Copyright 2025 © Agrobiotech Agronegócio Ltda | 55.480.099/0001-68
        </p>
        <a 
          href="mailto:contato@agrobiotech.com.br" 
          className="text-sm sm:text-base font-bold hover:underline underline-offset-4 transition-all"
        >
          contato@agrobiotech.com.br
        </a>
      </div>
    </footer>
  );
};

export default Footer;
