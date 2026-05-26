import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const INDIAN_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'sa', label: 'Sanskrit', nativeLabel: 'संस्कृतम्' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली' },
  { code: 'sd', label: 'Sindhi', nativeLabel: 'سنڌي' },
  { code: 'ks', label: 'Kashmiri', nativeLabel: 'کٲشُر' },
  { code: 'mai', label: 'Maithili', nativeLabel: 'मैथिली' },
  { code: 'gom', label: 'Konkani', nativeLabel: 'कोंकणी' },
  { code: 'mni-Mtei', label: 'Manipuri', nativeLabel: 'ꯃꯩꯇꯩꯂꯣꯟ' },
  { code: 'sat-Latn', label: 'Santali', nativeLabel: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'doi', label: 'Dogri', nativeLabel: 'डोगरी' },
  { code: 'brx', label: 'Bodo', nativeLabel: 'बर\u200dआ' },
];

const LanguageContext = createContext({
  language: 'en',
  languages: INDIAN_LANGUAGES,
  setLanguage: () => {},
  currentLang: INDIAN_LANGUAGES[0],
});

export const useLanguage = () => useContext(LanguageContext);

function setCookie(name, value) {
  const d = new Date();
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function triggerGoogleTranslate(langCode) {
  if (langCode === 'en') {
    setCookie('googtrans', '/en/en');
    const iframe = document.querySelector('.goog-te-banner-frame');
    if (iframe) {
      const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iDoc) {
        const restoreBtn = iDoc.querySelector('.goog-te-banner-content button');
        if (restoreBtn) restoreBtn.click();
      }
    }
  }
  const selectEl = document.querySelector('.goog-te-combo');
  if (selectEl) {
    selectEl.value = langCode;
    selectEl.dispatchEvent(new Event('change'));
    return true;
  }
  return false;
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('vakilsetu_lang');
    return saved || 'en';
  });

  const currentLang = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    localStorage.setItem('vakilsetu_lang', code);
    if (code === 'en') {
      setCookie('googtrans', '');
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
      }, 300);
    } else {
      setCookie('googtrans', `/en/${code}`);
      const done = triggerGoogleTranslate(code);
      if (!done) {
        let tries = 0;
        const interval = setInterval(() => {
          tries++;
          const ok = triggerGoogleTranslate(code);
          if (ok || tries > 20) clearInterval(interval);
        }, 300);
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('vakilsetu_lang');
    if (saved && saved !== 'en') {
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        const ok = triggerGoogleTranslate(saved);
        if (ok || tries > 30) clearInterval(interval);
      }, 300);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, languages: INDIAN_LANGUAGES, setLanguage, currentLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { INDIAN_LANGUAGES };
