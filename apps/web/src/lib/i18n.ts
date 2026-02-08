import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonIt from '../../public/locales/it/common.json';
import authIt from '../../public/locales/it/auth.json';
import clientsIt from '../../public/locales/it/clients.json';
import invoicesIt from '../../public/locales/it/invoices.json';
import dashboardIt from '../../public/locales/it/dashboard.json';
import settingsIt from '../../public/locales/it/settings.json';

import commonEn from '../../public/locales/en/common.json';
import authEn from '../../public/locales/en/auth.json';
import clientsEn from '../../public/locales/en/clients.json';
import invoicesEn from '../../public/locales/en/invoices.json';
import dashboardEn from '../../public/locales/en/dashboard.json';
import settingsEn from '../../public/locales/en/settings.json';

const resources = {
  it: {
    common: commonIt,
    auth: authIt,
    clients: clientsIt,
    invoices: invoicesIt,
    dashboard: dashboardIt,
    settings: settingsIt,
  },
  en: {
    common: commonEn,
    auth: authEn,
    clients: clientsEn,
    invoices: invoicesEn,
    dashboard: dashboardEn,
    settings: settingsEn,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('devdash-locale') || 'it',
  fallbackLng: 'it',
  ns: ['common', 'auth', 'clients', 'invoices', 'dashboard', 'settings'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
