import 'i18next';

import common from '../../public/locales/it/common.json';
import auth from '../../public/locales/it/auth.json';
import clients from '../../public/locales/it/clients.json';
import invoices from '../../public/locales/it/invoices.json';
import dashboard from '../../public/locales/it/dashboard.json';
import settings from '../../public/locales/it/settings.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      auth: typeof auth;
      clients: typeof clients;
      invoices: typeof invoices;
      dashboard: typeof dashboard;
      settings: typeof settings;
    };
  }
}
