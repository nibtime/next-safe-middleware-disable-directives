import {
  chain,
  nextSafe,
  strictDynamic,
  reporting,
  pullCspFromResponse,
  pushCspToResponse,
} from '@next-safe/middleware';

const isDev = process.env.NODE_ENV === 'development';
const reportOnly = !!process.env.CSP_REPORT_ONLY;

const nextSafeMiddleware = nextSafe((req) => {
  return {
    isDev,
    contentSecurityPolicy: {
      reportOnly,
      'frame-ancestors': 'https://stackblitz.com',
    },
    // customize as you need: https://trezy.gitbook.io/next-safe/usage/configuration
  };
});

/** @type {import('@next-safe/middleware').Middleware} */
const clearCspDirectives = (req, evt, res) => {
  let csp = pullCspFromResponse(res) ?? {};
  csp['default-src'] = undefined;
  csp['font-src'] = undefined;
  csp['style-src'] = undefined;
  csp['img-src'] = undefined;
  pushCspToResponse(csp, res);
};

const reportingMiddleware = reporting((req) => {
  const nextApiReportEndpoint = `/api/reporting`;
  return {
    csp: {
      reportUri: process.env.CSP_REPORT_URI || nextApiReportEndpoint,
    },
    reportTo: {
      max_age: 1800,
      endpoints: [
        {
          url: process.env.REPORT_TO_ENDPOINT_DEFAULT || nextApiReportEndpoint,
        },
      ],
    },
  };
});

export default chain(
  nextSafeMiddleware,
  clearCspDirectives,
  strictDynamic(),
  reportingMiddleware
);
