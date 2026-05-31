export type Locale = "zh-TW" | "en";

export const locales: Locale[] = ["zh-TW", "en"];
export const defaultLocale: Locale = "zh-TW";
export const localeStorageKey = "slidex-locale";

export const dictionaries = {
  "zh-TW": {
    metadata: {
      title: "SlideX — 動態簡報系統",
      description: "用 MDX 場景設計動態簡報。編輯場景、預覽動效，並匯出序列。"
    },
    common: {
      productName: "SlideX",
      openStudio: "開啟 Studio",
      download: "下載",
      viewPresets: "查看範本"
    },
    nav: {
      homeLabel: "SlideX 首頁",
      resources: "文件",
      templates: "範本",
      download: "下載",
      mobileDescription: "設計可動畫的 MDX 場景簡報。",
      openMenu: "開啟選單",
      closeMenu: "關閉選單",
      languageLabel: "切換語言",
      localeShortLabel: "繁中"
    },
    footer: {
      homeLabel: "SlideX 首頁",
      description: "把原始碼、時間軸與匯出流程放在同一處的動態簡報工具。",
      product: "產品",
      library: "資源",
      studio: "Studio",
      download: "下載",
      presets: "範本",
      docs: "文件",
      rights: "© 2026 SlideX. 保留所有權利。",
      signature: "MDX Motion Studio"
    },
    thumbnail: {
      fallbackLabel: "範本",
      ariaLabel: (title: string) => `${title} 樣式縮圖`,
      sceneLayers: "場景層",
      layers: ["標題", "指標", "圖表"],
      motionReady: "可加入動效"
    },
    templateMeta: {
      "revenue-command": {
        name: "營收指揮中心",
        category: "午夜藍",
        description: "為營收主管準備的精緻簡報，涵蓋 pipeline 健康度、買方訊號、營運優先級與決策。",
        useCase: "營收檢討、GTM 領導會議、銷售策略"
      },
      "investor-update": {
        name: "投資人更新",
        category: "象牙財務",
        description: "用於績效、市場訊號、風險、資本配置與營運請求的清晰投資人更新簡報。",
        useCase: "董事會、投資人更新、創辦人報告"
      },
      "product-launch-board": {
        name: "產品上市看板",
        category: "石墨綠",
        description: "為定位、受眾、採用訊號、GTM 準備度與上市治理設計的高質感上市策略簡報。",
        useCase: "產品上市、GTM 準備、主管上市檢討"
      },
      "customer-success-qbr": {
        name: "客戶成功 QBR",
        category: "霧面 QBR",
        description: "呈現客戶成果、採用證據、價值實現、續約健康度與下季重點的 QBR 簡報。",
        useCase: "QBR、續約對話、客戶主管會議"
      },
      "saas-operating-review": {
        name: "SaaS 營運檢討",
        category: "電光石板",
        description: "用於 SaaS 表現、留存、產品採用、GTM 執行與風險控管的營運檢討簡報。",
        useCase: "月度業務檢討、SaaS 領導會議、營運規劃"
      },
      "market-entry-strategy": {
        name: "市場進入策略",
        category: "顧問藍",
        description: "用於機會規模、區隔選擇、風險、上市順序與主管核准的顧問式策略簡報。",
        useCase: "市場進入、品類擴張、策略規劃"
      },
      "brand-partnership-pitch": {
        name: "品牌合作提案",
        category: "奢華紫",
        description: "說明受眾契合、活動價值、共同 marketing 證據、經濟效益與下一步的合作提案。",
        useCase: "策略合作、共同 marketing、品牌聯盟"
      },
      "ai-transformation-roadmap": {
        name: "AI 轉型路線圖",
        category: "訊號白",
        description: "為機會選擇、風險控管、營運模型、試點與投資核准設計的主管 AI 路線圖。",
        useCase: "AI 策略、轉型規劃、主管工作坊"
      },
      "black-commercial": {
        name: "黑色董事會",
        category: "黑",
        description: "高質感 12 頁董事會簡報，包含決策框架、市場脈絡、價值池、指標、圖表、風險與主管請求。",
        useCase: "董事會更新、成長策略、企業銷售敘事"
      },
      "white-commercial": {
        name: "白色主管版",
        category: "白",
        description: "精緻 12 頁主管提案，包含顧問式架構、清晰指標、客戶證據、導入邏輯與明確決策頁。",
        useCase: "客戶提案、投資人更新、季度業務檢討"
      }
    },
    home: {
      hero: {
        eyebrow: "SlideX Studio",
        title: "不用重做的動態簡報。",
        body: "用 MDX 組合場景、調整節奏、預覽動效，並在同一個 Studio 裡匯出簡報。",
        primary: "下載",
        secondary: "查看範本",
        checkpoints: ["撰寫", "預覽", "匯出"]
      },
      heroStudio: {
        title: "Studio",
        project: "Project Alpha",
        export: "匯出",
        newSlide: "新增投影片",
        scenes: "場景",
        slides: ["備忘錄", "訊號", "計畫", "請求"],
        layers: ["標題", "敘事", "動能圖表", "決策卡片"],
        sceneLabel: "場景 01",
        slideTitle: "成長投資備忘錄",
        slideBody: "用節奏清楚的證據、動效提示與可匯出的結構，整理一個精簡決策故事。",
        toolLabels: ["標題", "文字", "卡片", "圖表", "圖片", "CTA"]
      },
      stats: [
        ["MDX 優先", "簡報後續仍可編輯"],
        ["即時節奏", "邊組合邊預覽動畫"],
        ["可匯出", "交付原始碼、HTML 或擷取序列"]
      ],
      compose: {
        title: "像寫軟體一樣組簡報。",
        body: "SlideX 把簡報工作變成可重用的場景、即時預覽與團隊能維護的輸出。",
        sourceLabel: "MDX 場景原始碼",
        codeTitle: "成長投資備忘錄",
        timelineLabel: "預覽時間軸",
        timelineItems: ["標題淡入", "圖表上升", "決策卡片"],
        templateTitle: "從範本開始",
        templateBody: "載入完整場景簡報，快速建立檢討、上市、更新與 QBR。",
        blockTitle: "受控的區塊套件",
        blockBody: "標題、卡片、圖表、媒體與動作共用同一套時間模型。",
        polishTitle: "簡報質感仍可編輯",
        polishBody: "動效能承受反覆修改，因為簡報仍是文件，而不是被壓平的畫面。"
      },
      workflow: {
        title: "從草稿到播放的一條流程。",
        body: "寫一次、調整節奏，讓完成後的故事保持可攜。",
        items: [
          {
            title: "撰寫敘事",
            body: "從可編輯的 MDX 場景開始，不必再用形狀重建投影片。"
          },
          {
            title: "調整動效",
            body: "在簡報可播放的狀態下，調整時間、圖層與節奏。"
          },
          {
            title: "打包輸出",
            body: "讓原始碼、預覽與匯出序列都對齊同一個 Studio。"
          }
        ]
      },
      presets: {
        title: "從有用的簡報開始。",
        body: "範本是完整場景系統，不是空白主題。選一個、改寫故事，保留動效。"
      },
      downloadTeaser: {
        title: "Mac 下載版是下一步。",
        body: "我們正在準備未來的 macOS 版本，會把 Mac 專案、版本資訊與安裝流程集中在這裡。",
        cta: "查看下載頁",
        cardTitle: "SlideX for macOS",
        status: "即將推出",
        items: ["通用 App", "Mac 專案", "匯出流程"]
      }
    },
    templatesPage: {
      hero: {
        eyebrow: "簡報範本",
        title: "內建動效的實用簡報。",
        body: "從完整的 MDX 場景簡報開始，適合檢討、上市、董事會更新與客戶故事。",
        primary: "開啟 Studio",
        secondary: "查看範本"
      },
      featured: {
        label: "精選範本",
        open: "開啟",
        deckLabel: "MDX 簡報"
      },
      stats: [
        ["完整場景", "結構、文案節奏、時間與視覺方向都已建立。"],
        ["可編輯原始碼", "一切維持 MDX，讓團隊能改寫故事。"],
        ["匯出路徑", "用同一棵場景樹進行播放與擷取。"]
      ],
      gallery: {
        title: "選最接近的故事。",
        body: "這個範本庫依照商業情境整理，而不是依照裝飾風格。",
        steps: [
          ["01", "選一份簡報"],
          ["02", "改寫場景"],
          ["03", "預覽節奏"]
        ]
      },
      startingPoint: {
        title: "範本是起點。",
        body: "開啟一份簡報，保留動效語法，換成你的真實故事。",
        items: [
          ["場景結構", "完整簡報大綱與已設定時間的段落。"],
          ["動效預設", "進場、延遲與持續時間都已調整好。"],
          ["MDX 原始碼", "團隊能閱讀與維護的原始碼。"]
        ]
      },
      cta: {
        title: "今天就從範本開始。",
        body: "把簡報載入 Studio、編輯場景，並保留整套動效系統。",
        button: "開啟 Studio"
      }
    },
    resourcesPage: {
      heroVisual: {
        label: "資源",
        codeTitle: "動態設計資源",
        codeBody: "場景模型、工作流程、匯出路徑。",
        cards: [
          ["Scene", "計時頁面"],
          ["Layer", "動效區塊"],
          ["Export", "可攜輸出"]
        ]
      },
      hero: {
        eyebrow: "文件",
        title: "理解場景系統。",
        body: "集中整理 MDX 場景、元件語法、Studio 流程、鍵盤操作與匯出方向。",
        primary: "查看 MDX 語法",
        secondary: "開啟 Studio"
      },
      resourceItems: [
        {
          title: "MDX 語法",
          description: "完整的 Scene、文字、資料、圖片與常用 props 寫法。",
          href: "/resources/mdx",
          label: "語法"
        },
        {
          title: "場景元件",
          description: "Scene、Title、Text、Card、Metric、Chart、ImageBlock 與時間 props 的參考。",
          href: "/resources#components",
          label: "參考"
        },
        {
          title: "簡報範本",
          description: "可重用的 MDX 投影片簡報，適合產品故事、功能導覽、課程與輪播。",
          href: "/templates",
          label: "範本"
        },
        {
          title: "Studio 流程",
          description: "用場景列表、MDX 編輯器、預覽與時間軸設計動態簡報。",
          href: "/studio",
          label: "Studio"
        }
      ],
      docsIntro: {
        title: "文件跟著建置流程走。",
        body: "先理解場景模型，再進入組合方式，最後準備輸出路徑。"
      },
      docSections: [
        {
          title: "場景模型",
          description: "SlideX 把簡報視為可編輯原始碼的 MDX 場景簡報。",
          points: [
            "每個 Scene 定義一個計時頁面。",
            "Title、Text、Card、Metric、Chart 與 ImageBlock 都可接收 enter、delay、duration props。",
            "同一份 MDX 簡報驅動場景列表、預覽、時間軸與匯出。"
          ]
        },
        {
          title: "設計循環",
          description: "Studio 讓原始碼、場景導覽、預覽與時間軸輸出保持同步。",
          points: [
            "載入簡報範本或插入單一場景區塊。",
            "編輯 MDX 原始碼來控制進階組合。",
            "Replay 只重置動畫 key，不會改變組合內容。"
          ]
        },
        {
          title: "匯出方向",
          description: "影片匯出是發布目標，而核心產品仍是動態設計工具。",
          points: [
            "場景 duration 會對應到時間軸片段。",
            "預覽畫布可以成為瀏覽器擷取目標。",
            "renderer 可以使用同一棵 MDX 場景樹輸出影片。"
          ]
        }
      ],
      syntax: {
        eyebrow: "MDX 文件",
        backLabel: "返回文件",
        sideNavTitle: "文件導覽",
        docsHomeLabel: "文件首頁",
        studioLinkLabel: "Studio",
        onThisPageTitle: "本頁內容",
        updatedAt: "最後更新於 2026年5月30日",
        helpfulTitle: "這個頁面有幫助嗎？",
        feedbackLabel: "回到文件首頁",
        nextLabel: "下一步",
        sideNavGroups: {
          start: "入門",
          syntax: "語法",
          reference: "參考"
        },
        overviewTitle: "概覽",
        fileLabel: ".mdx",
        title: "完整 MDX 語法。",
        body: "SlideX 的 MDX 以 Scene 為單位。每個 Scene 可以放入文字、卡片、指標、圖表與圖片，並用 props 控制時間、版面、顏色與位置。",
        overviewPageTitle: "MDX 文件概覽。",
        overviewBody: "先用這頁理解 SlideX 的文件結構、場景模型與編輯路徑，再依照需要進入完整範例、常用寫法與 props 參考。",
        overviewLeadTitle: "一份簡報就是一組可播放的場景。",
        overviewLeadBody: "SlideX 不把投影片當成靜態圖片，而是把每一頁整理成 Scene。你可以用 Markdown 命名簡報，用 MDX 元件描述畫面，再用時間 props 控制動畫節奏。",
        overviewCodeTitle: "最小場景",
        overviewCode: `<Scene duration={5} theme="dark">
  <Title enter="fadeUp">
    Launch Review
  </Title>
  <Text delay={0.2}>
    一頁一個 Scene，區塊負責內容與節奏。
  </Text>
</Scene>`,
        overviewCards: [
          {
            title: "先看完整範例",
            body: "從一份可直接貼進 Studio 的 Scene 開始，了解標題、文字、指標與圖表如何組合。"
          },
          {
            title: "拆解常用寫法",
            body: "查看文件、文字、資料、圖片與定位的常見語法，適合邊寫邊對照。"
          },
          {
            title: "查詢 props",
            body: "快速確認 duration、theme、enter、delay、x/y/w/h 等常用屬性的用途。"
          },
          {
            title: "理解解析規則",
            body: "掌握 parser 支援的標籤形式、數字解析與 Markdown heading 行為。"
          }
        ],
        overviewReferenceTitle: "接下來看哪裡？",
        overviewReferenceBody: "依照你正在做的工作選一個章節：想先跑起來就看範例，想查語法就看 props 與解析規則。",
        overviewWorkflowTitle: "建議閱讀順序",
        overviewWorkflowBody: "文件不需要一次讀完。先理解場景，再從範例改起，最後回來查 props。",
        overviewWorkflowSteps: [
          ["01", "建立場景", "用 # 命名簡報，再用 Scene 或 Slide 切出每一頁。"],
          ["02", "放入區塊", "用 Title、Text、Card、Metric、Chart 與 ImageBlock 描述畫面內容。"],
          ["03", "調整節奏", "用 enter、delay、duration 和座標 props 控制動畫與版面。"]
        ],
        rules: [
          "每份文件可以用 # 作為簡報標題。",
          "每個 <Scene> 或 <Slide> 都需要 duration，單位為秒。",
          "文字元件使用成對標籤；資料、圖片與圖表使用 self-closing 標籤。",
          "x、y、w、h 使用百分比座標，適合精準控制簡報版面。"
        ],
        patternsTitle: "常用寫法",
        patternsBody: "以下範例可以直接貼進 Studio，再依照內容、顏色與版面需求微調 props。",
        fullExampleTitle: "完整範例",
        exampleBody: "這是一份完整的 MDX 場景，可以作為新簡報的起點。它包含標題、輔助文字、指標與圖表，並示範常見的時間與版面 props。",
        fullExample: `# 季度業務檢討

<Scene duration={6} theme="dark" accent="#8ea5ff" layout="default" alignX="left" alignY="center">
  <Title enter="fadeUp" fontSize={72} x={8} y={12} w={64} h={18}>
    成長檢討
  </Title>
  <Text enter="fadeUp" delay={0.2} fontSize={24} x={8} y={34} w={52} h={16}>
    把討論聚焦在動能、風險與下一個決策。
  </Text>
  <Metric label="ARR" value="+42%" caption="過去十二個月成長。" enter="fadeUp" delay={0.3} x={8} y={56} w={28} h={24} />
  <Chart title="Pipeline 品質" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" height={144} enter="fadeUp" delay={0.35} x={40} y={52} w={48} h={34} />
</Scene>`,
        groups: [
          {
            title: "文件與場景",
            body: "用 Markdown 標題命名簡報，再用 Scene 或 Slide 切出每一頁。",
            code: `# Launch Review

<Scene duration={5} theme="light" background="#f8fafc" accent="#2563eb">
  ...
</Scene>

<Slide duration={4} theme="dark">
  ...
</Slide>`
          },
          {
            title: "文字與動效",
            body: "Title 與 Text 使用成對標籤，文字會被 parser 正規化成單行內容。",
            code: `<Title enter="fadeUp" fontSize={72} textAlign="left">
  Board-ready story
</Title>

<Text enter="slideLeft" delay={0.2} duration={0.7} fontSize={24}>
  Explain the decision with one clear supporting sentence.
</Text>`
          },
          {
            title: "資料區塊",
            body: "Card、Metric、Chart 使用屬性描述內容，適合決策證據、數字與趨勢。",
            code: `<Metric label="Retention" value="119%" caption="Expansion remains healthy." width="sm" />

<Card icon="BadgeCheck" layout="horizontal" title="Proof point" text="Use one concrete reason for confidence." width="lg" />

<Chart title="Readiness" labels="Sales,Success,Product" values="82,64,48" height={144} />`
          },
          {
            title: "圖片與精準版面",
            body: "ImageBlock 可放入外部圖片或上傳後的資料 URL，x/y/w/h 可精準控制畫面位置。",
            code: `<ImageBlock src="https://example.com/product.png" alt="Product screenshot" fit="cover" radius={16} x={52} y={16} w={40} h={56} />

<Text x={8} y={72} w={40} h={12} textAlign="center">
  Position with percent-based frame props.
</Text>`
          }
        ],
        propsTitle: "常用 props",
        propsBody: "這些 props 可直接寫在 MDX 標籤上，Studio 會解析成預覽與時間軸資料。",
        propsRows: [
          ["Scene", "duration", "number", "場景長度，單位為秒。"],
          ["Scene", "theme", "dark | light | paper | blue", "設定預設背景與文字對比。"],
          ["Scene", "layout", "default | split-left | split-right", "控制場景主要排版方向。"],
          ["Block", "enter", "fadeIn | fadeUp | zoomIn | slideLeft", "控制進場動畫。"],
          ["Block", "delay", "number", "延遲進場秒數。"],
          ["Block", "x y w h", "number", "百分比座標與尺寸。"],
          ["Text", "fontSize", "number", "覆寫文字大小。"],
          ["Card", "icon", "Lucide name", "顯示支援的圖示名稱。"],
          ["Chart", "labels / values", "comma list", "用逗號分隔標籤與數值。"],
          ["ImageBlock", "fit", "cover | contain | fill | scale-down", "控制圖片填滿方式。"]
        ],
        motionTitle: "動效與解析規則",
        motionBody: "MDX parser 目前支援有限但穩定的語法，適合官網範本與 Studio 編輯。",
        motionRows: [
          ["<Title>...</Title>", "文字型元件必須使用成對標籤。"],
          ["<Card ... />", "資料型元件使用 self-closing 標籤。"],
          ["{72}", "大括號內的純數字會被解析成 number。"],
          ["\"fadeUp\"", "引號內容會被解析成 string。"],
          ["# Heading", "Scene 外的 # 會被當作簡報標題。"],
          ["## Subheading", "Scene 內未包標籤的 ## 會轉成 heading block。"]
        ],
        ctaTitle: "用 Studio 試一份 MDX。",
        ctaBody: "把範例貼進 Studio，調整場景時間與區塊位置，就能快速看到動效預覽。",
        ctaButton: "開啟 Studio"
      },
      components: {
        title: "場景元件參考。",
        body: "小而穩定的元件語彙讓 Studio 可預期，同時支援豐富的簡報作品。",
        notePrefix: "完整維護筆記保留在",
        docPath: "docs/USAGE.zh-TW.md",
        items: [
          ["Scene", "一個簡報時刻的計時頁面容器。"],
          ["Title", "帶有進場與時間 props 的動態標題層。"],
          ["Text", "支援 delay、duration 與版面控制的輔助文字。"],
          ["Card", "用於脈絡與決策的結構化證據區塊。"],
          ["Metric", "用於呈現關鍵指標、數值與短說明。"],
          ["Chart", "用逗號分隔 labels 與 values 的長條圖。"],
          ["ImageBlock", "可放入圖片 URL、alt、fit 與畫面位置。"]
        ]
      },
      cta: {
        title: "準備好建立場景了嗎？",
        body: "開啟 Studio，一邊參考文件一邊塑造第一份簡報。",
        button: "開啟 Studio"
      }
    },
    downloadPage: {
      hero: {
        eyebrow: "下載",
        title: "SlideX for Mac 正在路上。",
        body: "原生 Mac App 正在準備中，未來會支援為 Mac 量身打造的簡報專案、更順暢的預覽，以及可匯出的簡報流程。",
        disabledButton: "Mac App 即將推出",
        secondary: "開啟 Web Studio"
      },
      packageCard: {
        title: "macOS App",
        subtitle: "原生桌面版本",
        status: "即將推出",
        heading: "我們正在準備",
        items: ["已簽署 Mac 安裝程式", "Mac 專案工作流", "預覽與匯出流程", "版本資訊"],
        localTitle: "為 Mac 量身打造",
        localBody: "Mac 版本會延續 Web Studio 的 MDX 場景模型，並針對桌面工作流、專案管理與簡報輸出做更完整的整合。"
      },
      stats: [
        ["原生 Mac App", "桌面版本將支援日常簡報工作。"],
        ["Mac 專案", "為桌面檔案與機密簡報流程而設計。"],
        ["可匯出", "準備支援檢討、播放與擷取流程。"]
      ],
      webStudio: {
        title: "目前先使用 Web Studio。",
        body: "瀏覽器版本現在就能組合場景、測試動效與準備簡報，Mac App 則持續開發中。",
        button: "開啟 Studio"
      }
    }
  },
  en: {
    metadata: {
      title: "SlideX — Motion Design System",
      description: "Design animated presentations as MDX scene decks. Edit scenes, preview motion, and export sequences."
    },
    common: {
      productName: "SlideX",
      openStudio: "Open Studio",
      download: "Download",
      viewPresets: "View Presets"
    },
    nav: {
      homeLabel: "SlideX home",
      resources: "Docs",
      templates: "Presets",
      download: "Download",
      mobileDescription: "Design animated MDX scene decks.",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      languageLabel: "Switch language",
      localeShortLabel: "EN"
    },
    footer: {
      homeLabel: "SlideX home",
      description: "Motion decks for teams that want source, timing, and export in one place.",
      product: "Product",
      library: "Library",
      studio: "Studio",
      download: "Download",
      presets: "Presets",
      docs: "Docs",
      rights: "© 2026 SlideX. All rights reserved.",
      signature: "MDX Motion Studio"
    },
    thumbnail: {
      fallbackLabel: "Preset",
      ariaLabel: (title: string) => `${title} style thumbnail`,
      sceneLayers: "Scene layers",
      layers: ["Title", "Metric", "Chart"],
      motionReady: "Motion ready"
    },
    templateMeta: {
      "revenue-command": {
        name: "Revenue Command Center",
        category: "Midnight Blue",
        description: "A polished revenue leadership deck for pipeline health, buyer signals, operating priorities, and executive decisions.",
        useCase: "Revenue reviews, GTM leadership, sales strategy"
      },
      "investor-update": {
        name: "Investor Update",
        category: "Ivory Finance",
        description: "A crisp investor update deck for performance, market signals, risk, capital priorities, and operating asks.",
        useCase: "Board meetings, investor updates, founder reporting"
      },
      "product-launch-board": {
        name: "Product Launch Board",
        category: "Graphite Green",
        description: "A premium launch strategy deck for positioning, audience clarity, adoption signals, GTM readiness, and launch governance.",
        useCase: "Product launches, GTM readiness, executive launch reviews"
      },
      "customer-success-qbr": {
        name: "Customer Success QBR",
        category: "Mist QBR",
        description: "A refined QBR deck for customer outcomes, adoption evidence, value realization, renewal health, and next-quarter priorities.",
        useCase: "QBRs, renewal conversations, customer executive reviews"
      },
      "saas-operating-review": {
        name: "SaaS Operating Review",
        category: "Electric Slate",
        description: "A sophisticated operating review deck for SaaS performance, retention, product adoption, GTM execution, and risk controls.",
        useCase: "Monthly business reviews, SaaS leadership, operating planning"
      },
      "market-entry-strategy": {
        name: "Market Entry Strategy",
        category: "Consulting Blue",
        description: "A consulting-style market entry deck for opportunity sizing, segment selection, risk, launch sequencing, and executive approval.",
        useCase: "Market entry, category expansion, strategic planning"
      },
      "brand-partnership-pitch": {
        name: "Brand Partnership Pitch",
        category: "Luxury Plum",
        description: "A sleek partnership pitch deck for audience fit, campaign value, co-marketing proof, economics, and next steps.",
        useCase: "Strategic partnerships, co-marketing, brand alliances"
      },
      "ai-transformation-roadmap": {
        name: "AI Transformation Roadmap",
        category: "Signal White",
        description: "An executive AI roadmap deck for opportunity selection, risk controls, operating model, pilots, and investment approval.",
        useCase: "AI strategy, transformation planning, executive workshops"
      },
      "black-commercial": {
        name: "Black Boardroom",
        category: "Black",
        description: "A premium 12-page boardroom deck with decision framing, market context, value pools, metrics, charts, risks, and a clear executive ask.",
        useCase: "Board updates, growth strategy, enterprise sales narratives"
      },
      "white-commercial": {
        name: "White Executive",
        category: "White",
        description: "A polished 12-page executive proposal deck with a consulting-style structure, clean metrics, customer proof, implementation logic, and a precise decision page.",
        useCase: "Client proposals, investor updates, quarterly business reviews"
      }
    },
    home: {
      hero: {
        eyebrow: "SlideX Studio",
        title: "Motion decks without the rebuild.",
        body: "Compose MDX scenes, tune timing, preview motion, and export the deck from one studio.",
        primary: "Download",
        secondary: "View Presets",
        checkpoints: ["Author", "Preview", "Export"]
      },
      heroStudio: {
        title: "Studio",
        project: "Project Alpha",
        export: "Export",
        newSlide: "New slide",
        scenes: "Scenes",
        slides: ["Memo", "Signal", "Plan", "Ask"],
        layers: ["Title", "Narrative", "Momentum chart", "Decision card"],
        sceneLabel: "Scene 01",
        slideTitle: "Growth Investment Memo",
        slideBody: "A concise decision story with paced evidence, motion cues, and export-ready structure.",
        toolLabels: ["Title", "Text", "Card", "Chart", "Image", "CTA"]
      },
      stats: [
        ["MDX-first", "Scenes stay editable after the pitch"],
        ["Live timing", "Preview animations as you compose"],
        ["Export ready", "Ship source, HTML, or captured sequences"]
      ],
      compose: {
        title: "Compose decks like software.",
        body: "SlideX turns presentation work into reusable scenes, live preview, and outputs your team can maintain.",
        sourceLabel: "MDX scene source",
        codeTitle: "Growth Investment Memo",
        timelineLabel: "Preview timeline",
        timelineItems: ["Title fade", "Chart rise", "Decision card"],
        templateTitle: "Template-backed starts",
        templateBody: "Load complete scene decks for reviews, launches, updates, and QBRs.",
        blockTitle: "A controlled block kit",
        blockBody: "Titles, cards, charts, media, and actions share one timing model.",
        polishTitle: "Presentation polish stays editable",
        polishBody: "Motion survives revisions because the deck remains a document, not a pile of flattened frames."
      },
      workflow: {
        title: "One flow from draft to playback.",
        body: "Write once, shape the timing, and keep the finished story portable.",
        items: [
          {
            title: "Write the narrative",
            body: "Start with editable MDX scenes instead of rebuilding slides from shapes."
          },
          {
            title: "Tune the motion",
            body: "Adjust timing, layers, and pacing while the deck stays playable."
          },
          {
            title: "Package the output",
            body: "Keep source, preview, and exported sequences aligned from one studio."
          }
        ]
      },
      presets: {
        title: "Start from a useful deck.",
        body: "Presets are complete scene systems, not blank themes. Pick one, rewrite the story, and keep the motion."
      },
      downloadTeaser: {
        title: "Mac download is next.",
        body: "A future macOS build is being prepared, with Mac project support, release notes, and install guidance collected here.",
        cta: "View Download Page",
        cardTitle: "SlideX for macOS",
        status: "Soon",
        items: ["Universal app", "Mac projects", "Export workflow"]
      }
    },
    templatesPage: {
      hero: {
        eyebrow: "Deck Presets",
        title: "Useful decks with motion built in.",
        body: "Start from complete MDX scene decks for reviews, launches, board updates, and customer stories.",
        primary: "Open Studio",
        secondary: "View Presets"
      },
      featured: {
        label: "Featured preset",
        open: "Open",
        deckLabel: "MDX deck"
      },
      stats: [
        ["Complete scenes", "Structure, copy rhythm, timing, and visual direction."],
        ["Editable source", "Everything stays as MDX so teams can rewrite the story."],
        ["Export path", "Use the same scene tree for playback and capture."]
      ],
      gallery: {
        title: "Choose the closest story.",
        body: "The gallery is organized around business moments, not decorative themes.",
        steps: [
          ["01", "Pick a deck"],
          ["02", "Rewrite scenes"],
          ["03", "Preview timing"]
        ]
      },
      startingPoint: {
        title: "Presets are starting points.",
        body: "Open a deck, keep the motion grammar, and replace the content with your real story.",
        items: [
          ["Scene structure", "A complete deck outline with timed sections."],
          ["Motion defaults", "Enter, delay, and duration choices already tuned."],
          ["MDX source", "Readable source that can be maintained by the team."]
        ]
      },
      cta: {
        title: "Build from a preset today.",
        body: "Load a deck into Studio, edit the scenes, and keep the motion system intact.",
        button: "Open Studio"
      }
    },
    resourcesPage: {
      heroVisual: {
        label: "Resources",
        codeTitle: "Motion Design Resources",
        codeBody: "Scene model, workflow, export path.",
        cards: [
          ["Scene", "Timed page"],
          ["Layer", "Motion block"],
          ["Export", "Portable output"]
        ]
      },
      hero: {
        eyebrow: "Documentation",
        title: "Learn the scene system.",
        body: "A focused hub for MDX scenes, component syntax, Studio workflow, keyboard navigation, and export direction.",
        primary: "View MDX Syntax",
        secondary: "Open Studio"
      },
      resourceItems: [
        {
          title: "MDX Syntax",
          description: "Complete syntax for Scene, text, data, image, and common props.",
          href: "/resources/mdx",
          label: "Syntax"
        },
        {
          title: "Scene Components",
          description: "Reference for Scene, Title, Text, Card, Metric, Chart, ImageBlock, and timing props.",
          href: "/resources#components",
          label: "Reference"
        },
        {
          title: "Deck Presets",
          description: "Reusable MDX slide decks for product stories, feature tours, lessons, and carousels.",
          href: "/templates",
          label: "Presets"
        },
        {
          title: "Studio Workflow",
          description: "Use the scene list, MDX editor, preview, and timeline to design animated presentations.",
          href: "/studio",
          label: "Studio"
        }
      ],
      docsIntro: {
        title: "The docs follow the build loop.",
        body: "Start with the scene model, move through composition, then prepare the output path."
      },
      docSections: [
        {
          title: "Scene Model",
          description: "SlideX treats a presentation as an MDX scene deck with editable source.",
          points: [
            "Each Scene defines one timed page.",
            "Title, Text, Card, Metric, Chart, and ImageBlock layers receive enter, delay, and duration props.",
            "The same MDX deck powers the scene list, preview, timeline, and export."
          ]
        },
        {
          title: "Design Loop",
          description: "The Studio keeps source, scene navigation, preview, and timeline output in sync.",
          points: [
            "Load a deck preset or insert individual scene blocks.",
            "Edit the MDX source for advanced composition control.",
            "Replay resets the animation key without changing the composition."
          ]
        },
        {
          title: "Export Direction",
          description: "Video export is the publishing target, while the core product remains a motion design tool.",
          points: [
            "Scene duration maps to timeline segments.",
            "The preview canvas can become a browser capture target.",
            "A renderer can consume the same MDX scene tree for video output."
          ]
        }
      ],
      syntax: {
        eyebrow: "MDX Docs",
        backLabel: "Back to docs",
        sideNavTitle: "Documentation",
        docsHomeLabel: "Docs home",
        studioLinkLabel: "Studio",
        onThisPageTitle: "On this page",
        updatedAt: "Last updated on May 30, 2026",
        helpfulTitle: "Was this page helpful?",
        feedbackLabel: "Back to docs home",
        nextLabel: "Next",
        sideNavGroups: {
          start: "Start",
          syntax: "Syntax",
          reference: "Reference"
        },
        overviewTitle: "Overview",
        fileLabel: ".mdx",
        title: "Complete MDX syntax.",
        body: "SlideX MDX is organized around Scene blocks. Each Scene can contain text, cards, metrics, charts, and images, with props for timing, layout, color, and position.",
        overviewPageTitle: "MDX docs overview.",
        overviewBody: "Start here to understand the SlideX docs structure, scene model, and authoring path before moving into the full example, common patterns, and props reference.",
        overviewLeadTitle: "A deck is a set of playable scenes.",
        overviewLeadBody: "SlideX treats each slide as a Scene instead of a static image. Name the deck with Markdown, describe the frame with MDX components, then tune animation rhythm with timing props.",
        overviewCodeTitle: "Minimal scene",
        overviewCode: `<Scene duration={5} theme="dark">
  <Title enter="fadeUp">
    Launch Review
  </Title>
  <Text delay={0.2}>
    One Scene per page, blocks handle content and rhythm.
  </Text>
</Scene>`,
        overviewCards: [
          {
            title: "Read the full example",
            body: "Start from a Scene that can be pasted into Studio and see how title, text, metrics, and charts fit together."
          },
          {
            title: "Break down patterns",
            body: "Review common syntax for documents, text, data, images, and precise positioning while you author."
          },
          {
            title: "Look up props",
            body: "Quickly check how duration, theme, enter, delay, and x/y/w/h frame props behave."
          },
          {
            title: "Understand parsing",
            body: "Learn which tag forms, number values, and Markdown heading rules the parser supports."
          }
        ],
        overviewReferenceTitle: "Where to go next?",
        overviewReferenceBody: "Choose a section based on the work in front of you: use the example to get moving, or open props and parsing rules when you need a reference.",
        overviewWorkflowTitle: "Suggested reading path",
        overviewWorkflowBody: "You do not need to read everything at once. Learn the scene model, edit from an example, then return to the props reference.",
        overviewWorkflowSteps: [
          ["01", "Create scenes", "Name the deck with #, then split each page with Scene or Slide."],
          ["02", "Add blocks", "Use Title, Text, Card, Metric, Chart, and ImageBlock to describe the frame."],
          ["03", "Tune rhythm", "Use enter, delay, duration, and frame props to control motion and layout."]
        ],
        rules: [
          "Use # at the top of the file to name the deck.",
          "Every <Scene> or <Slide> needs duration in seconds.",
          "Text components use paired tags; data, image, and chart components use self-closing tags.",
          "x, y, w, and h use percent-based frame coordinates for precise slide layout."
        ],
        patternsTitle: "Common patterns",
        patternsBody: "These examples can be pasted into Studio and then tuned for content, color, layout, and timing.",
        fullExampleTitle: "Full example",
        exampleBody: "This complete MDX scene can be used as a starting point for a new deck. It includes a title, supporting copy, a metric, and a chart while showing common timing and frame props.",
        fullExample: `# Quarterly Business Review

<Scene duration={6} theme="dark" accent="#8ea5ff" layout="default" alignX="left" alignY="center">
  <Title enter="fadeUp" fontSize={72} x={8} y={12} w={64} h={18}>
    Growth review
  </Title>
  <Text enter="fadeUp" delay={0.2} fontSize={24} x={8} y={34} w={52} h={16}>
    Focus the conversation on momentum, risk, and the next decision.
  </Text>
  <Metric label="ARR" value="+42%" caption="Trailing twelve-month growth." enter="fadeUp" delay={0.3} x={8} y={56} w={28} h={24} />
  <Chart title="Pipeline quality" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" height={144} enter="fadeUp" delay={0.35} x={40} y={52} w={48} h={34} />
</Scene>`,
        groups: [
          {
            title: "Document and scenes",
            body: "Name the deck with a Markdown heading, then create one page at a time with Scene or Slide.",
            code: `# Launch Review

<Scene duration={5} theme="light" background="#f8fafc" accent="#2563eb">
  ...
</Scene>

<Slide duration={4} theme="dark">
  ...
</Slide>`
          },
          {
            title: "Text and motion",
            body: "Title and Text use paired tags. Their content is normalized into one readable line.",
            code: `<Title enter="fadeUp" fontSize={72} textAlign="left">
  Board-ready story
</Title>

<Text enter="slideLeft" delay={0.2} duration={0.7} fontSize={24}>
  Explain the decision with one clear supporting sentence.
</Text>`
          },
          {
            title: "Data blocks",
            body: "Card, Metric, and Chart describe evidence, numbers, and trend lines through props.",
            code: `<Metric label="Retention" value="119%" caption="Expansion remains healthy." width="sm" />

<Card icon="BadgeCheck" layout="horizontal" title="Proof point" text="Use one concrete reason for confidence." width="lg" />

<Chart title="Readiness" labels="Sales,Success,Product" values="82,64,48" height={144} />`
          },
          {
            title: "Images and frame layout",
            body: "ImageBlock can use remote images or uploaded data URLs. x/y/w/h precisely position the frame.",
            code: `<ImageBlock src="https://example.com/product.png" alt="Product screenshot" fit="cover" radius={16} x={52} y={16} w={40} h={56} />

<Text x={8} y={72} w={40} h={12} textAlign="center">
  Position with percent-based frame props.
</Text>`
          }
        ],
        propsTitle: "Common props",
        propsBody: "These props can be written directly on MDX tags and parsed into preview and timeline data.",
        propsRows: [
          ["Scene", "duration", "number", "Scene length in seconds."],
          ["Scene", "theme", "dark | light | paper | blue", "Sets default background and text contrast."],
          ["Scene", "layout", "default | split-left | split-right", "Controls the main scene layout direction."],
          ["Block", "enter", "fadeIn | fadeUp | zoomIn | slideLeft", "Controls entrance animation."],
          ["Block", "delay", "number", "Delays entrance timing in seconds."],
          ["Block", "x y w h", "number", "Percent-based frame position and size."],
          ["Text", "fontSize", "number", "Overrides text size."],
          ["Card", "icon", "Lucide name", "Displays a supported icon name."],
          ["Chart", "labels / values", "comma list", "Comma-separated labels and values."],
          ["ImageBlock", "fit", "cover | contain | fill | scale-down", "Controls how the image fills the frame."]
        ],
        motionTitle: "Motion and parsing rules",
        motionBody: "The MDX parser intentionally supports a small, stable syntax for website presets and Studio editing.",
        motionRows: [
          ["<Title>...</Title>", "Text-like components must use paired tags."],
          ["<Card ... />", "Data-like components use self-closing tags."],
          ["{72}", "Plain numbers inside braces are parsed as number values."],
          ["\"fadeUp\"", "Quoted values are parsed as strings."],
          ["# Heading", "A # outside Scene becomes the deck title."],
          ["## Subheading", "An unwrapped ## inside Scene becomes a heading block."]
        ],
        ctaTitle: "Try MDX in Studio.",
        ctaBody: "Paste an example into Studio, tune scene timing and block positions, then preview the motion immediately.",
        ctaButton: "Open Studio"
      },
      components: {
        title: "Scene component reference.",
        body: "A small component vocabulary keeps the Studio predictable while still supporting rich presentation work.",
        notePrefix: "Full maintenance notes remain in",
        docPath: "docs/USAGE.zh-TW.md",
        items: [
          ["Scene", "Timed page container for one presentation moment."],
          ["Title", "Animated headline layer with enter and timing props."],
          ["Text", "Supporting copy with delay, duration, and layout controls."],
          ["Card", "Structured proof block for context and decisions."],
          ["Metric", "Displays one key label, value, and caption."],
          ["Chart", "Bar chart using comma-separated labels and values."],
          ["ImageBlock", "Adds image URL, alt text, fit mode, and frame position."]
        ]
      },
      cta: {
        title: "Ready to build a scene?",
        body: "Open Studio and use the reference as you shape the first deck.",
        button: "Open Studio"
      }
    },
    downloadPage: {
      hero: {
        eyebrow: "Download",
        title: "SlideX for Mac is on the way.",
        body: "A native Mac app is being prepared for Mac deck projects, smoother previews, and export-ready presentation workflows.",
        disabledButton: "Mac App Coming Soon",
        secondary: "Open Web Studio"
      },
      packageCard: {
        title: "macOS app",
        subtitle: "Native desktop build",
        status: "Coming soon",
        heading: "What we are preparing",
        items: ["Signed Mac installer", "Mac project workflow", "Preview and export flow", "Version notes"],
        localTitle: "Tailored for Mac",
        localBody: "The Mac version will keep the same MDX scene model from the web Studio while integrating more deeply with desktop project work, file handling, and deck export."
      },
      stats: [
        ["Native Mac app", "A desktop build is planned for everyday deck work."],
        ["Mac projects", "Designed for desktop files and confidential presentation workflows."],
        ["Export ready", "Prepared for review, playback, and capture workflows."]
      ],
      webStudio: {
        title: "Use the web Studio for now.",
        body: "The browser version is available today for composing scenes, testing motion, and preparing decks while the Mac app is in development.",
        button: "Open Studio"
      }
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "zh-TW" || value === "en";
}

export function localizeTemplates<T extends { id: string }>(
  templates: readonly T[],
  metadata: Partial<Record<string, Partial<T>>>
) {
  return templates.map((template) => ({
    ...template,
    ...(metadata[template.id] ?? {})
  }));
}
