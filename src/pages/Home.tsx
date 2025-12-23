import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import stockVideo from '../assets/Stock_video.mp4';
import newsVideo from '../assets/news.mp4';
import newspaperVideo from '../assets/newspaper.mp4';

const videos = [stockVideo, newsVideo, newspaperVideo];

// Public shared headline shape from API
interface SharedHeadline {
  headlineId: string;
  entryId: string;
  type: 'local' | 'global';
  text: string;
  source: string;
  url?: string | null;
  userName: string;
  userId: string | null;
  date: string;
}

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [sharedHeadlines, setSharedHeadlines] = useState<SharedHeadline[]>([]);

  // Build cards from public shared headlines
  const newsCards = sharedHeadlines.map((h) => ({
    id: h.headlineId,
    title: h.text,
    excerpt: h.source || 'No source available',
    category: h.type === 'local' ? 'Local' : 'Global',
    image:
      h.type === 'local'
        ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'
        : 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop',
    url: h.url || undefined,
    userName: h.userName,
    userId: h.userId,
    headlineId: h.headlineId,
  }));

  // Fetch public shared headlines (works for guests too)
  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await api.get('/api/headlines/shared');
        setSharedHeadlines(res.data || []);
      } catch (e) {
        console.error('Failed to load shared headlines', e);
      }
    };
    fetchShared();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % videos.length);
        setFade(false);
      }, 1000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setIsVisible(true);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel controls (drag + arrows)
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!cardsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - cardsRef.current.offsetLeft;
    scrollLeftRef.current = cardsRef.current.scrollLeft;
  };
  const onMouseLeaveOrUp = () => {
    isDraggingRef.current = false;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !cardsRef.current) return;
    e.preventDefault();
    const x = e.pageX - cardsRef.current.offsetLeft;
    const walk = x - startXRef.current;
    cardsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };
  const onTouchStart = (e: React.TouchEvent) => {
    if (!cardsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - cardsRef.current.offsetLeft;
    scrollLeftRef.current = cardsRef.current.scrollLeft;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !cardsRef.current) return;
    const x = e.touches[0].pageX - cardsRef.current.offsetLeft;
    const walk = x - startXRef.current;
    cardsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };
  const onTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const scrollByAmount = (dir: 'left' | 'right') => {
    if (!cardsRef.current) return;
    const amount = (cardsRef.current.clientWidth || 0) * 0.9;
    cardsRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };



  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Banner */}
      <div 
        ref={heroRef}
        className="relative h-[90vh] overflow-hidden text-white flex items-center justify-center px-6 lg:px-8"

      >
        {/* Video Layers */}
        {videos.map((videoSrc, index) => (
          <video
            key={index}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover brightness-75 transition-opacity duration-1000 ${
              index === activeIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ))}

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10" />

        {/* Hero Text */}
<div className="text-center max-w-5xl mx-auto z-20 px-4">
  {/* Main Heading */}
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight">
    Empowering <span className="font-semibold text-white">Vision71 Technologies</span>  with Daily Insights Global, Local, and Market News
  </h1>




  {/* Description */}
  <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
    Stay informed, collaborate, and innovate with our confidential intelligence platform
  </p>

  {/* Buttons */}
  <div className="mt-10 flex items-center justify-center gap-x-6">
    {isAuthenticated ? (
      <a
        href="/dashboard"
        className="rounded-md bg-[#1F2937] px-6 py-3 text-sm sm:text-base font-medium text-white shadow-md hover:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition"
      >
        Go to Dashboard
      </a>
    ) : (
      <>
        <a
          href="/register"
          className="rounded-md bg-[#202938] px-6 py-3 text-sm sm:text-base font-medium text-white shadow-md hover:bg-[#101d33] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="text-sm sm:text-base font-medium text-gray-200 hover:text-white hover:underline transition"
        >
          Log in <span aria-hidden="true">→</span>
        </a>
      </>
    )}
  </div>
</div>

      </div>

      {/* Features Section */}
      <div 
        ref={featuresRef}
        className={`bg-gray-50 dark:bg-gray-800 py-24 sm:py-32 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-[#202938] dark:text-[#202938]">Track Everything</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-gray-900 via-[#202938] to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                Everything you need to monitor markets and news
              </span>
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Newsflash provides a simple yet powerful way to keep track of stocks and headlines that matter to you.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {/* Features */}
   <div className="relative pl-20 sm:pl-24">
      <div className="absolute left-0 top-4 flex items-center justify-center rounded-xl bg-transparent">
        <img
          src="/Growth.gif"
          alt="Stock Tracking Animation"
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain mix-blend-normal"
          style={{
            backgroundColor: 'transparent',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          }}
        />
      </div>
      <dt className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
        Stock Tracking
      </dt>
      <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
        Keep track of stocks that interest you, both local and global. Record symbols and names for easy reference.
      </dd>
    </div>
               <div className="relative pl-20 sm:pl-24">
      <div className="absolute left-0 top-0 flex items-center justify-center rounded-xl bg-transparent">
        <img
          src="/Globe.gif"
          alt="Stock Tracking Animation"
          className="w-16 h-16 sm:w-32 sm:h-32 lg:w-24 lg:h-24 object-contain mix-blend-normal"
          style={{
            backgroundColor: 'transparent',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          }}
        />
      </div>
      <dt className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
        News Headlines
      </dt>
      <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
        Record important news headlines, both local and global, with sources and optional URLs for future reference.
      </dd>
    </div>
                <div className="relative pl-20 sm:pl-24">
      <div className="absolute left-0 top-4 flex items-center justify-center rounded-xl bg-transparent">
        <img
          src="/Calendar and clock.gif"
          alt="Stock Tracking Animation"
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain mix-blend-normal"
          style={{
            backgroundColor: 'transparent',
            filter: 'drop-shadow(0 2px 6px rgba(249,250,251))',
          }}
        />
      </div>
      <dt className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
        History Tracking
      </dt>
      <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
        Build a personal history of market events and news. Look back at what was happening on specific dates.
      </dd>
    </div>
            <div className="relative pl-20 sm:pl-24">
      <div className="absolute left-0 top-0 flex items-center justify-center rounded-xl bg-transparent">
        <img
          src="/uni secure.gif"
          alt="Stock Tracking Animation"
          className="w-16 h-16 sm:w-14 sm:h-14 lg:w-24 lg:h-24 object-contain mix-blend-normal"
          style={{
            backgroundColor: 'transparent',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          }}
        />
      </div>
      <dt className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
        Secure & Private
      </dt>
      <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
      Your data is secure and private. Only you can access your entries after logging in with your account.
      </dd>
    </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Modern Top Rated News Carousel */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 sm:py-32 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
              <span className="bg-gradient-to-r from-[#202938] via-[#1F2937] to-[#202938] dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                Top Rated News
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover the most impactful stories shaping our world today
            </p>
          </div>

          {/* Cards Container */}
          <div className="relative">
            {/* Enhanced Navigation Arrows */}
            <button
              aria-label="Scroll left"
              onClick={() => scrollByAmount('left')}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div
              ref={cardsRef}
              className="flex gap-6 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeaveOrUp}
              onMouseUp={onMouseLeaveOrUp}
              onMouseMove={onMouseMove}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newsCards.map((card, index) => (
                <div
                  key={card.id}
                  className="w-full md:w-1/3 flex-shrink-0 px-2 group"
                  style={{ minWidth: '280px' }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 dark:border-gray-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-600">
                    {/* Enhanced Card Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 right-12 flex items-center justify-between">
                        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-[#202938] to-[#1F2937] text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm">
                          {card.category}
                        </span>
                      </div>
                      {/* Delete (admin or author) */}
                      {isAuthenticated && (user?.isAdmin || (card.userId && user?._id === card.userId)) && (
                        <button
                          aria-label="Remove headline"
                          onClick={async () => {
                            const ok = window.confirm('Remove this headline from public feed?');
                            if (!ok) return;
                            try {
                              await api.delete(`/api/headlines/${card.id}`);
                              setSharedHeadlines(prev => prev.filter(h => h.headlineId !== card.id));
                            } catch (e) {
                              console.error('Failed to remove headline', e);
                              alert('Failed to remove headline');
                            }
                          }}
                          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Enhanced Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                        {card.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Shared by {card.userName}
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-4 h-4 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => card.url && window.open(card.url, '_blank')}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                            card.url
                              ? 'bg-gradient-to-r from-[#202938] to-[#1F2937] text-white hover:from-[#1F2937] hover:to-[#202938] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {card.url ? 'Read More' : 'No Link Available'}
                          {card.url && (
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
