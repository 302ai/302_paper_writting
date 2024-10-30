import type { Metadata, ResolvingMetadata } from 'next';

import { cookies, headers } from 'next/headers';

import HomePage from '@/components/page/home-page';
import { detectLocale, locales } from '@/utils/detectLocale';

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headers_ = headers();
  const hostname = headers_.get('host');

  const cookies_ = cookies();

  const preferredLanguage = cookies_.get('preferredLanguage')?.value;

  const previousImages = (await parent).openGraph?.images || [];

  const info = {
    zh: {
      title: 'AI论文写作',
      description: '轻松撰写论文，让学术创作更简单',
      image: 'images/pose_zh.jpg',
    },
    en: {
      title: 'AI Paper Writing',
      description: 'Easily write papers, making academic creation simpler',
      image: 'images/pose_en.jpg',
    },
    ja: {
      title: 'AI論文作成',
      description: '論文を簡単に作成し、学術的な作成をよりシンプルにします',
      image: 'images/pose_ja.jpg',
    },
  };

  let locale = detectLocale(
    (searchParams && (searchParams.lang as string)) ||
      preferredLanguage ||
      params.locale ||
      'en'
  ) as keyof typeof info;

  if (!(locale in info)) {
    locale = 'en';
  }
  const baseUrl = (hostname as string).includes('localhost')
    ? 'http://localhost:3000'
    : `https://${hostname}`;

  return {
    title: info[locale as keyof typeof info].title,
    description: info[locale as keyof typeof info].description,
    alternates: {
      canonical: `${baseUrl}/?lang=${locale}`,
      languages: locales
        .filter((item) => item !== locale)
        .map((item) => ({
          [item]: `${baseUrl}/?lang=${item}`,
        }))
        .reduce((acc, curr) => Object.assign(acc, curr), {}),
    },
    openGraph: {
      url: `${baseUrl}/?lang=${locale}`,
      images: [
        `${baseUrl}/${info[locale as keyof typeof info].image}`,
        ...previousImages,
      ],
    },
    twitter: {
      site: (hostname as string).includes('localhost')
        ? `http://localhost:3000/?lang=${locale}`
        : `https://${hostname}/?lang=${locale}`,
      images: [
        `${baseUrl}/${info[locale as keyof typeof info].image}`,
        ...previousImages,
      ],
    },
  };
}
export default function Home() {
  return <HomePage />;
}
