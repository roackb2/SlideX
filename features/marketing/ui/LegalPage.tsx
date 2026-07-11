"use client";

import { useI18n } from "@/common/lib/I18nProvider";

type LegalPageProps = {
  kind: "privacy" | "terms";
};

type LegalSection = {
  body: string;
  title: string;
};

export function LegalPage({ kind }: LegalPageProps) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const isPrivacy = kind === "privacy";

  const termsSections: LegalSection[] = isZh
    ? [
        { title: "接受條款", body: "使用 SlideX Pitch 即表示你同意遵守本條款，以及在服務中向你提供的任何適用規則。" },
        { title: "帳號與存取", body: "你應提供正確資訊並妥善保護帳號。你不得以未獲授權的方式存取服務、帳號或資料。" },
        { title: "你的內容", body: "你保有自己建立或上傳內容的權利。你授權我們僅在提供、維護與改善服務所必要的範圍內處理這些內容。" },
        { title: "可接受的使用", body: "不得上傳或傳送違法、侵權、惡意程式、具欺騙性，或會干擾服務與他人權利的內容。" },
        { title: "服務變更與終止", body: "我們可能更新、暫停或停止服務的部分功能。若因違反條款或保護服務安全而有必要，我們可限制或終止存取。" },
        { title: "責任限制", body: "在適用法律允許的範圍內，服務依現況提供。請自行保留重要內容的副本，並在分享或發布前審閱輸出結果。" },
        { title: "聯絡與更新", body: "我們可能更新本條款。重大變更會在服務中以合理方式通知。若有問題，請使用服務內提供的支援方式聯絡我們。" }
      ]
    : [
        { title: "Accepting these terms", body: "By using SlideX Pitch, you agree to these terms and to any applicable rules presented to you in the service." },
        { title: "Accounts and access", body: "Keep your account information accurate and protect your access credentials. Do not access the service, accounts, or data without authorization." },
        { title: "Your content", body: "You retain rights in the content you create or upload. You authorize us to handle it only as needed to provide, maintain, and improve the service." },
        { title: "Acceptable use", body: "Do not upload or transmit unlawful, infringing, malicious, deceptive, or disruptive content that interferes with the service or other people’s rights." },
        { title: "Service changes and termination", body: "We may update, suspend, or discontinue part of the service. We may restrict or end access when needed to address a breach of these terms or protect service security." },
        { title: "Limits of responsibility", body: "To the extent permitted by law, the service is provided as available. Keep copies of important content and review exported material before sharing or publishing it." },
        { title: "Contact and updates", body: "We may update these terms. Material changes will be communicated through the service in a reasonable way. Use the support method provided in the service for questions." }
      ];

  const privacySections: LegalSection[] = isZh
    ? [
        { title: "本政策涵蓋的資料", body: "這包括你提供的帳號資訊、你在服務中建立的內容、你主動提供的支援訊息，以及維持服務運作所需的裝置與使用資訊。" },
        { title: "使用目的", body: "我們只在提供與保護服務、回應支援需求、改善可靠性，以及履行法律義務所必要的範圍內處理個人資料。" },
        { title: "儲存與保留", body: "我們會在提供服務、處理爭議、遵守法律或達成正當營運目的所需期間保留資料。資料不再需要時，會依適用情況刪除或去識別化。" },
        { title: "分享與服務供應商", body: "我們不出售個人資料。我們可能只在提供服務所必要時，與受適當保密與安全義務約束的服務供應商分享資料。" },
        { title: "你的選擇與權利", body: "你可以依適用法律要求查詢、閱覽、更正、停止處理或刪除你的個人資料。請使用服務內提供的支援方式提出申請。" },
        { title: "安全與跨境處理", body: "我們採取合理的技術與組織措施保護資料。服務可能使用位於你所在國家或地區以外的基礎設施，並會依適用法律處理。" },
        { title: "政策更新", body: "本政策可能隨服務演進而更新。重大改變會以合理方式通知，並在本頁更新日期。" }
      ]
    : [
        { title: "Information covered by this policy", body: "This includes account information you provide, content you create in the service, support messages you send, and device or usage information needed to operate the service." },
        { title: "Why we use information", body: "We handle personal information only as needed to provide and protect the service, respond to support requests, improve reliability, and meet legal obligations." },
        { title: "Storage and retention", body: "We retain information for as long as needed to provide the service, resolve disputes, comply with law, or meet legitimate operational needs. When no longer needed, information is deleted or de-identified as appropriate." },
        { title: "Sharing and service providers", body: "We do not sell personal information. We may share information with service providers only when needed to provide the service and subject to appropriate confidentiality and security obligations." },
        { title: "Your choices and rights", body: "Subject to applicable law, you may request access, review, correction, cessation of processing, or deletion of your personal information. Use the support method provided in the service to make a request." },
        { title: "Security and cross-border processing", body: "We use reasonable technical and organizational safeguards. The service may use infrastructure outside your country or region and will handle that processing in accordance with applicable law." },
        { title: "Policy updates", body: "This policy may change as the service evolves. Material changes will be communicated in a reasonable way and reflected by the date on this page." }
      ];

  const sections = isPrivacy ? privacySections : termsSections;
  const title = isPrivacy ? (isZh ? "隱私權政策" : "Privacy Policy") : isZh ? "使用條款" : "Terms of Use";
  const intro = isPrivacy
    ? isZh
      ? "這份政策說明 SlideX Pitch 如何處理和保護與服務有關的個人資料。"
      : "This policy explains how SlideX Pitch handles and protects personal information connected with the service."
    : isZh
      ? "這些條款說明使用 SlideX Pitch 時，你與服務之間的基本規則。"
      : "These terms describe the basic rules between you and SlideX Pitch when you use the service.";

  return (
    <main className="min-h-[100dvh] bg-[#0b0c0f] px-5 pb-24 pt-28 text-[#f4f4f1] sm:px-7 lg:px-10 lg:pt-36">
      <section className="mx-auto max-w-4xl">
        <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#79b6ff]">SlideX</p>
        <h1 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">{title}</h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-white/59">{intro}</p>
        <p className="mt-8 text-[13px] text-white/38">{isZh ? "最後更新：2026 年 7 月 11 日" : "Last updated: July 11, 2026"}</p>
      </section>

      <section className="mx-auto mt-16 max-w-4xl border-t border-white/[0.09] pt-3 lg:mt-20">
        {sections.map((section) => (
          <article className="grid gap-3 border-b border-white/[0.09] py-7 md:grid-cols-[0.35fr_0.65fr] md:gap-8" key={section.title}>
            <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-white">{section.title}</h2>
            <p className="text-[15px] leading-7 text-white/52">{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
