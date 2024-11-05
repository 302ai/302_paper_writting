'use client';
import {
  Button,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from '@nextui-org/react';
import clsx from 'clsx';
import { formatDate } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { events } from 'fetch-event-stream';
import ky from 'ky';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import toast, { ErrorIcon } from 'react-hot-toast';
import { FaHistory } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

import { ErrMessage } from './ErrMessage';
import { title } from './primitives';

import { API_KEY, MODEL_NAME, paperWritingURL, REGION } from '@/config/mode';
import { useSessionManager } from '@/hooks/use-session-store';
import { useLanguageContext } from '@/providers/language-provider';
import { Session } from '@/types';
import { showBrand } from '@/utils/brand';
import { eventCenter } from '@/utils/event-center';
import { handleEvent } from '@/utils/event-handler';

const languages = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
  { key: 'de', label: 'Deutsch' },
  { key: 'fr', label: 'Français' },
  { key: 'ko', label: '한국어' },
];

interface HeaderProps {
  className?: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isSubmitting: boolean;
}

const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ className, isSubmitting, setIsSubmitting }, ref) => {
    const { t, language } = useLanguageContext();
    const [apiKey, modelName] = [API_KEY, MODEL_NAME];
    const region = REGION;
    const router = useRouter();
    const [queryContent, setQueryContent] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(language);

    const handleSelectedLanguageChange = (values: Set<[]>) => {
      const value = values.values().next().value;

      setSelectedLanguage(value);
    };

    const languageLabel = useMemo(() => {
      return languages.find((l) => l.key === selectedLanguage)?.label;
    }, [languages, selectedLanguage]);

    const handleSubmit = async () => {
      if (queryContent.trim() === '') {
        toast.error(t('home.header.empty'));

        return;
      }
      setIsSubmitting(true);
      const initState = {
        event: 'init',
        data: queryContent,
      };

      handleEvent(JSON.stringify(initState));
      try {
        if (!paperWritingURL) {
          return;
        }

        const res = await ky.post(paperWritingURL, {
          headers: {
            'Content-Type': 'application/json',
          },
          json: {
            query: queryContent,
            api_key: apiKey,
            model: modelName,
            language: languageLabel,
          },
          timeout: false,
        });

        try {
          let abort = new AbortController();

          let apiStream = events(res, abort.signal);

          for await (const event of apiStream) {
            if (event.event === 'error') {
              const j = JSON.parse(event.data || '{}');

              if (typeof j?.err_code !== 'undefined') {
                toast((t) => (
                  <div className="flex items-center gap-2">
                    <div>
                      <ErrorIcon />
                    </div>
                    <div>
                      {ErrMessage(
                        j.err_code,
                        (language as '') || 'zh',
                        parseInt(region || '0')
                      )}
                    </div>
                  </div>
                ));
              } else {
                handleEvent(
                  JSON.stringify({
                    event: 'error',
                    data: 'Unknown error',
                  })
                );
              }
              handleEvent(
                JSON.stringify({
                  event: 'error',
                  data: 'Backend api error.',
                })
              );

              return;
            } else {
              let j = JSON.parse(event.data || '{}');
              const isError =
                typeof j?.event !== 'undefined' && j?.event === 'error';

              if (isError) {
                j = j.data;

                if (typeof j.err_code !== 'undefined') {
                  toast((t) => (
                    <div className="flex items-center gap-2">
                      <div>
                        <ErrorIcon />
                      </div>
                      <div>
                        {ErrMessage(
                          j.err_code,
                          (language as '') || 'zh',
                          parseInt(region || '0')
                        )}
                      </div>
                    </div>
                  ));
                } else {
                  handleEvent(
                    JSON.stringify({
                      event: 'error',
                      data: 'Unknown error',
                    })
                  );
                }

                handleEvent(
                  JSON.stringify({
                    event: 'error',
                    data: 'Backend api error.',
                  })
                );
              } else {
                handleEvent(event.data || '');
              }
            }
          }
        } catch (e) {}
      } catch (error) {
        handleEvent(
          JSON.stringify({
            event: 'error',
            data: 'Error occurred while generating paper writing.',
          })
        );
        console.log('error', error);
      }
      setIsSubmitting(false);
    };

    useEffect(() => {
      const handleDataReady = (id: any) => {
        router.push('/detail/' + id);
      };

      const handleError = (_: any) => {
        setIsSubmitting(false);
      };

      eventCenter.subscribe('dataReady', handleDataReady);
      eventCenter.subscribe('error', handleError);

      return () => {
        eventCenter.unsubscribe('error', handleError);
        eventCenter.unsubscribe('dataReady', handleDataReady);
      };
    }, [router, setIsSubmitting]);

    const { searchSessions, deleteSessionById, deleteSessionAll } =
      useSessionManager();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Session[]>([]);

    const debouncedSearch = useCallback(
      debounce(async (query: string) => {
        const results = await searchSessions(query);

        setSearchResults(results || []);
      }, 300),
      [searchSessions]
    );

    useEffect(() => {
      debouncedSearch(searchQuery);
    }, [searchQuery, searchSessions, debouncedSearch]);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
      <header
        ref={ref}
        className={clsx(
          'flex w-full min-w-[375px] flex-col items-center justify-center space-y-4 p-6',
          !isSubmitting && '-mt-16',
          className
        )}
      >
        <div className="flex items-center space-x-4">
          {showBrand && (
            <Image
              alt="302"
              className="size-6 object-contain sm:size-8 md:size-10"
              src="https://file.302.ai/gpt/imgs/5b36b96aaa052387fb3ccec2a063fe1e.png"
            />
          )}
          <h1 className={title({ size: 'sm' })}>{t('home.header.title')}</h1>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
          <Select
            disallowEmptySelection
            aria-label={t('home.header.language')}
            className="flex-1 sm:max-w-32"
            classNames={{
              trigger:
                'data-[hover=true]:border-primary-400 bg-white border data-[open=true]:border-primary-500 data-[focus=true]:border-primary-500',
            }}
            defaultSelectedKeys={[selectedLanguage]}
            isDisabled={isSubmitting}
            placeholder={t('home.header.language')}
            radius="sm"
            variant="bordered"
            onSelectionChange={(value) => {
              handleSelectedLanguageChange(value as unknown as Set<[]>);
            }}
          >
            {languages.map((language) => (
              <SelectItem
                key={language.key}
                value={language.label}
              >
                {language.label}
              </SelectItem>
            ))}
          </Select>
          <Input
            className="flex-grow sm:w-72 sm:flex-grow-0"
            classNames={{
              inputWrapper:
                'data-[hover=true]:border-primary-400 bg-white border',
            }}
            color="primary"
            placeholder={t('home.header.placeholder')}
            radius="sm"
            value={queryContent}
            variant="bordered"
            onChange={(e) => setQueryContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="flex items-center justify-center gap-2">
            <Button
              color="primary"
              isLoading={isSubmitting}
              radius="sm"
              variant="solid"
              onClick={handleSubmit}
            >
              {isSubmitting
                ? t('home.header.starting')
                : t('home.header.start')}
            </Button>
            <Button
              isIconOnly
              className="border"
              isDisabled={isSubmitting}
              radius="full"
              variant="ghost"
              onClick={() => onOpen()}
            >
              <FaHistory />
            </Button>
          </div>
        </div>

        <Modal
          hideCloseButton
          isOpen={isOpen}
          placement="center"
          scrollBehavior="inside"
          size="5xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex items-center justify-between gap-1">
                  <h2>{t('home.header.history.title')}</h2>
                  <Input
                    className="max-w-64 flex-1"
                    classNames={{
                      inputWrapper:
                        'data-[hover=true]:border-primary-400 bg-white border',
                    }}
                    color="primary"
                    placeholder={t('home.header.history.search.placeholder')}
                    radius="sm"
                    value={searchQuery}
                    variant="bordered"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </ModalHeader>
                <ModalBody className="divide-y-1">
                  {searchResults.length < 1 && (
                    <div className="h-32 w-full">
                      <p className="text-center">
                        {t('home.header.history.empty')}
                      </p>
                    </div>
                  )}
                  {searchResults.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between gap-4 pt-4"
                    >
                      <div className="flex flex-col gap-2">
                        <h2
                          aria-hidden="true"
                          aria-label="title"
                          className="w-fit cursor-pointer text-xl font-bold hover:text-primary-500"
                          onClick={() => router.push(`/detail/${session.id}`)}
                        >
                          {session.title}
                        </h2>
                        <p className="line-clamp-2 text-gray-700">
                          {session.summary}
                        </p>
                        <span className="text-gray-400">
                          {formatDate(session.createdAt, 'MM-dd HH:mm', {
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          isIconOnly
                          color="danger"
                          radius="full"
                          onClick={async () => {
                            await deleteSessionById(session.id);
                            toast.success(
                              t('home.header.history.deleteSuccess', {
                                count: '1',
                              })
                            );
                          }}
                        >
                          <MdDelete className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ModalBody>
                <ModalFooter className="flex-x flex items-center justify-between">
                  <Button
                    color="danger"
                    isDisabled={searchResults.length === 0}
                    variant="ghost"
                    onPress={async () => {
                      if (
                        window.confirm(t('home.header.history.deleteConfirm'))
                      ) {
                        onClose();
                        const count = await deleteSessionAll();

                        toast.success(
                          t('home.header.history.deleteSuccess', {
                            count: '' + count,
                          })
                        );
                      }
                    }}
                  >
                    {t('home.header.history.deleteAll')}
                  </Button>
                  <Button
                    color="secondary"
                    variant="bordered"
                    onPress={onClose}
                  >
                    {t('home.header.history.close')}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
