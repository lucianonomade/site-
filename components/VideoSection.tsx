
import React from 'react';

const VideoSection: React.FC = () => {
  return (
    <section className="bg-secondary py-20 px-6 border-t-[10px] border-primary">
      <div className="container mx-auto max-w-5xl text-center">
        <h3 className="text-2xl text-white font-medium mb-12 opacity-90 tracking-wide uppercase">
          Conheça mais sobre a Agrobiotech
        </h3>
        
        <div className="relative group">
          {/* Decorative Elements */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-300 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Institucional Agrobiotech" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
