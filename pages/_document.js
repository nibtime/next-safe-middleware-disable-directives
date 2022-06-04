import { provideComponents } from '@next-safe/middleware/dist/document';
import Document, { Html, Main } from 'next/document';
import React from 'react';
import { lazyGetCssText } from 'stitches.config';

const InterVar = `@font-face {
  font-family: 'Inter var';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter-roman.var.3.18.woff2') format('woff2');
  font-named-instance: 'Regular';
}
@font-face {
  font-family: 'Inter var';
  font-style: italic;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter-italic.var.3.18.woff2') format('woff2');
  font-named-instance: 'Italic';
}`;

// weirdness: when running on Vercel, the response header set by middleware
// will be found in req, when serving a prod build with next start, it will be in res
const getCtxHeader = (ctx, header) => {
  return (
    ctx.res?.getHeader(header) ||
    ctx.req?.headers[header] ||
    ''
  ).toString();
};

const CSP_NONCE_HEADER = 'csp-nonce';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const nonce = getCtxHeader(ctx, CSP_NONCE_HEADER);
    if (nonce) {
      return { ...initialProps, nonce };
    }
    return initialProps;
  }
  render() {
    // those components are automagically wired with provideHashesOrNonce
    const { Head, NextScript } = provideComponents(this.props);
    return (
      <Html>
        <Head>
          <script>{`console.log('Hello from _document/Head, I get nonced/hashed there')`}</script>
          <style dangerouslySetInnerHTML={{ __html: InterVar }} />
          <style
            id="stitches"
            dangerouslySetInnerHTML={{
              __html: lazyGetCssText(this.props.__NEXT_DATA__.page),
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* do this with <Script strategy="afterInteractive"> from next/script in _app.js*/}
          <script
            dangerouslySetInnerHTML={{
              __html: `console.log('I will always be blocked by a strict CSP')`,
            }}
          />
        </body>
      </Html>
    );
  }
}
