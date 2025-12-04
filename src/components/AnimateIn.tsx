'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  from?: 'bottom' | 'left' | 'right' | 'top' | 'fade';
};

export default function AnimateIn({ 
  children, 
  className = '', 
  delay = 0,
  duration = 600,
  from = 'bottom'
}: AnimateInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getInitialTransform = () => {
    switch (from) {
      case 'bottom': return 'translateY(40px)';
      case 'top': return 'translateY(-40px)';
      case 'left': return 'translateX(-40px)';
      case 'right': return 'translateX(40px)';
      case 'fade': return 'translateY(0)';
      default: return 'translateY(40px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : getInitialTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

