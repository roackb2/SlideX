export const launchDeckPresentationId = "launch-deck";
export const launchDeckPresentationSeedVersion = 5;
export const launchDeckPresentationTitle = "Launch Deck";

export const launchDeckPresentationSource = `# Launch Deck

<Slide duration={6} theme="dark" background="#989997" accent="#ff6f4e" textColor="#fff9f2" mutedColor="#d8ccc0" slideTransition="scale" transitionDuration={0.75}>
  <Text fontSize={17} fontWeight={720} x={4} y={7} w={25} h={4} color="#fff9f2" enter="fadeIn">MORROW</Text>
  <Text fontSize={14} fontWeight={650} x={79} y={7.5} w={14} h={4} color="#15120f" textAlign="right" enter="fadeIn" delay={0.12}>LAUNCH DECK</Text>
  <Title fontSize={74} fontWeight={750} lineHeight={0.92} x={4} y={23} w={51} h={40} color="#fff9f2" enter="reveal" delay={0.14} duration={0.9}>Make every launch feel inevitable.</Title>
  <Text fontSize={19} lineHeight={1.42} x={4.3} y={72} w={48} h={12} color="#d8ccc0" enter="fadeUp" delay={0.38}>A complete story for introducing a product, aligning the team, and taking it to market.</Text>
  <Text fontSize={15} fontWeight={700} x={4} y={91} w={30} h={3} color="#ff6f4e" enter="fadeIn" delay={0.52}>PRODUCT LAUNCH / 2026</Text>
</Slide>

<Slide duration={6.5} theme="light" background="#fff9f2" accent="#ff6f4e" textColor="#15120f" mutedColor="#6f645b" slideTransition="pushLeft" transitionDuration={0.75}>
  <Text fontSize={14} fontWeight={700} x={4} y={6} w={22} h={4} color="#ff6f4e" enter="fadeIn">THE OPENING</Text>
  <Title fontSize={48} fontWeight={750} lineHeight={0.98} x={4} y={18} w={49} h={31} color="#15120f" enter="reveal" delay={0.08}>The old way asks people to work around the product.</Title>
  <Text fontSize={18} lineHeight={1.48} x={4.2} y={58} w={45} h={17} color="#6f645b" enter="fadeUp" delay={0.25}>Teams lose time moving between disconnected tools, repeating decisions, and rebuilding the same context.</Text>
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={16} x={58} y={11} w={38} h={78} alt="Team coordinating work across a shared product workspace" src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=85&w=2400" delay={0.14} duration={0.9} />
  <Text fontSize={13} fontWeight={650} x={60} y={92} w={34} h={3} color="#6f645b" textAlign="right" enter="fadeIn" delay={0.48}>DISCONNECTED WORK ADDS UP.</Text>
</Slide>

<Slide duration={7} theme="dark" background="#233c35" accent="#b7efcf" textColor="#f7fff9" mutedColor="#adc2b9" slideTransition="wipe" transitionDuration={0.78}>
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={0} x={0} y={0} w={47} h={100} alt="Editorial product visualization for the Morrow launch" src="https://animark-media-library.zz41354899.chatgpt.site/media/optimized/project/precision-canvas.webp" delay={0.05} duration={0.95} />
  <Text fontSize={14} fontWeight={700} x={54} y={8} w={28} h={4} color="#b7efcf" enter="fadeIn" delay={0.12}>INTRODUCING MORROW</Text>
  <Title fontSize={48} fontWeight={750} lineHeight={0.98} x={54} y={20} w={42} h={33} color="#f7fff9" enter="reveal" delay={0.18}>One clear place to move work forward.</Title>
  <Text fontSize={19} lineHeight={1.48} x={54.2} y={58} w={35} h={18} color="#adc2b9" enter="fadeUp" delay={0.34}>Morrow keeps the brief, decisions, and next actions together so the team can work with shared context.</Text>
</Slide>

<Slide duration={6.5} theme="light" background="#f1eadf" accent="#ff6f4e" textColor="#15120f" mutedColor="#6f645b" slideTransition="pushLeft" transitionDuration={0.72}>
  <Text fontSize={14} fontWeight={700} x={4} y={6} w={26} h={4} color="#ff6f4e" enter="fadeIn">WHAT CHANGES</Text>
  <Title fontSize={47} fontWeight={750} lineHeight={0.98} x={4} y={15} w={68} h={17} color="#15120f" enter="reveal">A focused system for the work that matters.</Title>
  <Text fontSize={17} lineHeight={1.4} x={4.2} y={34} w={55} h={6} color="#6f645b" enter="fadeUp" delay={0.16}>Three connected capabilities replace a scattered workflow.</Text>
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={10} x={4} y={43} w={28} h={29} alt="Team reviewing a shared product brief" src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=85&w=2400" delay={0.16} duration={0.78} />
  <Text fontSize={19} fontWeight={740} x={4} y={76} w={28} h={5} color="#15120f" enter="fadeUp" delay={0.28}>One brief</Text>
  <Text fontSize={13.5} lineHeight={1.35} x={4} y={83} w={27} h={8} color="#6f645b" enter="fadeUp" delay={0.34}>Keep the source of truth visible.</Text>
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={10} x={36} y={43} w={28} h={29} alt="Colleagues making decisions together" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=85&w=2400" delay={0.24} duration={0.78} />
  <Text fontSize={19} fontWeight={740} x={36} y={76} w={28} h={5} color="#15120f" enter="fadeUp" delay={0.36}>One thread</Text>
  <Text fontSize={13.5} lineHeight={1.35} x={36} y={83} w={27} h={8} color="#6f645b" enter="fadeUp" delay={0.42}>Make decisions with context attached.</Text>
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={10} x={68} y={43} w={28} h={29} alt="Workshop turning plans into visible action" src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=85&w=2400" delay={0.32} duration={0.78} />
  <Text fontSize={19} fontWeight={740} x={68} y={76} w={28} h={5} color="#15120f" enter="fadeUp" delay={0.44}>One next step</Text>
  <Text fontSize={13.5} lineHeight={1.35} x={68} y={83} w={27} h={8} color="#6f645b" enter="fadeUp" delay={0.5}>Turn decisions into visible action.</Text>
</Slide>

<Slide duration={6.5} theme="dark" background="#15120f" accent="#ffd45f" textColor="#fff9f2" mutedColor="#b9aea4" slideTransition="fade" transitionDuration={0.7}>
  <Text fontSize={14} fontWeight={700} x={4} y={6} w={24} h={4} color="#ffd45f" enter="fadeIn">THE EARLY SIGNAL</Text>
  <Title fontSize={55} fontWeight={750} lineHeight={0.98} x={4} y={17} w={50} h={25} color="#fff9f2" enter="reveal">Less coordination. More forward motion.</Title>
  <Text fontSize={18} lineHeight={1.45} x={4.2} y={50} w={44} h={13} color="#b9aea4" enter="fadeUp" delay={0.2}>Pilot teams complete the weekly planning loop with fewer handoffs and clearer ownership.</Text>
  <Shape shape="rectangle" fill="#211d19" stroke="#3c3530" strokeWidth={1} radius={14} x={59} y={11} w={36} h={75} enter="fadeUp" delay={0.14} />
  <Text fontSize={15} fontWeight={650} x={64} y={18} w={25} h={4} color="#b9aea4">WEEKLY LOOP COMPLETION</Text>
  <Text fontSize={63} fontWeight={760} x={64} y={28} w={24} h={17} color="#ffd45f" enter="reveal" delay={0.28}>82%</Text>
  <Shape shape="rectangle" fill="#302a25" radius={4} x={64} y={52} w={25} h={5} enter="fadeIn" delay={0.38} />
  <Shape shape="rectangle" fill="#ffd45f" radius={4} x={64} y={52} w={20.5} h={5} enter="wipe" delay={0.44} duration={0.8} />
  <Text fontSize={15} fontWeight={650} x={64} y={64} w={25} h={4} color="#b9aea4">HANDOFFS PER CYCLE</Text>
  <Text fontSize={36} fontWeight={740} x={64} y={71} w={25} h={9} color="#fff9f2" enter="fadeUp" delay={0.5}>7 → 3</Text>
  <Text fontSize={14} x={4} y={89} w={50} h={3} color="#8f867e">EXAMPLE PILOT DATA. REPLACE WITH YOUR RESULTS.</Text>
</Slide>

<Slide duration={7} theme="light" background="#b7efcf" accent="#233c35" textColor="#183129" mutedColor="#4d6a61" slideTransition="wipe" transitionDuration={0.75}>
  <Text fontSize={14} fontWeight={700} x={4} y={6} w={22} h={4} color="#233c35" enter="fadeIn">GO TO MARKET</Text>
  <Title fontSize={55} fontWeight={750} lineHeight={0.98} x={4} y={17} w={55} h={24} color="#183129" enter="reveal">Launch in three focused moves.</Title>
  <Text fontSize={18} lineHeight={1.45} x={4.2} y={48} w={45} h={10} color="#4d6a61" enter="fadeUp" delay={0.18}>Prove the workflow, publish the result, then expand with evidence.</Text>
  <Shape shape="rectangle" fill="#fff9f2" radius={12} x={57} y={11} w={38} h={22} enter="fadeUp" delay={0.18} />
  <Text fontSize={15} fontWeight={720} x={61} y={15} w={8} h={4} color="#ff6f4e">PILOT</Text>
  <Text fontSize={22} fontWeight={720} x={61} y={22} w={29} h={6} color="#183129">Start with five teams</Text>
  <Shape shape="rectangle" fill="#233c35" radius={12} x={57} y={39} w={38} h={22} enter="fadeUp" delay={0.28} />
  <Text fontSize={15} fontWeight={720} x={61} y={43} w={10} h={4} color="#b7efcf">LAUNCH</Text>
  <Text fontSize={22} fontWeight={720} x={61} y={50} w={29} h={6} color="#f7fff9">Publish the result</Text>
  <Shape shape="rectangle" fill="#ff6f4e" radius={12} x={57} y={67} w={38} h={22} enter="fadeUp" delay={0.38} />
  <Text fontSize={15} fontWeight={720} x={61} y={71} w={10} h={4} color="#15120f">EXPAND</Text>
  <Text fontSize={22} fontWeight={720} x={61} y={78} w={29} h={6} color="#15120f">Grow from evidence</Text>
  <Text fontSize={15} fontWeight={650} x={4} y={89} w={38} h={3} color="#233c35">PILOT. LAUNCH. EXPAND.</Text>
</Slide>

<Slide duration={6} theme="dark" background="#ff6f4e" accent="#15120f" textColor="#15120f" mutedColor="#653226" slideTransition="scale" transitionDuration={0.72}>
  <Text fontSize={15} fontWeight={720} x={4} y={7} w={22} h={4} color="#15120f" enter="fadeIn">MORROW</Text>
  <Title fontSize={77} fontWeight={760} lineHeight={0.9} x={4} y={20} w={73} h={38} color="#15120f" enter="reveal" delay={0.08}>Move the work. Keep the context.</Title>
  <Text fontSize={20} lineHeight={1.42} x={4.2} y={69} w={48} h={11} color="#653226" enter="fadeUp" delay={0.3}>Replace this closing statement with the one decision you want the audience to make.</Text>
</Slide>`;

const launchDeckZhTwCopy = [
  ["# Launch Deck", "# 產品發布簡報"],
  ["LAUNCH DECK", "產品發布簡報"],
  ["Make every launch feel inevitable.", "讓每次發布都勢在必行。"],
  ["A complete story for introducing a product, aligning the team, and taking it to market.", "一套完整敘事，用來介紹產品、凝聚團隊，並推向市場。"],
  ["PRODUCT LAUNCH / 2026", "產品發布 / 2026"],
  ["THE OPENING", "問題開場"],
  ["The old way asks people to work around the product.", "舊方法總要人們繞著產品限制工作。"],
  ["Teams lose time moving between disconnected tools, repeating decisions, and rebuilding the same context.", "團隊在分散工具間切換、重複決策，還得一再重建脈絡，時間因此流失。"],
  ["Team coordinating work across a shared product workspace", "團隊在共享產品工作區協作"],
  ["DISCONNECTED WORK ADDS UP.", "分散作業的成本不斷累積。"],
  ["INTRODUCING MORROW", "MORROW 正式登場"],
  ["One clear place to move work forward.", "一個清楚集中的地方，讓工作持續向前。"],
  ["Morrow keeps the brief, decisions, and next actions together so the team can work with shared context.", "Morrow 將需求、決策與下一步集中在一起，讓團隊在共享脈絡中協作。"],
  ["Editorial product visualization for the Morrow launch", "Morrow 產品發布的視覺示意"],
  ["WHAT CHANGES", "改變從這裡開始"],
  ["A focused system for the work that matters.", "一套聚焦真正重要工作的系統。"],
  ["Three connected capabilities replace a scattered workflow.", "三項相互連結的能力，取代零散工作流程。"],
  ["Team reviewing a shared product brief", "團隊檢視共享的產品需求"],
  ["One brief", "一份共同需求"],
  ["Keep the source of truth visible.", "讓唯一可信資訊始終清楚可見。"],
  ["Colleagues making decisions together", "同事共同做出決策"],
  ["One thread", "一條完整脈絡"],
  ["Make decisions with context attached.", "讓每項決策都保留完整脈絡。"],
  ["Workshop turning plans into visible action", "團隊將計畫轉化為可見行動"],
  ["One next step", "一個明確下一步"],
  ["Turn decisions into visible action.", "把決策轉化成看得見的行動。"],
  ["THE EARLY SIGNAL", "初步成效"],
  ["Less coordination. More forward motion.", "少一點協調，多一點前進。"],
  ["Pilot teams complete the weekly planning loop with fewer handoffs and clearer ownership.", "試點團隊用更少交接與更清楚的責任分工，完成每週規劃循環。"],
  ["WEEKLY LOOP COMPLETION", "每週循環完成率"],
  ["HANDOFFS PER CYCLE", "每次循環交接次數"],
  ["EXAMPLE PILOT DATA. REPLACE WITH YOUR RESULTS.", "試點示例資料，請替換成你的成果。"],
  ["GO TO MARKET", "市場推進"],
  ["Launch in three focused moves.", "用三個聚焦步驟完成發布。"],
  ["Prove the workflow, publish the result, then expand with evidence.", "先驗證流程、公布成果，再以證據擴展。"],
  ["Start with five teams", "從五個團隊開始"],
  ["Publish the result", "公布成果"],
  ["Grow from evidence", "依據成效擴展"],
  ["PILOT. LAUNCH. EXPAND.", "試點・發布・擴展"],
  ["PILOT", "試點"],
  ["LAUNCH", "發布"],
  ["EXPAND", "擴展"],
  ["Move the work. Keep the context.", "推動工作，保留脈絡。"],
  ["Replace this closing statement with the one decision you want the audience to make.", "將這段結語替換成你希望觀眾做出的那項決定。"]
] as const;

export const launchDeckPresentationSourceZhTw = launchDeckZhTwCopy.reduce(
  (source, [english, traditionalChinese]) => source.replaceAll(english, traditionalChinese),
  launchDeckPresentationSource
);
