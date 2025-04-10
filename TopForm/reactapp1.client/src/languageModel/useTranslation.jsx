import { useSelector } from 'react-redux';
import { selectCurrentLanguage, selectTranslations } from './languageSlice';

export const useTranslation = () => {
  const currentLanguage = useSelector(selectCurrentLanguage);
  const translations = useSelector(selectTranslations);
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };
  
  return { t, currentLanguage };
};