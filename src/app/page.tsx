import TicketForm from '@/components/TicketForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section - Featured Premiere */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Film Festival 2024
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-4">
              A Weekend of Cinematic Excellence
            </p>
            <p className="text-lg text-gray-400">
              One ticket • Three incredible films • Unforgettable experience
            </p>
          </div>

          {/* Featured Premiere Movie */}
          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm rounded-2xl p-8 sm:p-12 mb-8 border border-amber-500/30 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <span className="bg-amber-500 text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                Premiere Event
              </span>
              <span className="text-amber-400 text-lg font-semibold">Saturday 7:00 PM</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              The Featured Premiere
            </h2>
            
            <p className="text-lg text-gray-200 mb-6 leading-relaxed">
              Join us for the exclusive premiere screening of our headline film. This groundbreaking 
              work pushes the boundaries of storytelling and visual artistry. Be among the first 
              to experience this cinematic masterpiece, followed by a Q&A with the filmmakers.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Drama</span>
              <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">2h 15m</span>
              <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">English</span>
              <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Director Q&A</span>
            </div>
          </div>

          {/* Additional Movies Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Classic Cinema Night */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  Classic
                </span>
                <span className="text-gray-300 font-medium">Saturday 9:30 PM</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-3">Classic Cinema Night</h3>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Rediscover a timeless masterpiece on the big screen. This restored classic 
                showcases the golden age of filmmaking with stunning cinematography and 
                powerful performances that have stood the test of time.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/10 px-3 py-1 rounded text-xs">Classic</span>
                <span className="bg-white/10 px-3 py-1 rounded text-xs">Restored</span>
                <span className="bg-white/10 px-3 py-1 rounded text-xs">1h 52m</span>
              </div>
            </div>

            {/* Independent Spotlight */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  Indie
                </span>
                <span className="text-gray-300 font-medium">Sunday 5:00 PM</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-3">Independent Spotlight</h3>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Discover fresh voices in independent cinema. This award-winning indie film 
                brings raw emotion and innovative storytelling that challenges conventions 
                and leaves a lasting impact.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/10 px-3 py-1 rounded text-xs">Independent</span>
                <span className="bg-white/10 px-3 py-1 rounded text-xs">Award Winner</span>
                <span className="bg-white/10 px-3 py-1 rounded text-xs">1h 38m</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-12">
            <a
              href="#tickets"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Get Your Festival Pass
            </a>
            <p className="text-gray-400 mt-4 text-sm">
              Limited seats available • $15 per ticket
            </p>
          </div>
        </div>
      </section>

      {/* Ticket Form Section */}
      <section id="tickets" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <TicketForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>© 2024 Film Festival. All rights reserved.</p>
        <p className="mt-2">Questions? Email us at support@filmfestival.com</p>
      </footer>
    </div>
  );
}
