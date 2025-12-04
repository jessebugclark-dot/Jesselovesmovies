import TicketForm from '@/components/TicketForm';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt="DEADARM"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0a0a0a]" />
        </div>

        {/* Header */}
        <header className="relative z-10 pt-8 text-center">
          <Image
            src="/logo.png"
            alt="The Jesse Clark Film Club"
            width={120}
            height={60}
            className="mx-auto"
          />
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4">
          {/* Film Title */}
          <h1 className="mb-8 w-[80%]">
            <Image
              src="/title.png"
              alt="DEADARM"
              width={900}
              height={200}
              className="w-full h-auto"
              priority
            />
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="tag-pill">Drama</span>
            <span className="tag-pill">19 Min</span>
            <span className="tag-pill">December 22nd, 7PM & 8PM</span>
            <span className="tag-pill">Director Q&A</span>
            <span className="tag-pill">Vineyard Megaplex</span>
          </div>

          {/* CTA Button */}
          <a href="#tickets" className="cta-button inline-flex items-center gap-2 mb-10">
            Get Tickets Now
            <span className="text-lg">→</span>
          </a>

          {/* Social Icons */}
          <div className="flex gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Image src="/insta-icon.svg" alt="Instagram" width={28} height={28} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Image src="/tiktok-icon.svg" alt="TikTok" width={28} height={28} />
            </a>
          </div>
        </div>
      </section>

      {/* Trailer Section */}
      <section className="py-20 px-4 bg-[#0c0a0a]">
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm aspect-[9/16]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://drive.google.com/file/d/1xI7zMz5VIl0fb9eqKT5S484WurOD-kjA/preview"
              title="DEADARM Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Ticket Form Section */}
      <section id="tickets" className="relative py-20 px-4 sm:px-6 lg:px-8">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Background"
            fill
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <TicketForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="tracking-text text-[8px] text-white/40">
            © 2025 The Jesse Clark Film Club. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-70 transition-opacity">
              <Image src="/insta-icon.svg" alt="Instagram" width={20} height={20} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-70 transition-opacity">
              <Image src="/tiktok-icon.svg" alt="TikTok" width={20} height={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
