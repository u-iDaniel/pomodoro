import Script from "next/script";

const AdSense = () => {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.ADSENSE_ID}`}
      crossOrigin="anonymous"
    />
  );
};

export default AdSense;
