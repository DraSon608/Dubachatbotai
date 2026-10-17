import React, { useState, useMemo } from 'react';
import {
  X,
  Cpu,
  Landmark,
  Leaf,
  Flag,
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Shield,
  Zap,
  Globe2,
} from 'lucide-react';
import { BhutanFlagLogo } from './BhutanFlagLogo';

interface BhutanKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
  language: 'en' | 'dz';
}

export const BhutanKnowledgeModal: React.FC<BhutanKnowledgeModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'automation' | 'civics' | 'gnh' | 'symbols' | 'all'>('automation');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isDz = language === 'dz';

  const handleAsk = (prompt: string) => {
    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col h-[90vh] w-full max-w-4xl rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Header with Bhutan Flag Logo */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950">
          <div className="flex items-center gap-3">
            <BhutanFlagLogo size="md" withGlow className="shadow-amber-500/30 ring-1 ring-amber-400/50" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {isDz ? 'འབྲུག་གི་རང་བཞིན་གློག་རིག་དང་ རྒྱལ་འབངས་རིག་པ' : 'Bhutan Automation History & Up-to-Date Civics'}
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/40 font-bold">
                  {isDz ? '༢༠༢༦ གསར་ཤོས' : '2026 Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isDz
                  ? 'དགེ་ལེགས་ཕུ་དྲན་ཤེས་ཁྲོམ་ཚོགས (GMC) དང་ རྒྱལ་ཡོངས་ NDI དེ་ལས་ རྩ་ཁྲིམས་ཆེན་མོའི་གནས་ཚུལ'
                  : 'Gelephu Mindfulness City (GMC), National Digital Identity (NDI), Constitution 2008 & 13th FYP'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar & Quick Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('automation')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition shrink-0 ${
                activeTab === 'automation'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>{isDz ? 'གློག་རིག་དང་རང་བཞིན་བྱུང་རབས' : 'Automation & Tech'}</span>
            </button>

            <button
              onClick={() => setActiveTab('civics')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition shrink-0 ${
                activeTab === 'civics'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>{isDz ? 'རྒྱལ་འབངས་རིག་པ་དང་ རྩ་ཁྲིམས' : 'Civics & Constitution'}</span>
            </button>

            <button
              onClick={() => setActiveTab('gnh')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition shrink-0 ${
                activeTab === 'gnh'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Leaf className="h-3.5 w-3.5" />
              <span>{isDz ? 'རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས' : 'GNH Pillars'}</span>
            </button>

            <button
              onClick={() => setActiveTab('symbols')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition shrink-0 ${
                activeTab === 'symbols'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{isDz ? 'རྒྱལ་དར་དང་ མཚོན་རྟགས' : 'National Flag & Symbols'}</span>
            </button>
          </div>

          {/* In-modal Search Input */}
          <div className="relative shrink-0 w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isDz ? 'གནས་ཚུལ་འཚོལ་ཞིབ...' : 'Filter topics...'}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* TAB 1: Automation & Tech History */}
          {(activeTab === 'automation' || activeTab === 'all') && (
            <div className="space-y-5">
              {/* Gelephu Mindfulness City Banner */}
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-orange-950/30 to-slate-900 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                        {isDz ? 'དགེ་ལེགས་ཕུ་དྲན་ཤེས་ཁྲོམ་ཚོགས (GMC) - མ་འོངས་འཕྲུལ་རྩལ་གྱི་ལྟེ་བ' : 'Gelephu Mindfulness City (GMC) — World’s First Mindfulness SAR'}
                      </h3>
                      <span className="text-[11px] text-amber-200/80">Special Administrative Region (SAR) Act 2024</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleAsk(
                        isDz
                          ? 'དགེ་ལེགས་ཕུ་དྲན་ཤེས་ཁྲོམ་ཚོགས་ (GMC) གི་སྐོར་ལས་ རྒྱས་པར་བཤད་གནང་། ལྗང་ཁུ་ AI data centers དང་ SAR གྱི་དམིགས་ཡུལ་ཚུ་གསལ་བཤད་འབད།'
                          : 'Provide an in-depth, up-to-date briefing on Gelephu Mindfulness City (GMC), its 2024 SAR Act, zero-carbon AI clusters, green finance, and urban vision.'
                      )
                    }
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md active:scale-95 transition"
                  >
                    <span>{isDz ? 'དུ་བ་ལུ་དྲིས' : 'Ask Duba AI'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-[13px]">
                  {isDz
                    ? '༢༠༢༣ སྤྱི་ཟླ་ ༡༢ པའི་ཚེས་ ༡༧ ལུ་ མི་དབང་མངའ་བདག་རིན་པོ་ཆེ་མཆོག་གིས་ རྒྱལ་ཡོངས་དུས་ཆེན་ ༡༡༦ པའི་སྐབས་ དགེ་ལེགས་ཕུ་དྲན་ཤེས་ཁྲོམ་ཚོགས་ (GMC) ཁྱབ་བསྒྲགས་མཛད་གནང་ཡི། སྤྱི་ལོ་ ༢༠༢༤ ལུ་ སྤྱི་ཚོགས་ཀྱིས་ GMC SAR བཅའ་ཁྲིམས་ གཏན་འབེབས་བཟོ་སྟེ་ ཀི་ལོ་མི་ཊར་གྲུ་བཞི་མ་ ༡,༠༠༠ ལྷགཔ་ཅིག་གི་ནང་ བཙོག་མེད་ཆུ་ཤུགས་གློག་མེ་ལག་ལེན་འཐབ་སྟེ་ ལྗང་ཁུ་ AI supercomputers དང་ ཚན་རྩལ་ རང་བཞིན་ལས་རིམ་ཚུ་ གོང་འཕེལ་གཏང་དོ་ཡོད།'
                    : 'Announced on December 17, 2023 by His Majesty King Jigme Khesar Namgyel Wangchuck and formally established under the Gelephu Mindfulness City SAR Act 2024, GMC spans over 1,000 km² as an autonomous Special Administrative Region. It fuses zero-carbon AI supercomputing, green data centers, digital asset governance, quantum computing testbeds, and conscious Buddhist mindfulness.'}
                </p>
              </div>

              {/* Bhutan NDI & Sovereign Bitcoin Hydro Mining */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 hover:border-cyan-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-cyan-300 text-xs sm:text-sm">
                      <Shield className="h-4 w-4 text-cyan-400" />
                      Bhutan NDI (National Digital Identity)
                    </span>
                    <button
                      onClick={() =>
                        handleAsk(
                          isDz
                            ? 'འབྲུག་རྒྱལ་ཡོངས་ NDI (National Digital Identity) གི་སྐོར་ལས་ རྒྱས་པར་བཤད་གནང་།'
                            : 'Explain Bhutan’s National Digital Identity (NDI), the world’s first SSI decentralized blockchain digital citizen system.'
                        )
                      }
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Ask Duba <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isDz
                      ? '༢༠༢༣ སྤྱི་ཟླ་ ༣ པའི་ནང་ འཛམ་གླིང་ནང་འགོ་ཐོག་ Decentralized SSI (Self-Sovereign Identity) ཐོག་ལས་ རྒྱལ་ཡོངས་ NDI བཟོ་ཡི། རྒྱལ་སྲས་འཇིགས་མེད་རྣམ་རྒྱལ་དབང་ཕྱུག་མཆོག་ འགོ་ཐོག་གློག་རིག་རྒྱལ་འབངས་ (First Digital Citizen) ལུ་གྱུར།'
                      : 'Launched in March 2023, Bhutan became the first nation to deploy decentralized Self-Sovereign Identity (SSI) on Hyperledger Indy/Aries blockchain. HRH The Gyalsey Jigme Namgyel Wangchuck was enrolled as Bhutan’s first digital citizen, securing health, banking, and public services without centralized credential risk.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 hover:border-amber-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-amber-300 text-xs sm:text-sm">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Sovereign Hydro Bitcoin & Green Compute
                    </span>
                    <button
                      onClick={() =>
                        handleAsk(
                          isDz
                            ? 'འབྲུག་ DHI གིས་ ཆུ་ཤུགས་གློག་མེ་ལག་ལེན་འཐབ་སྟེ་ Bitcoin དང་ ལྗང་ཁུ་ computing ལག་ལེན་འཐབ་མི་སྐོར་ བཤད་གནང་།'
                            : 'Explain Druk Holding and Investments (DHI) sovereign hydro Bitcoin mining, TeraWulf and Bitdeer partnerships, and computing reserves.'
                        )
                      }
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Ask Duba <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isDz
                      ? 'Druk Holding & Investments (DHI) གིས་ འབྲུག་གི་དུས་ཚོད་བསྟུན་ ཆུ་ཤུགས་གློག་མེ་ལྷག་ལུས་ཚུ་ བཙོག་མེད་ Bitcoin བཟོ་ནི་ནང་ བཙུགས་ཏེ་ རྒྱལ་ཁབ་ཀྱི་མ་རྩ་ དུང་ཕྱུར་ལྷགཔ་ཅིག་ གསོག་འཇོག་འབད་ཡོད།'
                      : 'Bhutan’s sovereign commercial arm, DHI, innovatively channels seasonal surplus hydroelectricity into 100% renewable Bitcoin mining and green compute facilities. Bhutan ranks among the top sovereign state holders of Bitcoin globally, holding over 13,000+ BTC as a resilient sovereign wealth reserve.'}
                  </p>
                </div>
              </div>

              {/* Complete Chronological Timeline */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    {isDz ? 'འབྲུག་གི་གློག་རིག་དང་ རང་བཞིན་ལས་རིམ་གྱི་ བྱུང་རབས་དུས་རིམ (1999 – 2026+)' : 'Chronological Automation & Tech Milestones (1999 – 2026+)'}
                  </h4>
                  <button
                    onClick={() =>
                      handleAsk(
                        'Provide a complete chronological summary of Bhutan’s digital transformation and ICT milestones from 1999 to 2026.'
                      )
                    }
                    className="text-xs text-amber-300 hover:underline flex items-center gap-1"
                  >
                    Ask Timeline <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="border-l-2 border-amber-500/50 pl-4 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                    <div className="font-bold text-amber-300 text-xs">June 2, 1999 — Internet & TV Inauguration</div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isDz
                        ? 'མི་དབང་འབྲུག་རྒྱལ་བཞི་པ་མཆོག་གིས་ དངུལ་གྱི་དུས་སྟོན་སྐབས་ འབྲུག་ལུ་ དྲ་རྒྱ་དང་ BBS རྒྱང་མཐོང་ འགོ་ཐོག་འགོ་འབྱེད་མཛད།'
                        : 'During the Silver Jubilee of His Majesty the Fourth Druk Gyalpo Jigme Singye Wangchuck, Bhutan was connected to the World Wide Web and launched the national television service BBS.'}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                    <div className="font-bold text-cyan-300 text-xs">2007–2018 — National Optical Fiber & G2C Automation</div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isDz
                        ? 'རྫོང་ཁག་ ༢༠ དང་ རྒེད་འོག་ ༢༠༥ ལུ་ འོད་སྐུད་བཙུགས་ཏེ་ གཞུང་གི་ཞབས་ཏོག་ ༡༠༠ ལྷགཔ་ཅིག་ G2C ཐོག་ལས་ རང་བཞིན་བཟོ། གངས་རི་མཚོ་རྡོལ་ཉེན་བརྡའི་ sensor ཚུ་བཙུགས།'
                        : 'High-speed optical fiber backbone laid over transmission grids, linking all 20 Dzongkhags and 205 Gewogs. Launched G2C (Government to Citizen) automating 100+ public civil registry services, e-Sakor land records, and telemetry-linked automated GLOF flood early warning sensors.'}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-4 ring-slate-900" />
                    <div className="font-bold text-indigo-300 text-xs">2020–2023 — GovTech Agency, Sovereign Crypto & Bhutan NDI</div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isDz
                        ? 'གཞུང་སྐྱོང་འཕྲུལ་རྩལ་ལས་ཁུངས་ (GovTech Agency) བཙུགས། འཛམ་གླིང་གི་ འགོ་ཐོག་ Blockchain SSI National Digital Identity དང་ ཆུ་ཤུགས་བཙོག་མེད་ Bitcoin mining འགོ་བཙུགས།'
                        : 'Creation of GovTech Agency in 2022 to unify IT civil service architecture; development of national Electronic Patient Information System (e-PIS); and launch of world’s 1st Self-Sovereign Identity (NDI) alongside sovereign clean crypto mining.'}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                    <div className="font-bold text-emerald-300 text-xs">2024–2026+ — GMC SAR Act, 13th FYP & Sovereign AI</div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isDz
                        ? 'GMC SAR བཅའ་ཁྲིམས་ ༢༠༢༤ གཏན་འབེབས་བཟོ་སྟེ་ ལྗང་ཁུ་ AI data centers དང་ རྒྱལ་ཡོངས་ལོ་ལྔའི་འཆར་གཞི་ ༡༣ པའི་འོག་ལུ་ དངུལ་ཀྲམ་ ༥༡༢ དུང་ཕྱུར་གྱི་ འཕྲུལ་རྩལ་གོང་འཕེལ་འགོ་བཙུགས།'
                        : 'Enactment of the Gelephu Mindfulness City SAR Act 2024, mobilization of the Nu. 512+ Billion 13th Five Year Plan (2024–2029) focusing on high-tech economic restructuring, sovereign AI models in Dzongkha, and world-class quantum & green compute facilities.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Civics & Constitution */}
          {(activeTab === 'civics' || activeTab === 'all') && (
            <div className="space-y-5">
              {/* Constitution Overview */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {isDz ? 'འབྲུག་གི་རྩ་ཁྲིམས་ཆེན་མོ (Constitution of the Kingdom of Bhutan, 2008)' : 'The Constitution of the Kingdom of Bhutan (Adopted July 18, 2008)'}
                    </h3>
                    <span className="text-xs text-amber-400">Supreme Law of the Kingdom</span>
                  </div>
                  <button
                    onClick={() =>
                      handleAsk(
                        isDz
                          ? 'འབྲུག་གི་རྩ་ཁྲིམས་ཆེན་མོའི་ དོན་ཚན་གཙོ་བོ་ཚུ་ དང་ དམངས་གཙོའི་རིང་ལུགས་ གསལ་བཤད་འབད་གནང་།'
                          : 'Provide a comprehensive breakdown of the Constitution of the Kingdom of Bhutan (2008), its core articles, and democratic monarchy system.'
                      )
                    }
                    className="flex items-center gap-1 rounded-xl bg-cyan-600/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/30 transition"
                  >
                    <span>{isDz ? 'དུ་བ་ལུ་དྲིས' : 'Ask Duba'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  {isDz
                    ? '༢༠༠༨ སྤྱི་ཟླ་ ༧ པའི་ཚེས་ ༡༨ ལུ་ མི་དབང་འབྲུག་རྒྱལ་བཞི་པ་དང་ ལྔ་པ་མཆོག་གིས་ གཏན་འབེབས་མཛད་གནང་མི་ རྩ་ཁྲིམས་ཆེན་མོ་འདི་ རྒྱལ་ཁབ་ཀྱི་ ཁྲིམས་ཀྱི་རྩ་བ་མཐོ་ཤོས་ཨིན། འདི་གིས་ འབྲུག་རྒྱལ་ཁབ་འདི་ དམངས་གཙོའི་རྩ་ཁྲིམས་ཅན་གྱི་ རྒྱལ་པོའི་གཞུང་ལུགས་ (Democratic Constitutional Monarchy) ལུ་ གཏན་འཁེལ་བཟོ་ཡི།'
                    : 'Adopted on July 18, 2008, the Constitution established Bhutan as a Democratic Constitutional Monarchy. His Majesty the King (Druk Gyalpo) is Head of State and symbol of unity, while executive governance is vested in the Cabinet (Lhengye Zhungtshog) led by the Prime Minister (Lyonchhen).'}
                </p>
              </div>

              {/* The Three Branches of Government & Current 2024-2026 Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-xs sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px]">1</span>
                    Executive Branch
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Lhengye Zhungtshog (Cabinet)</strong>, headed by the Prime Minister (Lyonchhen). Following the 4th General Elections in Jan 2024, <strong>Dasho Tshering Tobgay</strong> serves as Prime Minister leading the People’s Democratic Party (PDP) government.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[10px]">2</span>
                    Legislative Parliament
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Bicameral Parliament</strong>:
                    <br />• <strong>National Council</strong> (Upper House): 25 non-partisan members (20 elected + 5 King’s nominees) as house of review.
                    <br />• <strong>National Assembly</strong> (Lower House): 47 elected MPs forming government and opposition.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-300 text-xs sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px]">3</span>
                    Judicial Branch
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Royal Court of Justice</strong> headed by the Chief Justice of Bhutan in the <strong>Supreme Court</strong>, High Court, and Dzongkhag / Dungkhag Courts, safeguarding equal justice under the law.
                  </p>
                </div>
              </div>

              {/* 4 Constitutional Bodies & Local Governance */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {isDz ? 'རང་དབང་ཅན་གྱི་ རྩ་ཁྲིམས་ལྷན་ཚོགས་ ༤ (Four Independent Constitutional Bodies)' : 'Four Independent Constitutional Bodies'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <strong className="text-amber-300 block font-bold">RCSC</strong>
                    <span className="text-slate-400 text-[11px]">Royal Civil Service Commission (Civil service merit & neutrality)</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <strong className="text-cyan-300 block font-bold">ECB</strong>
                    <span className="text-slate-400 text-[11px]">Election Commission of Bhutan (Free & transparent elections)</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <strong className="text-rose-300 block font-bold">ACC</strong>
                    <span className="text-slate-400 text-[11px]">Anti-Corruption Commission (Zero-tolerance corruption oversight)</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <strong className="text-emerald-300 block font-bold">RAA</strong>
                    <span className="text-slate-400 text-[11px]">Royal Audit Authority (Public financial integrity & audits)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  <strong>Local Government</strong>: 20 Dzongkhags (headed by elected Dzongkhag Tshogdu chair & Dzongdag), 205 Gewogs (led by elected Gup, Mangmi, Tshogpas), and 4 Class A Thromdes (municipalities headed by Thrompons).
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Gross National Happiness (GNH) */}
          {(activeTab === 'gnh' || activeTab === 'all') && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="font-bold text-emerald-300 text-sm sm:text-base flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                    {isDz ? 'རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས་ (Gross National Happiness - GNH)' : 'The 4 Pillars & 9 Domains of Gross National Happiness'}
                  </h3>
                  <button
                    onClick={() =>
                      handleAsk(
                        isDz
                          ? 'རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས་ (GNH) གི་ ཀ་ཆེན་བཞི་དང་ ཁྱབ་ཁོངས་དགུའི་སྐོར་ལས་ རྒྱས་པར་བཤད་གནང་།'
                          : 'Provide a detailed explanation of Gross National Happiness (GNH), its 4 pillars, 9 domains, and how it balances technology and human wellbeing.'
                      )
                    }
                    className="flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    <span>{isDz ? 'དུ་བ་ལུ་དྲིས' : 'Ask Duba'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  Articulated by His Majesty the Fourth King Jigme Singye Wangchuck in the 1970s, GNH states that true development occurs when spiritual, cultural, and environmental wellbeing progress harmoniously alongside equitable economic prosperity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <strong className="text-emerald-400 block font-bold text-xs sm:text-sm">
                    1. Sustainable & Equitable Socio-Economic Development
                  </strong>
                  <p className="text-slate-400 text-xs">Free universal healthcare, free public education, rural electrification, and narrowing income inequalities without pure commercial exploitation.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <strong className="text-emerald-400 block font-bold text-xs sm:text-sm">
                    2. Environmental Conservation (Article 5)
                  </strong>
                  <p className="text-slate-400 text-xs">Constitutional mandate to maintain at least 60% forest cover in perpetuity. Bhutan maintains over 71% forest cover and is the world’s first net carbon-negative nation.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <strong className="text-emerald-400 block font-bold text-xs sm:text-sm">
                    3. Preservation & Promotion of Cultural Heritage
                  </strong>
                  <p className="text-slate-400 text-xs">Protection of traditional arts (Zorig Chusum), Dzong architecture, Dzongkha language, national dress (Gho & Kira), and Driglam Namzha etiquette.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <strong className="text-emerald-400 block font-bold text-xs sm:text-sm">
                    4. Good Governance & Digital Service Delivery
                  </strong>
                  <p className="text-slate-400 text-xs">Transparent, merit-based, and accountable administration, citizen e-services, automated anti-corruption safeguards, and responsive civic leadership.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: National Flag & Symbols */}
          {(activeTab === 'symbols' || activeTab === 'all') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-amber-500/30 bg-slate-950 p-5">
                <BhutanFlagLogo size="xl" withGlow className="shrink-0" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      {isDz ? 'འབྲུག་གི་རྒྱལ་དར (The National Flag of Bhutan)' : 'The National Flag of Bhutan (འབྲུག་གི་རྒྱལ་དར)'}
                    </h4>
                    <button
                      onClick={() =>
                        handleAsk(
                          isDz
                            ? 'འབྲུག་གི་རྒྱལ་དར་གྱི་ བཟོ་བཀོད་དང་ ཚོན་དོན་ཚུ་ རྒྱས་པར་བཤད་གནང་།'
                            : 'Explain the symbolic design, colors, and thunder dragon (Druk) of the National Flag of Bhutan.'
                        )
                      }
                      className="text-xs text-amber-300 hover:underline flex items-center gap-1"
                    >
                      Ask Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                    Divided diagonally into golden-yellow (symbolizing the temporal authority of the King as secular leader) and warm orange (representing the spiritual power of Drukpa Kagyu Buddhism). Centered along the diagonal is the immaculate white <strong>Druk (Thunder Dragon)</strong> signifying the purity of inner thoughts and deeds, snarling in defense of the sovereignty and grasping four precious wish-fulfilling jewels (norbu) in its claws representing national wealth and security.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <strong className="text-amber-300 block font-bold">National Animal: Takin</strong>
                  <span className="text-slate-400 text-[11px]">Budorcas taxicolor whitei, indigenous to high Himalayas, associated with Lama Drukpa Kunley.</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <strong className="text-cyan-300 block font-bold">National Flower: Blue Poppy</strong>
                  <span className="text-slate-400 text-[11px]">Meconopsis gakyidiana, blooming on rugged mountain ridges above 3,500m.</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <strong className="text-indigo-300 block font-bold">National Dress: Gho & Kira</strong>
                  <span className="text-slate-400 text-[11px]">Worn with official scarves (Kabney/Rachu) reflecting civic rank from King to citizen.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
