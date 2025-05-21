import "../styles/globals.css";
import "../styles/quiz.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>HR Ascend Press</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
