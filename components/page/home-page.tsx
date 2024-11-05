'use client';
import { useTitle } from 'ahooks';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import Footer from '@/components/footer';
import Header from '@/components/header';
import LanguageSwitch from '@/components/language-switcher';
import { ProgressDisplay } from '@/components/progress-display';
import { SessionState, useSessionStore } from '@/hooks/use-session-store';
import { useLanguageContext } from '@/providers/language-provider';
import { showBrand } from '@/utils/brand';
import { eventCenter } from '@/utils/event-center';

export default function HomePage() {
  const { t, language, setLanguage, isClientReady } = useLanguageContext();

  const searchParams = useSearchParams();

  useEffect(() => {
    const lang = searchParams.get('lang');

    if (lang) {
      setLanguage(lang);
    }
  }, []);
  useTitle(t('home.title'));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mainHeight, setMainHeight] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const calculateHeight = useCallback(() => {
    if (headerRef.current && footerRef.current) {
      const windowHeight = window.innerHeight;
      const headerHeight = headerRef.current.offsetHeight;
      const footerHeight = footerRef.current.offsetHeight;

      setMainHeight(windowHeight - headerHeight - footerHeight - 200);
    }
  }, []);

  useEffect(() => {
    calculateHeight();

    const resizeObserver = new ResizeObserver(calculateHeight);

    resizeObserver.observe(document.body);

    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    window.addEventListener('resize', calculateHeight);
    window.addEventListener('orientationchange', calculateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateHeight);
      window.removeEventListener('orientationchange', calculateHeight);
    };
  }, [calculateHeight]);

  const handlersRef = useRef({
    handleInit: (data: string) => {
      const newSession: SessionState = {
        id: Date.now().toString(),
        title: data,
        taskId: '',
        summary: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        query: data,
        outline: '',
        article: '',
        urlToInfo: [],
        searchResults: { conversations: [], url_to_info: {} },
        middleInfo: '',
      };

      useSessionStore.getState().setCurrentSession(newSession);
    },
    handleTaskId: (data: string) => {
      useSessionStore.getState().updateCurrentSession({ taskId: data });
    },
    handleSearchResults: (data: any) => {
      useSessionStore.getState().updateCurrentSession({ searchResults: data });
    },
    handleOutline: (data: string) => {
      useSessionStore.getState().updateCurrentSession({ outline: data });
    },
    handleArticle: (data: string) => {
      useSessionStore.getState().updateCurrentSession({ article: data });
    },
    handleSummary: (data: string) => {
      useSessionStore.getState().updateCurrentSession({ summary: data });
    },
    handleUrlToInfo: (data: any[]) => {
      useSessionStore.getState().updateCurrentSession({ urlToInfo: data });
    },
    handleFinished: async () => {
      const id = await useSessionStore.getState().saveSession();

      toast.success(t('home.create.success'), { id: 'create-session-success' });
      eventCenter.dispatch({ event: 'dataReady', data: id });
    },
  });

  useEffect(() => {
    const handlers = handlersRef.current;

    eventCenter.subscribe('init', handlers.handleInit);
    eventCenter.subscribe('task_id', handlers.handleTaskId);
    eventCenter.subscribe('search_results', handlers.handleSearchResults);
    eventCenter.subscribe('storm_gen_outline', handlers.handleOutline);
    eventCenter.subscribe('storm_gen_article', handlers.handleArticle);
    eventCenter.subscribe('storm_gen_summary', handlers.handleSummary);
    eventCenter.subscribe('url_to_info', handlers.handleUrlToInfo);
    eventCenter.subscribe('middleInfoFinish', handlers.handleFinished);

    return () => {
      eventCenter.unsubscribe('init', handlers.handleInit);
      eventCenter.unsubscribe('task_id', handlers.handleTaskId);
      eventCenter.unsubscribe('search_results', handlers.handleSearchResults);
      eventCenter.unsubscribe('storm_gen_outline', handlers.handleOutline);
      eventCenter.unsubscribe('storm_gen_article', handlers.handleArticle);
      eventCenter.unsubscribe('storm_gen_summary', handlers.handleSummary);
      eventCenter.unsubscribe('url_to_info', handlers.handleUrlToInfo);
      eventCenter.unsubscribe('middleInfoFinish', handlers.handleFinished);
    };
  }, []);

  return (
    <section className="flex h-screen flex-col items-center justify-between gap-4 py-8 md:py-10">
      <LanguageSwitch className="fixed right-10 top-2" />
      <div />
      <Header
        ref={headerRef}
        className={clsx(
          !isSubmitting &&
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
      <div
        className="flex w-full flex-1 items-center justify-center space-x-4"
        style={{
          height: mainHeight ? `${mainHeight}px` : 'auto',
        }}
      >
        <ProgressDisplay isLoading={isSubmitting} />
      </div>
      <footer
        ref={footerRef}
        className="flex w-full items-center justify-center py-3"
      >
        {showBrand && <Footer chinese={language === 'zh'} />}
      </footer>
    </section>
  );
}
