'use server';
import { createStreamableValue } from 'ai/rsc';
import { events } from 'fetch-event-stream';

import { paperWritingURL } from '@/config/mode';

interface Options {
  apiKey: string;
  language: string;
  model: string;
  query: string;
}
export async function generatePaperWriting({
  apiKey,
  language,
  model,
  query,
}: Options) {
  const stream = createStreamableValue<string>(undefined);

  (async () => {
    try {
      let abort = new AbortController();

      if (!paperWritingURL) {
        return;
      }

      const res = await fetch(paperWritingURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          api_key: apiKey,
          model,
          language,
        }),
        signal: abort.signal,
      });

      let apiStream = events(res, abort.signal);
      const initState = {
        event: 'init',
        data: query,
      };

      stream.update(JSON.stringify(initState));

      for await (const event of apiStream) {
        if (event.data?.includes('error')) {
          stream.error(
            JSON.stringify({
              event: 'error',
              data: 'Backend api error.',
            })
          );
        } else {
          stream.update(event.data || '');
        }
      }
    } catch (error) {
      stream.error(
        JSON.stringify({
          event: 'error',
          data: 'Error occurred while generating paper writing.',
        })
      );
    } finally {
      stream.done();
    }
  })();

  return { output: stream.value };
}

export async function downloadPdf(url: string, fileName: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }
    const pdfBuffer = await response.arrayBuffer();

    const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
      body: base64Pdf,
    };
  } catch (error) {
    console.error('Download failed:', error);

    return {
      status: 500,
      body: 'Download failed',
    };
  }
}
