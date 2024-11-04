import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDisclosure } from '@nextui-org/react';
import { useInterval } from '@reactuses/core';

import MarkdownRenderer from './markdown-renderer';

import { eventCenter } from '@/utils/event-center';
import { useLanguageContext } from '@/providers/language-provider';
import { useSessionStore } from '@/hooks/use-session-store';

interface ProgressDisplayProps {
  isLoading: boolean;
}

export function ProgressDisplay({ isLoading }: ProgressDisplayProps) {
  const [currentOperation, setCurrentOperation] = React.useState('');
  const [currentMdContent, setCurrentMdContent] = React.useState(``);
  let content = '';
  const updateCurrentSession = useSessionStore(
    (state) => state.updateCurrentSession
  );

  React.useEffect(() => {
    const handleEvent = (data: string) => {
      if (data !== 'DONE') {
        setCurrentOperation(data.replaceAll('#', ''));
      } else {
        console.log(content);
        updateCurrentSession({
          middleInfo: content,
        });
        content = '';
        setCurrentOperation('');
        eventCenter.dispatch({ event: 'middleInfoFinish', data: '' });
      }
    };

    const handleInit = (data: string) => {
      setCurrentMdContent('');
    };

    const handleMdEvent = (data: string) => {
      setCurrentMdContent(() => {
        content = content + '\n' + data + '\n';

        return content;
      });
    };

    const handleError = (data: string) => {
      setCurrentOperation('');
    };

    eventCenter.subscribe('error', handleError);
    eventCenter.subscribe('start', handleEvent);
    eventCenter.subscribe('init', handleInit);
    eventCenter.subscribe('start', handleMdEvent);
    eventCenter.subscribe('start_search', handleEvent);
    eventCenter.subscribe('start_search', handleMdEvent);
    eventCenter.subscribe('searching_in_progress', handleMdEvent);
    eventCenter.subscribe('start_gen_outline', handleEvent);
    eventCenter.subscribe('start_gen_outline', handleMdEvent);
    eventCenter.subscribe('start_gen_article', handleEvent);
    eventCenter.subscribe('start_gen_article', handleMdEvent);
    eventCenter.subscribe('start_gen_summary', handleEvent);
    eventCenter.subscribe('start_gen_summary', handleMdEvent);
    eventCenter.subscribe('finished', handleEvent);

    return () => {
      eventCenter.unsubscribe('error', handleError);
      eventCenter.unsubscribe('init', handleInit);
      eventCenter.unsubscribe('start', handleEvent);
      eventCenter.unsubscribe('start', handleMdEvent);
      eventCenter.unsubscribe('start_search', handleEvent);
      eventCenter.unsubscribe('start_search', handleMdEvent);
      eventCenter.unsubscribe('searching_in_progress', handleMdEvent);
      eventCenter.unsubscribe('start_gen_outline', handleEvent);
      eventCenter.unsubscribe('start_gen_outline', handleMdEvent);
      eventCenter.unsubscribe('start_gen_article', handleEvent);
      eventCenter.unsubscribe('start_gen_article', handleMdEvent);
      eventCenter.unsubscribe('start_gen_summary', handleEvent);
      eventCenter.unsubscribe('start_gen_summary', handleMdEvent);
      eventCenter.unsubscribe('finished', handleEvent);
    };
  }, []);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const toggleModalOpen = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading]);

  const [dots, setDots] = useState('.');

  useInterval(() => {
    setDots((prevDots) => {
      if (prevDots.length >= 3) {
        return '.';
      } else {
        return prevDots + '.';
      }
    });
  }, 300);
  const { t, language } = useLanguageContext();

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex items-center justify-center gap-4 text-[#9ca3af]">
        {isLoading && (
          <div className="size-4 animate-spin rounded-full border-b-2 border-t-2 border-[#9ca3af]" />
        )}
        {isLoading && <span>{currentOperation}</span>}
      </div>
      {isLoading && (
        <div className="flex h-[70%] flex-1 items-center justify-center">
          <div className="container mx-auto h-full min-h-[300px] w-[750px] overflow-y-auto rounded-lg border bg-white p-4">
            <MarkdownRenderer
              markdown={currentMdContent}
              setMdContent={() => {}}
            >
              <MarkdownRenderer.Preview
                scrollToBottom
                className="prose mx-auto h-full break-all"
              />
            </MarkdownRenderer>
          </div>
        </div>
      )}
    </div>
  );
}
