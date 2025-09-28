'use client';

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface CarouselProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export default function Carousel({ 
  title, 
  subtitle, 
  children, 
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 } 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.children[0]?.clientWidth || 0;
      const gap = 24; // gap-6 = 24px
      const scrollPosition = index * (itemWidth + gap);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    const childrenArray = Array.from(scrollContainerRef.current?.children || []);
    const maxIndex = Math.max(0, childrenArray.length - itemsPerView.desktop);
    if (currentIndex < maxIndex) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="heading-md text-dark-gray mb-2">{title}</h2>
          {subtitle && (
            <p className="text-body-lg text-medium-gray">{subtitle}</p>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white disabled:opacity-50"
          >
            <FaChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
          >
            <FaChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-6 pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {children}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.ceil((React.Children.count(children) - itemsPerView.desktop + 1) || 1) }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-turquoise' : 'bg-light-gray'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
