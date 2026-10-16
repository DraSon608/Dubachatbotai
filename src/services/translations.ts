export interface TranslationDictionary {
  appName: string;
  tagline: string;
  newChat: string;
  searchPlaceholder: string;
  pinned: string;
  today: string;
  yesterday: string;
  previous7Days: string;
  older: string;
  noChats: string;
  automationHub: string;
  codeSandbox: string;
  settings: string;
  online: string;
  offline: string;
  forcedOffline: string;
  autoPilot: string;
  autoPilotDesc: string;
  cloudTurbo: string;
  cloudTurboDesc: string;
  offlineCore: string;
  offlineCoreDesc: string;
  inputPlaceholderOnline: string;
  inputPlaceholderOffline: string;
  inputListening: string;
  disclaimer: string;
  installApp: string;
  installAppIos: string;
  stop: string;
  send: string;
  copy: string;
  copied: string;
  readAloud: string;
  stopSpeaking: string;
  regenerate: string;
  runCode: string;
  you: string;
  dubaAi: string;
  offlineBanner: string;
  disableForcedOffline: string;
  howCanIHelp: string;
  heroSub: string;
  starterPythonLabel: string;
  starterPythonPrompt: string;
  starterMathLabel: string;
  starterMathPrompt: string;
  starterSummaryLabel: string;
  starterSummaryPrompt: string;
  starterBhutanLabel: string;
  starterBhutanPrompt: string;
  languageToggle: string;
  dzongkhaName: string;
}

export const translations: Record<'en' | 'dz', TranslationDictionary> = {
  en: {
    appName: 'DUBA AI',
    tagline: 'Automated Intelligence',
    newChat: 'New Conversation',
    searchPlaceholder: 'Search chat history...',
    pinned: 'Pinned',
    today: 'Today',
    yesterday: 'Yesterday',
    previous7Days: 'Previous 7 Days',
    older: 'Older',
    noChats: 'No conversations found.',
    automationHub: 'Automation Hub & Prompts',
    codeSandbox: 'Code Sandbox Runner',
    settings: 'Settings',
    online: 'Online',
    offline: 'Duba Offline Core',
    forcedOffline: 'Forced Offline',
    autoPilot: 'Auto-Pilot (Adaptive)',
    autoPilotDesc: 'Cloud when online, instant seamless offline fallback.',
    cloudTurbo: 'Cloud Turbo (Gemini 3.8)',
    cloudTurboDesc: 'Ultra-deep cloud reasoning and full frontier intelligence.',
    offlineCore: 'Offline Neural Core',
    offlineCoreDesc: '100% on-device local brain, zero network required.',
    inputPlaceholderOnline: 'Ask Duba anything, run automation, or generate code...',
    inputPlaceholderOffline: 'Duba Offline Core is active — ask questions, code, or math...',
    inputListening: 'Listening to your voice dictation...',
    disclaimer: 'Duba Chatbot operates both online and offline. Verify critical output.',
    installApp: 'Install Duba App',
    installAppIos: 'Install on iOS',
    stop: 'Stop',
    send: 'Send',
    copy: 'Copy',
    copied: 'Copied',
    readAloud: 'Read aloud',
    stopSpeaking: 'Stop speaking',
    regenerate: 'Regenerate response',
    runCode: 'Run Code',
    you: 'You',
    dubaAi: 'Duba AI',
    offlineBanner: 'Offline Intelligence Active: Duba On-Device Neural Core is answering your queries locally without network requests.',
    disableForcedOffline: 'Disable Forced Offline',
    howCanIHelp: 'How can Duba automate your work today?',
    heroSub: 'Duba is equipped with online Gemini 3.8 Flash intelligence and an edge neural core that works 100% offline.',
    starterPythonLabel: 'Python automation script',
    starterPythonPrompt: 'Write an automated Python script to clean and deduplicate CSV files.',
    starterMathLabel: 'Offline Math & Logic',
    starterMathPrompt: 'Calculate compound interest on $10,000 at 7% annual return over 10 years.',
    starterSummaryLabel: 'Summarize Document',
    starterSummaryPrompt: 'summarize: Artificial intelligence is transforming modern productivity by automating repetitive tasks, synthesizing complex datasets, and enabling intelligent edge devices to work completely offline.',
    starterBhutanLabel: 'Bhutan Culture & GNH',
    starterBhutanPrompt: 'Explain the four pillars and nine domains of Gross National Happiness (GNH) in Bhutan.',
    languageToggle: 'Language / སྐད་ཡིག',
    dzongkhaName: 'རྫོང་ཁ (Dzongkha)',
  },
  dz: {
    appName: 'འབྲུག་དུ་བ AI',
    tagline: 'རང་བཞིན་རིག་སྟོབས་རྩིས་འཕྲུལ',
    newChat: 'གླེང་མོལ་གསརཔ',
    searchPlaceholder: 'གླེང་མོལ་འཚོལ་ཞིབ་འབད...',
    pinned: 'གལ་ཅན་སྦྲགས་ཡོདཔ',
    today: 'དེ་རིང',
    yesterday: 'ཁ་ཙ',
    previous7Days: 'ཞག་ ༧ གྱི་ཧེ་མ',
    older: 'ཧེ་མའི',
    noChats: 'གླེང་མོལ་མ་ཐོབ།',
    automationHub: 'རང་བཞིན་ལས་རིམ་དང་དཔེ་ཚུ',
    codeSandbox: 'གློག་རིག་བརྟག་དཔྱད་ཁང',
    settings: 'གཞི་སྒྲིག',
    online: 'རྒྱུན་འབྲེལ་ཡོདཔ',
    offline: 'རྒྱུན་འབྲེལ་མེད་པའི་དུ་བ',
    forcedOffline: 'བཙན་ཤུགས་རྒྱུན་འབྲེལ་མེདཔ',
    autoPilot: 'རང་བཞིན་འགོ་འདྲེན',
    autoPilotDesc: 'དྲ་རྒྱ་ཡོད་ཚེ་སྤྲིན་ཚོགས་དང་ མེད་ཚེ་རང་སོའི་རིག་རྩལ་ལག་ལེན་འཐབ་ཨིན།',
    cloudTurbo: 'སྤྲིན་ཚོགས་མགྱོགས་འགྲོས (Gemini)',
    cloudTurboDesc: 'རྒྱལ་སྤྱིའི་སྤྲིན་ཚོགས་རིག་སྟོབས་ཀྱི་མཐུ་རྩལ།',
    offlineCore: 'རང་སོའི་ནང་འཁོད་རིག་རྩལ',
    offlineCoreDesc: 'དྲ་རྒྱ་མེད་པར་བརྒྱ་ཆ་ ༡༠༠ འཕྲུལ་ཆས་ནང་ལཱ་འབད་ཚུགས།',
    inputPlaceholderOnline: 'དུ་བ་ལུ་ག་ཅི་ཡང་དྲིས། རང་བཞིན་ལས་རིམ་དང་ གློག་རིག་བཟོ...',
    inputPlaceholderOffline: 'དུ་བ་རྒྱུན་འབྲེལ་མེད་པའི་རིག་རྩལ་གྲ་སྒྲིག་ཡོད — དྲི་བ་དང་རྩིས་རིག་དྲིས...',
    inputListening: 'ཁྱོད་ཀྱི་གསུང་སྐད་ཉན་དོ...',
    disclaimer: 'དུ་བ་གླེང་མོལ་རྩིས་འཕྲུལ་འདི་ དྲ་རྒྱ་ཡོད་མེད་གཉིས་ཆ་རར་ལཱ་འབད་ཚུགས།',
    installApp: 'དུ་བ་གློག་རིམ་གཞི་བཙུགས་འབད',
    installAppIos: 'iOS ནང་གཞི་བཙུགས་འབད',
    stop: 'བཀག་དཱ',
    send: 'གཏང་དཱ',
    copy: 'འདྲ་བཤུས',
    copied: 'འདྲ་བཤུས་གྲུབ',
    readAloud: 'སྐད་ཐོག་ལས་ལྷག',
    stopSpeaking: 'སྐད་བཀག',
    regenerate: 'ལོག་སྟེ་བཟོ',
    runCode: 'གློག་རིག་འགོ་འབྱེད',
    you: 'ཁྱོད',
    dubaAi: 'དུ་བ་ AI',
    offlineBanner: 'རྒྱུན་འབྲེལ་མེད་པའི་རིག་རྩལ་ལཱ་འབད་དོ: དུ་བ་ནང་འཁོད་རིག་རྩལ་གྱིས་དྲ་རྒྱའི་དགོས་མཁོ་མེད་པར་ལན་གསལ་ཕུལ་དོ།',
    disableForcedOffline: 'བཙན་ཤུགས་རྒྱུན་འབྲེལ་མེད་པ་བཀག་དཱ',
    howCanIHelp: 'དེ་རིང་དུ་བ་གྱིས་ཁྱོད་ཀྱི་ཕྱག་ལཱ་ག་ཅི་རང་བཞིན་བཟོ་བྱིན་གེ?',
    heroSub: 'དུ་བ་འདི་ སྤྲིན་ཚོགས་རིག་སྟོབས་ Gemini 3.8 དང་ དྲ་རྒྱ་མེད་པའི་ནང་འཁོད་རིག་རྩལ་གཉིས་ཆ་ར་དང་ལྡནམ་ཨིན།',
    starterPythonLabel: 'Python རང་བཞིན་གློག་རིག',
    starterPythonPrompt: 'CSV ཡིག་ཆ་ཚུ་རང་བཞིན་གྱིས་གཙང་སྦྲ་དང་བསྐྱར་ཟློས་མེདཔ་བཟོ་མི་ Python གློག་རིམ་ཅིག་བྲིས།',
    starterMathLabel: 'ཀླད་རྩིས་དང་ཨང་རྩིས',
    starterMathPrompt: 'དངུལ་ཀྲམ་ ༡༠,༠༠༠ ལུ་ ལོ་ ༡༠ གི་རིང་ སྐྱེད་བརྒྱ་ཆ་ ༧ རེ་བརྩིས་ཏེ་ སྐྱེད་བསྡོམས་རྩིས་སྟོན།',
    starterSummaryLabel: 'ཡིག་ཆ་བསྡུས་དོན',
    starterSummaryPrompt: 'summarize: འབྲུག་རྒྱལ་ཁབ་ནང་ རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས་ (GNH) འདི་ རྒྱལ་ཡོངས་གོང་འཕེལ་གྱི་དམིགས་ཡུལ་གཙོ་བོ་ཅིག་ཨིན། འདི་གིས་ དཔལ་འབྱོར་གཅིག་རྐྱངམ་གཅིག་མིན་པར་ མི་སྡེའི་བདེ་སྐྱིད་དང་ རང་བཞིན་གནས་སྟངས་ ལམ་སྲོལ་སྲུང་སྐྱོབ་ཚུ་ལུ་གཙོ་བོར་བཟུང་ཨིན།',
    starterBhutanLabel: 'འབྲུག་གི་ལམ་སྲོལ་དང་ རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས',
    starterBhutanPrompt: 'འབྲུག་གི་རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས་ (GNH) ཀྱི་ཀ་ཆེན་བཞི་དང་ ཁྱབ་ཁོངས་དགུ་གི་སྐོར་ལས་ རྫོང་ཁའི་ཐོག་ལས་གསལ་བཤད་འབད་གནང་།',
    languageToggle: 'སྐད་ཡིག / Language',
    dzongkhaName: 'རྫོང་ཁ (Dzongkha)',
  },
};
