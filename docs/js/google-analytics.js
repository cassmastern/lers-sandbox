// load gtag.js
(function() {
  // GA4 Measurement ID
  var GA_MEASUREMENT_ID = 'G-GD2XWDMP2E';

  // Load the GA4 library
  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(gtagScript);

  // Initialize gtag function after library loads
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
})();
