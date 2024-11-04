'use client';
import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { useElementBounding } from '@reactuses/core';
import { useTitle } from 'ahooks';
import clsx from 'clsx';
import htmlToPdfmake from 'html-to-pdfmake';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MdEdit, MdPreview } from 'react-icons/md';

import Footer from '@/components/footer';
import MarkdownRenderer from '@/components/markdown-renderer';
import { title } from '@/components/primitives';
import { paperPDFURL } from '@/config/mode';
import { useSessionManager } from '@/hooks/use-session-store';
import { useLanguageContext } from '@/providers/language-provider';
import { Session } from '@/types';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const notoSansScNormal =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.ttf';
const notoSansScBold =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-700-normal.ttf';

export default function DetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { t, language } = useLanguageContext();
  const { findSessionById, updateSessionArticleById } = useSessionManager();
  const [session, setSession] = useState<Session>();
  const [md, setMd] = useState<string>('');
  const fetchSession = async () => {
    try {
      const fetchedSession = await findSessionById(id);

      if (fetchedSession) {
        setSession(fetchedSession);
      } else {
        toast.success(t('detail.sessionNotFound'), {
          duration: 3000,
        });
        router.back();
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error(t('detail.errorFetchingSession'));
      router.back();
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id, findSessionById, router, t]);

  useEffect(() => {
    setMd(session?.article || '');
  }, [session]);

  useTitle(t('detail.title'));

  const handleDownloadPdf = useCallback(async () => {
    if (!paperPDFURL) {
      toast.error(t('detail.apiNotSet'));

      return;
    }

    if (!session?.taskId) {
      toast.error(t('detail.taskIdNotSet'));

      return;
    }

    const api = paperPDFURL;

    const resp = ky.post(api, {
      json: {
        content: md,
        title: session.title,
        urlToInfo: session.urlToInfo || [],
        taskId: session.taskId,
      },
      timeout: false,
    });

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const b = await resp.blob();

          const downloadUrl = window.URL.createObjectURL(b);

          console.log('resp', resp);

          const fileName = `${session?.title || t('article')}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;

          const link = document.createElement('a');

          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          resolve(true);
        } catch (e) {
          reject(false);
        } finally {
          resolve(true);
        }
      }),
      {
        loading: t('detail.downloadProecss.creating'),
        success: t('detail.downloadProecss.downloading'),
        error: t('detail.downloadProecss.error'),
      }
    );
  }, [session, t, md]);

  const handleDownloadMarkdownAsPDF = useCallback(() => {
    if (isEditing) {
      toast.error(t('detail.cannotDownloadMarkdownInEditingMode'));

      return;
    }

    const html = document.querySelector('.markdown-preview');

    pdfMake.fonts = {
      notoSansCJK: {
        normal: notoSansScNormal,
        bold: notoSansScBold,
      },
    };

    const pdfContent = htmlToPdfmake(html?.innerHTML || '');

    const documentDefinition = {
      content: pdfContent,
      defaultStyle: {
        font: 'notoSansCJK',
      },
    };

    const fileName = `${session?.title || t('article')}_${language}`;

    pdfMake.createPdf(documentDefinition).download(`${fileName}.pdf`);
  }, [session, isEditing, language, t]);

  const handleCopyMarkdown = () => {
    const textArea = document.createElement('textarea');

    textArea.value = session?.article || '';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
    toast.success(t('detail.copySuccess'));
  };

  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftPanelRect = useElementBounding(leftPanelRef);

  const leftPanelInnnerRef = useRef<HTMLDivElement>(null);
  const leftPanelInnnerRect = useElementBounding(leftPanelInnnerRef);

  useEffect(() => {
    if (leftPanelRect && leftPanelRect.top < 0) {
      if (leftPanelVisible) {
        setLeftPanelVisible(false);
      }
    } else if (leftPanelRect && leftPanelRect.top >= 0) {
      if (!leftPanelVisible) {
        setLeftPanelVisible(true);
      }
    }
  }, [leftPanelRect, leftPanelVisible]);

  useEffect(() => {
    updateSessionArticleById(id, md);
  }, [md]);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const toggleModalOpen = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }, [isOpen]);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <MarkdownRenderer
      markdown={md}
      setMdContent={setMd}
    >
      <div
        className={clsx(
          'fixed top-0 hidden md:block',
          leftPanelVisible ? 'md:hidden' : 'md:block',
          isExpanded && 'mb-4 w-64',
          !isExpanded && 'size-6'
        )}
        style={{
          left: leftPanelRect.left,
        }}
      >
        <div
          className={clsx(
            'bg-white',
            isExpanded && 'h-[70vh] overflow-y-auto rounded-large border p-4'
          )}
        >
          <MarkdownRenderer.Tree
            className={clsx(
              'rounded-lg',
              isExpanded ? 'mb-4 w-full p-4' : 'size-6'
            )}
            isExpanded={isExpanded}
            onExpandToggle={(expanded) => setIsExpanded(expanded)}
          />
        </div>
      </div>
      <div className="container mx-auto flex min-h-screen min-w-[375px] max-w-[1280px] flex-col">
        <div className="flex h-32 items-center justify-center space-x-4">
          <Image
            alt="302"
            className="size-6 object-contain sm:size-8 md:size-10"
            src="https://file.302.ai/gpt/imgs/5b36b96aaa052387fb3ccec2a063fe1e.png"
          />
          <h1 className={title({ size: 'sm' })}>{t('home.header.title')}</h1>
        </div>

        <div className="mb-4 flex w-full flex-1 flex-col overflow-hidden rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between p-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.back()}
            >
              {t('detail.back')}
            </Button>
            <div className="flex gap-4">
              <Button
                size="sm"
                variant="bordered"
                onClick={toggleModalOpen}
              >
                {t('process.detai.show')}
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onClick={handleCopyMarkdown}
              >
                {t('detail.copy')}
              </Button>
              <Button
                color="primary"
                isDisabled={isEditing}
                size="sm"
                variant="solid"
                onClick={handleDownloadPdf}
              >
                {t('detail.download')}
              </Button>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-center p-6 font-semibold">
            <h1 className="text-center text-4xl">{session.title}</h1>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div
              ref={leftPanelRef}
              className={clsx(
                'sticky top-0 mx-4 hidden md:block',
                leftPanelVisible ? 'visible' : 'invisible',
                isExpanded && 'mb-4 w-64',
                !isExpanded && 'size-6'
              )}
            >
              <div
                className={clsx(
                  'bg-white',
                  isExpanded
                    ? 'h-[70vh] overflow-y-auto rounded-large border p-4'
                    : ''
                )}
              >
                <MarkdownRenderer.Tree
                  className={clsx(
                    'rounded-lg',
                    isExpanded ? 'mb-4 w-full p-4' : 'size-6'
                  )}
                  isExpanded={isExpanded}
                  onExpandToggle={(expanded) => setIsExpanded(expanded)}
                />
              </div>
            </div>

            <div className="mb-4 flex-1 overflow-y-auto md:mr-4">
              <div className="relative rounded-large border bg-white p-4">
                <div className="absolute right-2 top-1 z-50 flex items-center space-x-2 overflow-hidden rounded-md border border-gray-300 bg-white p-1 text-sm">
                  <button
                    className="flex items-center justify-center rounded p-1 hover:bg-gray-300"
                    title="Edit/Preview"
                    onClick={() => {
                      setIsEditing(!isEditing);
                    }}
                  >
                    {isEditing ? (
                      <>
                        <MdPreview className="mr-1 text-gray-500" />
                        {t('detail.preview')}
                      </>
                    ) : (
                      <>
                        <MdEdit className="mr-1 text-primary-400" />
                        {t('detail.edit')}
                      </>
                    )}
                  </button>
                </div>
                {isEditing ? (
                  <MarkdownRenderer.Edit />
                ) : (
                  <MarkdownRenderer.Preview className="prose w-full max-w-none rounded-lg bg-white p-4 dark:prose-invert dark:bg-gray-900" />
                )}
                <div
                  className={clsx(
                    (session?.urlToInfo.length || 0) > 0 &&
                      '-mb-4 -ml-4 -mr-4 mt-8 h-fit rounded-bl-lg rounded-br-lg border-t p-4'
                  )}
                >
                  {session?.urlToInfo.map((item, index) => (
                    <a
                      key={index}
                      className="block break-all px-4 py-2 text-sm text-gray-700 hover:text-primary-400"
                      href={item.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {index + 1}. 【{item.title}】{item.url}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer chinese={language === 'zh'} />
      </div>

      <Modal
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size="5xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t('process.success')}</ModalHeader>
              <ModalBody className="overflow-hidden px-0 pr-1">
                <div className="container mx-auto h-full min-h-[300px] w-full overflow-y-auto bg-white p-4">
                  <MarkdownRenderer
                    markdown={session.middleInfo}
                    setMdContent={() => {}}
                  >
                    <MarkdownRenderer.Preview
                      scrollToBottom
                      className="prose mx-auto h-full break-all"
                    />
                  </MarkdownRenderer>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </MarkdownRenderer>
  );
}
