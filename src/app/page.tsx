import TicketForm from '@/components/TicketForm';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Hero Section - Featured Premiere */}
      <section className="relative w-full overflow-hidden">
        {/* Hero Background Video/Image */}
        <div className="relative w-full h-[90vh] bg-black">
          {/* Placeholder for hero video - replace with actual video */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#212121]/50 to-[#212121]">
            <Image
              src="https://placehold.co/1920x1080/1a1a1a/666666?text=Featured+Premiere+Film"
              alt="Featured Premiere"
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          
          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="inline-block bg-amber-500 text-black px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide mb-6">
                World Premiere
              </span>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl">
                The Featured Premiere
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow-lg">
                A groundbreaking cinematic experience that pushes the boundaries of storytelling
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg text-sm border border-white/20">Drama</span>
                <span className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg text-sm border border-white/20">2h 15m</span>
                <span className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg text-sm border border-white/20">Saturday 7:00 PM</span>
                <span className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg text-sm border border-white/20">Director Q&A</span>
              </div>
              <a
                href="#tickets"
                className="inline-block bg-white text-[#212121] font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                Get Tickets Now
              </a>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Festival Header */}
      <section className="py-16 px-4 bg-[#212121] text-center border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Film Festival <span className="text-amber-500">2024</span>
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            A Weekend of Cinematic Excellence
          </p>
          <p className="text-lg text-gray-400">
            One ticket • Three incredible films • Unforgettable experience • $15
          </p>
        </div>
      </section>

      {/* Classic Cinema Night - Full Width */}
      <section className="relative w-full h-[80vh] overflow-hidden group">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1920x1080/2a2a2a/888888?text=Classic+Cinema+Night"
            alt="Classic Cinema Night"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#212121] via-[#212121]/80 to-transparent"></div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide">
                  Classic
                </span>
                <span className="text-gray-300 font-medium text-lg">Saturday 9:30 PM</span>
              </div>
              
              <h3 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
                Classic Cinema Night
              </h3>
              
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Rediscover a timeless masterpiece on the big screen. This beautifully restored classic 
                showcases the golden age of filmmaking with stunning cinematography and 
                powerful performances that have stood the test of time.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-lg text-sm">Restored 4K</span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-lg text-sm">1h 52m</span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-lg text-sm">English</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Independent Spotlight - Full Width (Reversed Layout) */}
      <section className="relative w-full h-[80vh] overflow-hidden group">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1920x1080/252525/999999?text=Independent+Spotlight"
            alt="Independent Spotlight"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#212121] via-[#212121]/80 to-transparent"></div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl ml-auto text-right">
              <div className="flex items-center gap-4 mb-6 justify-end">
                <span className="text-gray-300 font-medium text-lg">Sunday 5:00 PM</span>
                <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide">
                  Indie
                </span>
              </div>
              
              <h3 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
                Independent Spotlight
              </h3>
              
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Discover fresh voices in independent cinema. This award-winning indie film 
                brings raw emotion and innovative storytelling that challenges conventions 
                and leaves a lasting impact on every viewer.
              </p>
              
              <div className="flex flex-wrap gap-3 justify-end">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-lg text-sm">Award Winner</span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-lg text-sm">1h 38m</span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-lg text-sm">Subtitled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#212121] to-black text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Experience All Three Films
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            One ticket grants you access to this entire cinematic journey
          </p>
          <a
            href="#tickets"
            className="inline-block bg-white text-[#212121] font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            Get Your Festival Pass - $15
          </a>
          <p className="text-gray-400 mt-6 text-sm">
            Limited seats available
          </p>
        </div>
      </section>

      {/* Ticket Form Section */}
      <section id="tickets" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <TicketForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center text-gray-400 text-sm bg-[#212121] border-t border-white/10">
        <p className="text-lg font-semibold mb-2">Film Festival 2024</p>
        <p className="mb-4">© 2024 Film Festival. All rights reserved.</p>
        <p>Questions? Email us at support@filmfestival.com</p>
      </footer>
    </div>
  );
}
