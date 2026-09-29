import translations from '../data/translations.json';
import { Language } from '../types';

export const t = (key: string, lang: Language): string => {
  const dict = (translations as any)[lang] || (translations as any)['en'];
  return dict[key] || (translations as any)['en'][key] || key;
};
