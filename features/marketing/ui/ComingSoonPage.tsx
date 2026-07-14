import Image from "next/image";
import Link from "next/link";
import { appRoutes } from "@/common/lib/appRoutes";
import styles from "@/features/marketing/ui/ComingSoonPage.module.css";

export function ComingSoonPage() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#coming-soon-content">
        Skip to content
      </a>

      <section className={styles.shell} id="coming-soon-content">
        <Link aria-label="SlideX home" className={styles.brand} href="/">
          <Image alt="SlideX" height={72} priority src="/logo.png" width={260} />
        </Link>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.status}>
              <span aria-hidden="true" />
              Coming soon
            </p>
            <h1>Workspace access is coming soon</h1>
            <p className={styles.description}>
              We&apos;re finishing the sign-in experience. Until then, the Live Demo remains available.
            </p>
            <p className={styles.descriptionZh} lang="zh-Hant">
              登入功能暫時關閉，我們正在完成最後的使用細節。
            </p>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href={appRoutes.liveDemo}>
              Open Live Demo
            </Link>
            <Link className={styles.secondaryAction} href="/">
              Back to home
            </Link>
          </div>

          <p className={styles.note}>Sign-in will return when the workspace is ready.</p>
        </div>

        <p className={styles.legal}>
          View the <Link href="/en/terms/">Terms</Link> and <Link href="/en/privacy/">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
