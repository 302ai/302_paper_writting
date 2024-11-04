'use client';

import { REGION } from '@/config/mode';
import { useLanguageContext } from '@/providers/language-provider';

interface Props {
  chinese: boolean;
}

export default function Footer({ chinese }: Props) {
  const { t } = useLanguageContext();

  const region = REGION;

  return (
    <div
      className="my-3 flex min-w-[375px] flex-col items-center justify-center"
      style={{ color: 'rgb(102, 102, 102)', fontSize: '12px' }}
    >
      <div>{t('footer.ai')}</div>
      <div className="flex items-center justify-center gap-1">
        Powered By
        <a
          href={region ? 'https://302.ai/' : 'https://302ai.cn/'}
          rel="noreferrer"
          target="_blank"
        >
          <img
            alt="gpt302"
            className="object-contain"
            src="https://file.302.ai/gpt/imgs/91f7b86c2cf921f61e8cf9dc7b1ec5ee.png"
            width="55"
          />
        </a>
      </div>
    </div>
  );
}
