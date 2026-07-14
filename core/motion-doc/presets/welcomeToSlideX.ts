export const welcomePresentationId = "welcome-to-slidex";
export const welcomePresentationSeedVersion = 9;
export const welcomePresentationTitle = "Welcome to SlideX";

export const welcomePresentationSource = `# Welcome to SlideX

<Slide duration={6} theme="dark" background="#ec5f39" accent="#f7f7f5" textColor="#f7f7f5" mutedColor="#b8b8b4" alignX="left" alignY="center" textAlign="left" slideTransition="scale" transitionDuration={0.8}>
  <Title fontSize={72} fontWeight={700} x={3.2} y={22.9} w={86.8} h={47.7} enter="reveal" color="#ffffff" lineHeight={1.25} delay={0.24} duration={0.92}>Create presentations that feel like modern websites.</Title>
  <Text fontSize={18} fontWeight={600} x={3.6} y={4.7} w={40} h={2.5} enter="fadeIn" color="#ffffff" delay={0.1} duration={0.4}>2026</Text>
  <Text fontSize={18} fontWeight={600} x={3.4} y={87.9} w={40} h={2.5} enter="rise" color="#ffffff" delay={0.64} duration={0.65}>Level up team collaboration</Text>
  <Text fontSize={18} fontWeight={600} x={67.7} y={90.3} w={28.9} h={4.3} enter="fadeIn" color="#ffffff" textAlign="right" delay={0.76} duration={0.5}>SlideX.com</Text>
  <Text fontSize={18} fontWeight={600} x={56.4} y={4.4} w={40} h={2.5} enter="fadeIn" color="#ffffff" textAlign="right" delay={0.18} duration={0.4}>SlideX</Text>
</Slide>

<Slide duration={6.5} theme="light" background="#ffffff" accent="#111111" textColor="#111111" mutedColor="#656565" slideTransition="pushLeft" transitionDuration={0.82}>
  <Title enter="reveal" fontSize={48} x={3.5} y={23.1} w={50.4} h={13.7} fontWeight={650} color="#000000" lineHeight={1.2} delay={0.22} duration={0.78}>Meet SlideX</Title>
  <Text enter="fadeUp" fontSize={24} x={3.7} y={40.5} w={51.7} h={32} delay={0.36} duration={0.82}>SlideX is a presentation platform designed for modern teams, creators, and product builders.
Instead of working with static slides, you can create flexible, web-based presentations that are easier to design, update, and share.</Text>
  <Text fontSize={18} fontWeight={600} x={3.6} y={88.9} w={40} h={2.5} enter="rise" color="#020617" delay={0.78} duration={0.58}>Level up team collaboration</Text>
  <Text fontSize={18} fontWeight={600} x={67.7} y={90.2} w={28.9} h={4.3} enter="fadeIn" textAlign="right" color="#020617" delay={0.88} duration={0.48}>SlideX.com</Text>
  <Text fontSize={18} fontWeight={600} x={56.3} y={4.3} w={40} h={2.5} enter="fadeIn" textAlign="right" color="#020617" delay={0.18} duration={0.38}>SlideX</Text>
  <Text fontSize={18} fontWeight={600} x={3.5} y={4.6} w={40} h={2.5} enter="fadeIn" color="#000000" delay={0.12} duration={0.38}>2026</Text>
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={16} x={61} y={15} w={36} h={65.1} alt="Astronaut and android looking toward Earth from the moon" src="https://animark-media-library.zz41354899.chatgpt.site/media/optimized/project/moon-collaboration.webp" delay={0.06} duration={0.9} />
</Slide>

<Slide duration={7} theme="light" background="#f2eee8" accent="#111315" textColor="#111315" mutedColor="#65615b" slideTransition="fade">
  <ImageBlock fit="cover" scaleX={1} scaleY={1} enter="blurIn" radius={18} x={55} y={11} w={40} h={76} alt="Editorial 3D visualization of the SlideX presentation canvas" src="https://animark-media-library.zz41354899.chatgpt.site/media/optimized/project/precision-canvas.webp" delay={0.08} duration={0.9} />
  <Title fontSize={44} fontWeight={700} lineHeight={1.02} x={3.5} y={17} w={44} h={30} enter="slideLeft" color="#111315" delay={0}>Keep every element exactly where it belongs.</Title>
  <Text fontSize={18} lineHeight={1.48} x={3.7} y={53} w={42} h={20} enter="fadeUp" color="#4f4b46" delay={0.12}>Arrange text, data, and media on one precise canvas. Keep every position intact from editing through playback and export.</Text>
  <Text fontSize={16} fontWeight={700} x={3.6} y={4.7} w={30} h={3} enter="fadeIn" color="#111315">03 / PRECISE CANVAS</Text>
  <Text fontSize={16} fontWeight={600} x={3.6} y={90} w={45} h={3} enter="fadeUp" color="#111315" delay={0.18}>EDIT · PLAY · EXPORT</Text>
  <Text fontSize={16} fontWeight={600} x={70} y={90} w={26} h={3} enter="fadeUp" textAlign="right" color="#111315" delay={0.18}>SlideX.com</Text>
</Slide>

<Slide duration={7} theme="dark" background="#111315" accent="#c4ee87" textColor="#f7f7f4" mutedColor="#a3a5a7" slideTransition="pushLeft">
  <Shape shape="rectangle" fill="#191b1e" stroke="#34373c" strokeWidth={1} radius={12} x={3.5} y={42} w={29} h={43} enter="fadeUp" delay={0.1} />
  <Shape shape="rectangle" fill="#191b1e" stroke="#34373c" strokeWidth={1} radius={12} x={35.5} y={42} w={29} h={43} enter="fadeUp" delay={0.16} />
  <Shape shape="rectangle" fill="#191b1e" stroke="#34373c" strokeWidth={1} radius={12} x={67.5} y={42} w={29} h={43} enter="fadeUp" delay={0.22} />
  <Title fontSize={46} fontWeight={700} lineHeight={1.02} x={3.5} y={12} w={82} h={19} enter="slideLeft" color="#f7f7f4">A small set of blocks. A complete visual language.</Title>
  <Text fontSize={18} lineHeight={1.4} x={3.7} y={33} w={72} h={6} enter="fadeUp" color="#a3a5a7" delay={0.08}>Compose the story from real, editable layers—not flattened screenshots.</Text>
  <Icon icon="FileText" background="#c4ee87" color="#111315" strokeWidth={2.4} radius={12} x={6.5} y={48} w={6} h={10} enter="zoomIn" delay={0.18} />
  <Text fontSize={23} fontWeight={700} x={6.5} y={62} w={23} h={6} enter="fadeUp" color="#f7f7f4" delay={0.2}>Text + layout</Text>
  <Text fontSize={16} lineHeight={1.45} x={6.5} y={71} w={22} h={10} enter="fadeUp" color="#a3a5a7" delay={0.24}>Typography, alignment, and exact frames stay editable.</Text>
  <Icon icon="BarChart3" background="#9ad7ff" color="#111315" strokeWidth={2.4} radius={12} x={38.5} y={48} w={6} h={10} enter="zoomIn" delay={0.24} />
  <Text fontSize={23} fontWeight={700} x={38.5} y={62} w={23} h={6} enter="fadeUp" color="#f7f7f4" delay={0.26}>Data blocks</Text>
  <Text fontSize={16} lineHeight={1.45} x={38.5} y={71} w={22} h={10} enter="fadeUp" color="#a3a5a7" delay={0.3}>Charts and tables live inside the same visual system.</Text>
  <Icon icon="Image" background="#ff8aa1" color="#111315" strokeWidth={2.4} radius={12} x={70.5} y={48} w={6} h={10} enter="zoomIn" delay={0.3} />
  <Text fontSize={23} fontWeight={700} x={70.5} y={62} w={23} h={6} enter="fadeUp" color="#f7f7f4" delay={0.32}>Media layers</Text>
  <Text fontSize={16} lineHeight={1.45} x={70.5} y={71} w={22} h={10} enter="fadeUp" color="#a3a5a7" delay={0.36}>Images, video, shapes, and icons share one canvas.</Text>
  <Text fontSize={16} fontWeight={600} x={3.6} y={91} w={38} h={3} color="#c4ee87">04 / BUILDING BLOCKS</Text>
</Slide>

<Slide duration={7} theme="light" background="#f7f7f4" accent="#111315" textColor="#111315" mutedColor="#666a6d" slideTransition="wipe">
  <Shape shape="rectangle" fill="#ffffff" stroke="#d8d9d5" strokeWidth={1} radius={12} x={3.5} y={45} w={29} h={39} enter="fadeUp" delay={0.1} />
  <Shape shape="rectangle" fill="#ffffff" stroke="#d8d9d5" strokeWidth={1} radius={12} x={35.5} y={45} w={29} h={39} enter="fadeUp" delay={0.16} />
  <Shape shape="rectangle" fill="#ffffff" stroke="#d8d9d5" strokeWidth={1} radius={12} x={67.5} y={45} w={29} h={39} enter="fadeUp" delay={0.22} />
  <Title fontSize={50} fontWeight={700} lineHeight={1.02} x={3.5} y={12} w={82} h={19} enter="slideLeft" color="#111315">One composition, every destination.</Title>
  <Text fontSize={19} lineHeight={1.45} x={3.7} y={33} w={72} h={8} enter="fadeUp" color="#666a6d" delay={0.08}>Build, present, and hand off without rebuilding the story for each format.</Text>
  <Icon icon="Layers" background="#111315" color="#ffffff" strokeWidth={2.4} radius={10} x={6.5} y={50} w={5.5} h={9} enter="zoomIn" delay={0.18} />
  <Text fontSize={22} fontWeight={700} x={6.5} y={63} w={22} h={6} color="#111315" enter="fadeUp" delay={0.2}>Build</Text>
  <Text fontSize={15} lineHeight={1.45} x={6.5} y={72} w={22} h={8} color="#666a6d" enter="fadeUp" delay={0.24}>Arrange slides, layers, data, and media on the precise canvas.</Text>
  <Icon icon="Presentation" background="#8176ff" color="#111315" strokeWidth={2.4} radius={10} x={38.5} y={50} w={5.5} h={9} enter="zoomIn" delay={0.24} />
  <Text fontSize={22} fontWeight={700} x={38.5} y={63} w={22} h={6} color="#111315" enter="fadeUp" delay={0.26}>Play</Text>
  <Text fontSize={15} lineHeight={1.45} x={38.5} y={72} w={22} h={8} color="#666a6d" enter="fadeUp" delay={0.3}>Preview transitions and motion as one composed presentation.</Text>
  <Icon icon="Download" background="#c4ee87" color="#111315" strokeWidth={2.4} radius={10} x={70.5} y={50} w={5.5} h={9} enter="zoomIn" delay={0.3} />
  <Text fontSize={22} fontWeight={700} x={70.5} y={63} w={22} h={6} color="#111315" enter="fadeUp" delay={0.32}>Export</Text>
  <Text fontSize={15} lineHeight={1.45} x={70.5} y={72} w={22} h={8} color="#666a6d" enter="fadeUp" delay={0.36}>Take the deck to MDX, HTML, PPTX, PDF, or images.</Text>
  <Text fontSize={16} fontWeight={600} x={3.6} y={91} w={42} h={3} color="#111315">05 / BUILD · PLAY · EXPORT</Text>
</Slide>

<Slide duration={15.02} theme="dark" background="#000000" accent="#ffffff" textColor="#ffffff" slideTransition="fade" transitionDuration={0.5}>
  <VideoBlock title="SlideX intro" fit="cover" src="https://animark-media-library.zz41354899.chatgpt.site/media/optimized/project/slidex-intro.mp4" controls={false} loop={false} muted={true} radius={0} x={0} y={0} w={100} h={100} enter="fadeIn" delay={0} duration={0.4} />
</Slide>`;
