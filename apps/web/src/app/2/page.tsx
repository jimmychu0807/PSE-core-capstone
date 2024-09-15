import styles from "../page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles["main"]}>
      <h3>page2</h3>
      <Link href="/1">Back</Link>
    </main>
  );
}
