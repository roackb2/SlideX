export const zhTwDictionary = {
    metadata: {
      title: "SlideX — 動態簡報系統",
      description: "用 MDX Slide 設計動態簡報。編輯投影片、預覽動效，並匯出序列。"
    },
    common: {
      productName: "SlideX",
      openStudio: "開啟 Studio",
      getStarted: "開始使用",
      viewPresets: "查看範本"
    },
    nav: {
      homeLabel: "SlideX 首頁",
      resources: "文件",
      templates: "範本",
      getStarted: "開始使用",
      mobileDescription: "設計可動畫的 MDX Slide 簡報。",
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
      getStarted: "開始使用",
      presets: "範本",
      docs: "文件",
      rights: "© 2026 SlideX. 保留所有權利。",
      signature: ""
    },
    thumbnail: {
      fallbackLabel: "範本",
      ariaLabel: (title: string) => `${title} 樣式縮圖`,
      sceneLayers: "投影片圖層",
      layers: ["文字", "Icon", "圖表"],
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
        title: {
          regular: "像寫程式一樣，",
          highlight: "打造動態簡報。"
        },
        body: "用 MDX 組合 Slide、調整節奏、預覽動效，並在同一個 Studio 裡匯出簡報。",
        primary: "開始使用",
        secondary: "查看範本",
        checkpoints: ["撰寫", "預覽", "匯出"]
      },
      heroStudio: {
        title: "Studio",
        project: "專案 Alpha",
        export: "匯出",
        newSlide: "新增 Slide",
        scenes: "Scenes",
        slides: ["備忘錄", "訊號", "計畫", "請求"],
        layers: ["大標題", "敘述文字", "動能圖表", "決策備註"],
        sceneLabel: "Slide 01",
        slideTitle: "成長投資備忘錄",
        slideBody: "簡潔的決策故事，包含節奏明確的證據、動態提示與可匯出的結構。",
        toolLabels: ["文字", "圖示", "圖表", "圖片", "影片", "匯出"],
        tabs: {
          slides: "Slides",
          layers: "Layers"
        },
        header: {
          untitled: "Untitled",
          ready: "Ready",
          undo: "Undo",
          replay: "Replay"
        },
        inspector: {
          properties: "Properties",
          mdxEditor: "MDX Editor",
          background: "Background",
          backgroundType: "Background Type",
          colorPresets: "Color Presets",
          all: "All",
          themeColors: "Theme colors",
          savedSwatches: "Saved swatches",
          addNewSlide: "Add New Slide",
          slideTemplateName: "Title, Body & Author",
          presets: ["Midnight", "Editorial", "Portfolio", "Sage", "Plum", "Steel"]
        },
        canvas: {
          pagination: "1 / 1",
          slideTitle: "Title",
          slideBody: "Write a short paragraph to begin your story."
        }
      },
      stats: [
        ["MDX 優先", "簡報後續仍可編輯"],
        ["即時節奏", "邊組合邊預覽動畫"],
        ["可匯出", "交付原始碼、HTML 或擷取序列"]
      ],
      compose: {
        title: "像寫軟體一樣組簡報。",
        body: "SlideX 把簡報工作變成可重用的 Slide、即時預覽與團隊能維護的輸出。",
        sourceLabel: "MDX Slide 原始碼",
        codeTitle: "成長投資備忘錄",
        timelineLabel: "預覽時間軸",
        timelineItems: ["文字淡入", "圖表上升", "決策註記"],
        templateTitle: "從範本開始",
        templateBody: "載入完整 Slide 簡報，快速建立檢討、上市、更新與 QBR。",
        blockTitle: "受控的區塊套件",
        blockBody: "文字、Icon、圖表、圖片與影片共用同一套時間模型。",
        polishTitle: "簡報質感仍可編輯",
        polishBody: "動效能承受反覆修改，因為簡報仍是文件，而不是被壓平的畫面。"
      },
      workflow: {
        title: "從草稿到播放的一條流程。",
        body: "寫一次、調整節奏，讓完成後的故事保持可攜。",
        items: [
          {
            title: "撰寫敘事",
            body: "從可編輯的 MDX Slide 開始，不必再用壓平素材重建投影片。"
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
        body: "範本是完整 Slide 系統，不是空白主題。選一個、改寫故事，保留動效。"
      },
      cta: {
        title: "準備好製作第一份簡報了嗎？",
        body: "開啟 Studio，體驗全新的動態簡報標準。",
        button: "立即開始"
      }
    },
    templatesPage: {
      hero: {
        eyebrow: "簡報範本",
        title: "內建動效的實用簡報。",
        body: "從完整的 MDX Slide 簡報開始，適合檢討、上市、董事會更新與客戶故事。",
        primary: "開啟 Studio",
        secondary: "查看範本"
      },
      featured: {
        label: "精選範本",
        open: "開啟",
        deckLabel: "MDX 簡報"
      },
      stats: [
        ["完整 Slide", "結構、文案節奏、時間與視覺方向都已建立。"],
        ["可編輯原始碼", "一切維持 MDX，讓團隊能改寫故事。"],
        ["匯出路徑", "用同一棵 Slide 樹進行播放與擷取。"]
      ],
      gallery: {
        title: "選最接近的故事。",
        body: "這個範本庫依照商業情境整理，而不是依照裝飾風格。",
        steps: [
          ["01", "選一份簡報"],
          ["02", "改寫 Slide"],
          ["03", "預覽節奏"]
        ]
      },
      startingPoint: {
        title: "範本是起點。",
        body: "開啟一份簡報，保留動效語法，換成你的真實故事。",
        items: [
          ["Slide 結構", "完整簡報大綱與已設定時間的段落。"],
          ["動效預設", "進場、延遲與持續時間都已調整好。"],
          ["MDX 原始碼", "團隊能閱讀與維護的原始碼。"]
        ]
      },
      cta: {
        title: "今天就從範本開始。",
        body: "把簡報載入 Studio、編輯 Slide，並保留整套動效系統。",
        button: "開啟 Studio"
      }
    },
    resourcesPage: {
      heroVisual: {
        label: "資源",
        codeTitle: "動態設計資源",
        codeBody: "Slide 模型、工作流程、匯出路徑。",
        cards: [
          ["Slide", "計時頁面"],
          ["Layer", "動效區塊"],
          ["Export", "可攜輸出"]
        ]
      },
      hero: {
        eyebrow: "文件",
        title: "理解 Slide 系統。",
        body: "集中整理 MDX Slide、元件語法、Studio 流程、鍵盤操作與匯出方向。",
        primary: "查看 MDX 語法",
        secondary: "開啟 Studio"
      },
      resourceItems: [
        {
          title: "MDX 語法",
          description: "完整的 Slide、文字、Icon、圖表、圖片、影片與常用 props 寫法。",
          href: "/resources/mdx",
          label: "語法"
        },
        {
          title: "MCP Server",
          description: "把 SlideX 接到支援 MCP 的助理，讓它能建立、驗證、修改與匯出 MotionDoc。",
          href: "/resources/mdx/mcp",
          label: "MCP"
        },
        {
          title: "Slide 元件",
          description: "Slide、Text、Icon、Chart、ImageBlock、VideoBlock 與時間 props 的參考。",
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
          description: "用投影片列表、MDX 編輯器、預覽與時間軸設計動態簡報。",
          href: "/studio",
          label: "Studio"
        }
      ],
      docsIntro: {
        title: "文件跟著建置流程走。",
        body: "先理解 Slide 模型，再進入組合方式，最後準備輸出路徑。"
      },
      docSections: [
        {
          title: "Slide 模型",
          description: "SlideX 把簡報視為可編輯原始碼的 MDX 投影片文件。",
          points: [
            "每個 <Slide> 定義一個計時頁面。",
            "Text、Icon、Chart、ImageBlock 與 VideoBlock 都可接收 enter、delay、duration props。",
            "同一份 MDX 簡報驅動投影片列表、預覽、時間軸與匯出。"
          ]
        },
        {
          title: "設計循環",
          description: "Studio 讓原始碼、投影片導覽、預覽與時間軸輸出保持同步。",
          points: [
            "載入簡報範本或插入單一 Slide 區塊。",
            "編輯 MDX 原始碼來控制進階組合。",
            "Replay 只重置動畫 key，不會改變組合內容。"
          ]
        },
        {
          title: "匯出方向",
          description: "影片匯出是發布目標，而核心產品仍是動態設計工具。",
          points: [
            "Slide duration 會對應到時間軸片段。",
            "預覽畫布可以成為瀏覽器擷取目標。",
            "renderer 可以使用同一棵 MDX Slide 樹輸出影片。"
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
        updatedAt: "最後更新於 2026年6月11日",
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
        body: "SlideX 的 MDX 以 Slide 為單位。每個 Slide 可以放入 Text、Icon、Chart、ImageBlock 與 VideoBlock，並用 props 控制時間、版面、顏色與位置。",
        overviewPageTitle: "MDX 文件概覽。",
        overviewBody: "先用這頁理解 SlideX 的文件結構、Slide 模型與編輯路徑，再依照需要進入完整範例、常用寫法與 props 參考。",
        overviewLeadTitle: "一份簡報就是一組可播放的 Slides。",
        overviewLeadBody: "SlideX 不把投影片當成靜態圖片，而是把每一頁整理成 <Slide>。你可以用 Markdown 命名簡報，用 MDX 元件描述畫面，再用時間 props 控制動畫節奏。",
        overviewCodeTitle: "最小 Slide",
        overviewCode: `<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text enter="fadeUp" fontSize={72} fontWeight={800} x={8} y={18} w={72} h={18}>
    Launch Review
  </Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} x={8} y={42} w={58} h={16}>
    一頁一個 Slide，區塊負責內容與節奏。
  </Text>
</Slide>`,
        overviewCards: [
          {
            title: "先看完整範例",
            body: "從一份可直接貼進 Studio 的 Slide 開始，了解文字、Icon、圖表與圖片如何組合。"
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
          },
          {
            title: "接上 MCP",
            body: "把 SlideX 註冊到 MCP client，讓助理能建立、驗證、修改與匯出 MotionDoc。"
          }
        ],
        overviewReferenceTitle: "接下來看哪裡？",
        overviewReferenceBody: "依照你正在做的工作選一個章節：想先跑起來就看範例，想查語法就看 props 與解析規則。",
        overviewWorkflowTitle: "建議閱讀順序",
        overviewWorkflowBody: "文件不需要一次讀完。先理解 Slide，再從範例改起，最後回來查 props。",
        overviewWorkflowSteps: [
          ["01", "建立 Slide", "用 # 命名簡報，再用 <Slide> 切出每一頁。"],
          ["02", "放入區塊", "用 Text、Icon、Chart、ImageBlock 與 VideoBlock 描述畫面內容。"],
          ["03", "調整節奏", "用 enter、delay、duration 和座標 props 控制動畫與版面。"]
        ],
        rules: [
          "每份文件可以用 # 作為簡報標題。",
          "每個 <Slide> 都需要 duration，單位為秒。",
          "Text 使用成對標籤；Icon、圖片、影片與圖表使用 self-closing 標籤。",
          "x、y、w、h 使用百分比座標，適合精準控制簡報版面。"
        ],
        patternsTitle: "常用寫法",
        patternsBody: "以下範例可以直接貼進 Studio，再依照內容、顏色與版面需求微調 props。",
        fullExampleTitle: "完整範例",
        exampleBody: "這是一份完整的 MDX Slide，可以作為新簡報的起點。它包含標題、輔助文字、文字型指標與圖表，並示範常見的時間與版面 props。",
        fullExample: `# 季度業務檢討

<Slide duration={6} theme="dark" background="#050505" accent="#8ea5ff">
  <Text enter="fadeUp" fontSize={72} fontWeight={800} x={8} y={12} w={64} h={18}>
    成長檢討
  </Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} x={8} y={34} w={52} h={16}>
    把討論聚焦在動能、風險與下一個決策。
  </Text>
  <Text fontSize={64} fontWeight={800} x={8} y={56} w={28} h={14}>+42%</Text>
  <Text fontSize={20} fontWeight={600} x={8} y={74} w={28} h={8}>ARR 成長</Text>
  <Chart title="Pipeline 品質" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" height={144} enter="fadeUp" delay={0.35} x={40} y={52} w={48} h={34} />
</Slide>`,
        groups: [
          {
            title: "文件與 Slide",
            body: "用 Markdown 標題命名簡報，再用 <Slide> 切出每一頁。",
            code: `# Launch Review

<Slide duration={4} theme="dark">
  <Text fontSize={72} fontWeight={800} x={8} y={18} w={70} h={18}>Launch Review</Text>
</Slide>`
          },
          {
            title: "文字與動效",
            body: "Text 使用成對標籤，搭配 fontSize、fontWeight 與座標 props 承擔標題、正文與指標文字。",
            code: `<Text enter="fadeUp" fontSize={72} fontWeight={800} textAlign="left">
  Board-ready story
</Text>

<Text enter="slideLeft" delay={0.2} duration={0.7} fontSize={24}>
  Explain the decision with one clear supporting sentence.
</Text>`
          },
          {
            title: "Icon、指標與圖表",
            body: "目前模板用 Icon + Text 組合證據卡，用 Text 組合數字指標，Chart 負責趨勢與比較。",
            code: `<Icon icon="BadgeCheck" size={42} x={8} y={32} w={5} h={8} />
<Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>Proof point</Text>
<Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>Use one concrete reason for confidence.</Text>

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
          ["Slide", "duration", "number", "投影片長度，單位為秒。"],
          ["Slide", "theme", "dark | light | paper | blue", "設定預設背景與文字對比。"],
          ["Slide", "background / accent", "color", "控制投影片背景與重點色。"],
          ["Block", "enter", "fadeIn | fadeUp | zoomIn | slideLeft", "控制進場動畫。"],
          ["Block", "delay", "number", "延遲進場秒數。"],
          ["Block", "x y w h", "number", "百分比座標與尺寸。"],
          ["Text", "fontSize / fontWeight", "number", "控制標題、正文與數字指標的文字層級。"],
          ["Icon", "icon", "Lucide name", "顯示支援的圖示名稱。"],
          ["Chart", "labels / values", "comma list", "用逗號分隔標籤與數值。"],
          ["ImageBlock / VideoBlock", "fit", "cover | contain | fill | scale-down", "控制媒體填滿方式。"]
        ],
        motionTitle: "動效與解析規則",
        motionBody: "MDX parser 目前以 <Slide> 與 Text-first blocks 為主要寫法，保留少量舊語法相容，但新文件與 MCP 都會產生新版格式。",
        motionRows: [
          ["<Slide>...</Slide>", "每一頁使用 Slide 包住所有區塊。"],
          ["<Text>...</Text>", "標題、正文、數字指標都用 Text 搭配文字 props。"],
          ["<Icon ... />", "證據卡與視覺提示使用 Icon + Text 組合。"],
          ["<Chart ... />", "圖表使用 self-closing 標籤。"],
          ["{72}", "大括號內的純數字會被解析成 number。"],
          ["\"fadeUp\"", "引號內容會被解析成 string。"],
          ["# Heading", "Slide 外的 # 會被當作簡報標題。"],
          ["## Subheading", "Slide 內未包標籤的 ## 會轉成 heading block。"]
        ],
        mcpTitle: "MCP Server",
        mcpBody: "SlideX MCP server 透過 stdio 暴露 MotionDoc 工具，讓支援 MCP 的助理可以建立簡報、讀取模板、修改 slide、驗證 MDX，並匯出 standalone HTML。",
        mcpInstallTitle: "安裝與設定",
        mcpInstallLead: "同一個 server 可以用 local、npm 或 GitHub 方式接到 MCP client。",
        mcpInstallBody: "本專案目前已可用 local 模式。未來如果要發布到 npm 或讓別人從 GitHub 安裝，重點是讓 client 啟動 server 時 stdout 只保留 JSON-RPC，所以 npm 指令要加 --silent。",
        mcpInstallCards: [
          {
            title: "Local project",
            body: "開發中最穩定的方式。MCP client 會在這個專案根目錄啟動 server，適合本機測試與私有專案。",
            fileLabel: "mcp.json",
            code: `{
  "mcpServers": {
    "slidex": {
      "command": "npm",
      "args": ["--silent", "run", "mcp"],
      "cwd": "/Users/zz41354899/Desktop/Animark"
    }
  }
}`
          },
          {
            title: "NPM package (推薦方式)",
            body: "透過 npx 直接啟動。請務必加上 @latest，確保您的 AI 助理能抓到包含動態載入 Skill 最新功能的版本！",
            fileLabel: "mcp.json",
            code: `{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server@latest"]
    }
  }
}`
          },
          {
            title: "Cursor / Claude Desktop",
            body: "開啟編輯器的 MCP 設定 (Cursor: 設定 -> Features -> MCP，Claude: claude_desktop_config.json)，新增一個 Command 類型的 Server，填入以下參數：",
            fileLabel: "介面設定參數",
            code: `Name: slidex
Type: command
Command: npx
Args: -y @z7589xxz758/slidex-mcp-server@latest`
          },
          {
            title: "GitHub clone",
            body: "如果暫時不發布 npm，可以讓使用者 clone repo、安裝依賴，再用 cwd 指向 clone 後的資料夾。",
            fileLabel: "terminal + mcp.json",
            code: `git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm install

{
  "mcpServers": {
    "slidex": {
      "command": "npm",
      "args": ["--silent", "run", "mcp"],
      "cwd": "/absolute/path/to/<repo>"
    }
  }
}`
          }
        ],
        mcpToolsTitle: "可用 tools",
        mcpToolsBody: "這些 tools 都以 slidex_ 開頭，避免和其他 MCP server 的工具名稱混淆。",
        mcpToolsRows: [
          ["slidex_parse_motion_doc", "解析 MDX，回傳 slides、blocks、stats 與 validation。"],
          ["slidex_list_templates", "列出內建模板與 use case。"],
          ["slidex_create_deck", "用結構化大綱建立可編輯的 MotionDoc MDX。"],
          ["slidex_create_from_template", "複製模板，並可替換標題與文字。"],
          ["slidex_add_block", "在指定 slide 新增文字、圖片、影片、圖表或 Icon。"],
          ["slidex_list_slide_layouts", "列出 16 個內建 Studio slide layouts。"],
          ["slidex_get_slide_layout", "取得指定 layout 的 MDX block source。"],
          ["slidex_create_slide_from_layout", "用 layout 建立完整 <Slide>...</Slide> 區塊。"],
          ["slidex_add_slide_from_layout", "新增或插入由 layout 產生的 slide。"],
          ["slidex_replace_slide_with_layout", "用指定 layout 取代現有 slide。"],
          ["slidex_update_slide_props", "更新單一 slide 的 theme、background、accent、duration 等 props。"],
          ["slidex_replace_slide", "用完整 <Slide>...</Slide> 取代指定 slide。"],
          ["slidex_export_html", "匯出 standalone HTML player。"]
        ],
        mcpPublishTitle: "發布前注意事項",
        mcpPublishBody: "如果之後要把 MCP server 做成 npm 或 GitHub 可安裝版本，建議先補齊以下幾件事。",
        mcpPublishNotes: [
          "npm 發布版需要 package bin，例如 slidex-mcp，讓 npx 可以直接啟動 server。",
          "MCP stdio server 不可以把一般 log 寫到 stdout；log 請寫 stderr，或使用 npm --silent。",
          "GitHub 模式最穩的是 clone 後用 cwd 執行 npm --silent run mcp；直接 npx github:<owner>/<repo> 需要 repo 已正確設定 bin。",
          "如果要讓使用者全域安裝，最好把 MCP server 編譯成 JavaScript，避免依賴本機 TypeScript runtime。"
        ],
        ctaTitle: "用 Studio 試一份 MDX。",
        ctaBody: "把範例貼進 Studio，調整 Slide 時間與區塊位置，就能快速看到動效預覽。",
        ctaButton: "開啟 Studio"
      },
      components: {
        title: "Slide 元件參考。",
        body: "小而穩定的元件語彙讓 Studio 可預期，同時支援豐富的簡報作品。",
        notePrefix: "完整維護筆記保留在",
        docPath: "docs/USAGE.zh-TW.md",
        items: [
          ["Slide", "一個簡報時刻的計時頁面容器。"],
          ["Text", "支援標題、正文、指標文字、delay、duration 與版面控制。"],
          ["Icon", "Lucide 圖示層，常與 Text 組合成證據卡。"],
          ["Chart", "用 labels 與 values 表達趨勢、比較與比例。"],
          ["ImageBlock", "可放入圖片 URL、alt、fit 與畫面位置。"],
          ["VideoBlock", "可放入影片 URL、poster、controls 與畫面位置。"]
        ]
      },
      cta: {
        title: "準備好建立 Slide 了嗎？",
        body: "開啟 Studio，一邊參考文件一邊塑造第一份簡報。",
        button: "開啟 Studio"
      }
    }
};
