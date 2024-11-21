import Image from "next/image";
import Head from "next/head";
import DNSResolver from "../app/components/DNSResolver";
import styles from "../app/styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>DNS Simulator</title>
        <meta
          name="description"
          content="A simple DNS resolution simulator built with Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <DNSResolver />
      </main>
    </div>
  );
}
