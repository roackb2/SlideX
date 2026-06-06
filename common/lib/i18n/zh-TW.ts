export const zhTwDictionary = {
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
      githubLabel: "開啟 GitHub 倉庫",
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
      "digital-transformation-roadmap": {
        name: "數位轉型路線圖",
        category: "訊號白",
        description: "為機會選擇、風險控管、營運模型、試點與投資核准設計的主管轉型路線圖。",
        useCase: "轉型策略、營運模型、主管工作坊"
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
        title: "Mac Beta 已可下載。",
        body: "SlideX Tauri 2.0.4 已放上 macOS Apple Silicon DMG，可先分享給早期使用者測試桌面版流程。",
        cta: "下載 Mac Beta",
        cardTitle: "SlideX for macOS",
        status: "Version 2.0.4",
        items: ["Apple Silicon DMG", "Mac 專案基礎", "Web Studio 相容"]
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
        eyebrow: "Homebrew Cask",
        title: "SlideX for Mac 已可進行安裝。",
        body: "第一版 Tauri 桌面 beta 目前透過 macOS 的 Homebrew Cask 發佈。這能自動繞過 macOS Gatekeeper 權限檢查，提供安全且順暢的安裝體驗。",
        primary: "複製 Homebrew 指令",
        secondary: "開啟 Web Studio"
      },
      packageCard: {
        title: "macOS App",
        subtitle: "Tauri 桌面版本",
        status: "已可下載",
        heading: "Homebrew Cask 套件",
        fileMeta: [
          ["來源", "Homebrew Tap"],
          ["平台", "macOS Apple Silicon"],
          ["Cask 名稱", "slidex"]
        ],
        items: ["Tauri 桌面 2.0.4", "自動繞過 Gatekeeper 安全檢查", "延續 Web Studio 的 MDX 場景模型", "2026.06.06 版本資訊"],
        localTitle: "Homebrew 發佈管道",
        localBody: "這一版把 Mac 桌面體驗、專案開啟流程與 Studio 預覽整合到可直接透過 Homebrew 安裝的 beta 版本，並由 GitHub Releases 提供直接更新服務。",
        installTitle: "安裝指引",
        installBody: "如要安裝，請複製下方指令並在您的 Mac 終端機 (Terminal) 中執行：",
        installCommand: "brew install --cask zz41354899/slidex/slidex",
        installStep1: "安裝完成後，您就可以直接在應用程式資料夾或啟動台中開啟 SlideX，不需要再處理安全性限制。",
        installStep2Label: "執行 Cask 指令"
      },
      stats: [
        ["Homebrew Tap", "SlideX 官方 Cask 套件庫，自動繞過 Gatekeeper 安全阻擋。"],
        ["Mac 專案", "為桌面檔案與私密簡報流程鋪好基礎。"],
        ["Web Studio 相容", "沿用 MDX 場景模型，方便之後接上匯出與播放流程。"]
      ],
      webStudio: {
        title: "Web Studio 與 Mac Beta 同步前進。",
        body: "瀏覽器版本現在就能組合場景、測試動效與準備簡報；Mac beta 則作為桌面版第一個公開節點，讓團隊開始收集真實使用回饋。",
        button: "開啟 Studio"
      }
    }
};
