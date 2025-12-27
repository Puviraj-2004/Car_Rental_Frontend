import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-800 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
             alt="Driving in Europe" 
             className="w-full h-full object-cover"
           />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Drive the Extraordinary.
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
            Experience the freedom of Europe's open roads with our premium fleet. 
            From the Autobahn to the Amalfi Coast.
          </p>
        </div>
      </div>

      {/* --- OUR MISSION SECTION --- */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Our Mission</h2>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">Redefining Mobility in Europe</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Founded with a vision to make premium travel accessible, we connect travelers with high-quality vehicles across 12 countries. Whether you need a compact EV for city hopping in Amsterdam or a luxury SUV for the Swiss Alps, we have the perfect key for you.
            </p>
            <div className="flex gap-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <p className="font-bold text-2xl text-slate-900">15k+</p>
                <p className="text-sm text-slate-500">Happy Travelers</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <p className="font-bold text-2xl text-slate-900">50+</p>
                <p className="text-sm text-slate-500">Premium Locations</p>
              </div>
            </div>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
             <img 
               src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" 
               alt="Modern Electric Car" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>

      {/* --- VALUES / FEATURES --- */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Us?</h2>
            <p className="text-slate-600 mt-2">Built for the modern traveler.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Fleet</h3>
              <p className="text-slate-600 text-sm">Maintained to the highest EU safety standards. From Audi to Volvo, drive the best.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Anywhere Pickup</h3>
              <p className="text-slate-600 text-sm">Flexible pick-up and drop-off at major airports and city centers across Europe.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-slate-600 text-sm">Multilingual support team ready to assist you in English, French, German, or Spanish.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- CALL TO ACTION --- */}
      <div className="bg-slate-900 py-16 text-center px-4">
        <h2 className="text-3xl text-white font-bold mb-6">Ready to start your journey?</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
          Browse Cars
        </button>
      </div>

    </div>
  );
}