import styles from '../page.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <main className={styles['main']}>
      <h3>page1</h3>
      <Link href="/">Back</Link>
      <Link href="/2">Next Page</Link>
    </main>
  )
}
