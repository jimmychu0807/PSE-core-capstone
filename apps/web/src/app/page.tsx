import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles["main"]}>
      Main page
      <Link href="/1">To page 1</Link>
    </main>
  );
}
