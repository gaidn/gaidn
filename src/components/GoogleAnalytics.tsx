'use client';

import Script from 'next/script';

export default function GoogleAnalytics(): JSX.Element {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-TQ53W07GV6"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-TQ53W07GV6');
        `}
      </Script>
    </>
  );
}