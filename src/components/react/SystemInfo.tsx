import React, { useEffect, useState } from 'react';

type SystemInfoItem = {
  label: string;
  value: string;
};

type UAData = {
  platform?: string;
  brands?: { brand: string; version: string }[];
};

interface Props {
  fallback?: SystemInfoItem[];
}

const NEOFETCH_LOGOS = {
  windows: `        ,.=:!!t3Z3z.,
       :tt:::tt333EE3
       Et:::ztt33EEEL @Ee.,      ..,
      ;tt:::tt333EE7 ;EEEEEEttttt33#
     :Et:::zt333EEQ. $EEEEEttttt33QL
     it::::tt333EEF @EEEEEEttttt33F
    ;3=*^\`\`\`"*4EEV :EEEEEEttttt33@.
    ,.=::::!t=., \` @EEEEEEtttz33QF
   ;::::::::zt33)   "4EEEtttji3P*
  :t::::::::tt33.:Z3z..  \`\` ,..g.
  i::::::::zt33F AEEEtttt::::ztF
 ;:::::::::t33V ;EEEttttt::::t3
 E::::::::zt33L @EEEtttt::::z3F
{3=*^\`\`\`"*4E3) ;EEEtttt:::::tZ\`
             \` :EEEEtttt::::z7
                 "VEzjt:;;z>*\``,
  macos: String.raw`                    c.'
                 ,xNMM.
               .OMMMMo
               lMM"
     .;loddo:.  .olloddol;.
   cKMMMMMMMMMMNWMMMMMMMMMM0:
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.
 XMMMMMMMMMMMMMMMMMMMMMMMX.
;MMMMMMMMMMMMMMMMMMMMMMMM:
:MMMMMMMMMMMMMMMMMMMMMMMM:
.MMMMMMMMMMMMMMMMMMMMMMMX.
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.
 'XMMMMMMMMMMMMMMMMMMMMMMMMMMk
  'XMMMMMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMMMMMd
     ;KMMMMMMMWXXWMMMMMMMk.
       "cooc*"    "*coo'"`,
  android: `         -o          o-
          +hydNNNNdyh+
        +mMMMMMMMMMMMMm+
      \`dMMm:NMMMMMMN:mMMd\`
      hMMMMMMMMMMMMMMMMMMh
  ..  yyyyyyyyyyyyyyyyyyyy  ..
.mMMm\`MMMMMMMMMMMMMMMMMMMM\`mMMm.
:MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:
:MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:
:MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:
:MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:
-MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM-
 +yy+ MMMMMMMMMMMMMMMMMMMM +yy+
      mMMMMMMMMMMMMMMMMMMm
      \`/++MMMMh++hMMMM++/\`
          MMMMo  oMMMM
          MMMMo  oMMMM
          oNMm-  -mMNs`,
  linux: String.raw`        #####
       #######
       ##O#O##
       #######
     ###########
    #############
   ###############
   ################
  #################
#####################
#####################
  #################`,
  ubuntu: `            .-/+oossssoo+\\-.
        ´:+ssssssssssssssssss+:\`
      -+ssssssssssssssssssyyssss+-
    .ossssssssssssssssssdMMMNysssso.
   /ssssssssssshdmmNNmmyNMMMMhssssss\\
  +ssssssssshmydMMMMMMMNddddyssssssss+
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss\\
.sssssssssdMMMNhsssssssssshNMMMdssssssss.
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
.sssssssssdMMMNhsssssssssshNMMMdssssssss.
 \\sssssssshNMMMyhhyyyyhdNMMMNhssssssss/
  +sssssssssdmydMMMMMMMMddddyssssssss+
   \\ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+sssssssssssssssssyyyssss+-
        \`:+ssssssssssssssssss+:\`
            .-\\+oossssoo+/-.`,
  debian: `       _,met$$$$$gg.
    ,g$$$$$$$$$$$$$$$P.
  ,g$$P"        """Y$$.".
 ,$$P'              \`$$$.
',$$P       ,ggs.     \`$$b:
\`d$$'     ,$P"'   .    $$$
 $$P      d$'     ,    $$P
 $$:      $$.   -    ,d$$'
 $$;      Y$b._   _,d$P'
 Y$$.    \`.\`"Y$$$$P"'
 \`$$b      "-.__
  \`Y$$
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""`,
  fedora: String.raw`             .',;::::;,'.
         .';:cccccccccccc:;,.
      .;cccccccccccccccccccccc;.
    .:cccccccccccccccccccccccccc:.
  .;ccccccccccccc;.:dddl:.;ccccccc;.
 .:ccccccccccccc;OWMKOOXMWd;ccccccc:.
.:ccccccccccccc;KMMc;cc;xMMc;ccccccc:.
,cccccccccccccc;MMM.;cc;;WW:;cccccccc,
:cccccccccccccc;MMM.;cccccccccccccccc:
:ccccccc;oxOOOo;MMM0OOk.;cccccccccccc:
cccccc;0MMKxdd:;MMMkddc.;cccccccccccc;
ccccc;XM0';cccc;MMM.;cccccccccccccccc'
ccccc;MMo;ccccc;MMW.;ccccccccccccccc;
ccccc;0MNc.ccc.xMMd;ccccccccccccccc;
cccccc;dNMWXXXWM0:;cccccccccccccc:,
cccccccc;.:odl:.;cccccccccccccc:,.
:cccccccccccccccccccccccccccc:'.
.:cccccccccccccccccccccc:;,..
  '::cccccccccccccc::;,.'`,
  arch: `                   -\`
                  .o+\`
                 \`ooo/
                \`+oooo:
               \`+oooooo:
               -+oooooo+:
             \`/:-:++oooo+:
            \`/++++/+++++++:
           \`/++++++++++++++:
          \`/+++ooooooooooooo/\`
         ./ooosssso++osssssso+\`
        .oossssso-\`\`\`\`/ossssss+\`
       -osssssso.      :ssssssso.
      :osssssss/        osssso+++.
     /ossssssss/        +ssssooo/-
   \`/ossssso+/:-        -:/+osssso+-
  \`+sso+:-\`                 \`.-/+oso:
 \`++:.                           \`-/+/
 .\`                                 \`/`,
  manjaro: String.raw`██████████████████  ████████
██████████████████  ████████
██████████████████  ████████
██████████████████  ████████
████████            ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████
████████  ████████  ████████`,
  linuxmint: `             ...-:::::-...
          .-MMMMMMMMMMMMMMM-.
      .-MMMM\`..-:::::::-..\`MMMM-.
    .:MMMM.:MMMMMMMMMMMMMMM:.MMMM:.
   -MMM-M---MMMMMMMMMMMMMMMMMMM.MMM-
 \`:MMM:MM\`  :MMMM:....::-...-MMMM:MMM:\`
 :MMM:MMM\`  :MM:\`  \`\`    \`\`  \`:MMM:MMM:
.MMM.MMMM\`  :MM.  -MM.  .MM-  \`MMMM.MMM.
:MMM:MMMM\`  :MM.  -MM-  .MM:  \`MMMM-MMM:
:MMM:MMMM\`  :MM.  -MM-  .MM:  \`MMMM:MMM:
:MMM:MMMM\`  :MM.  -MM-  .MM:  \`MMMM-MMM:
.MMM.MMMM\`  :MM:--:MM:--:MM:  \`MMMM.MMM.
 :MMM:MMM-  \`-MMMMMMMMMMMM-\`  -MMM-MMM:
  :MMM:MMM:\`                \`:MMM:MMM:
   .MMM.MMMM:--------------:MMMM.MMM.
     '-MMMM.-MMMMMMMMMMMMMMM-.MMMM-'
       '.-MMMM\`\`--:::::--\`\`MMMM-.'
            '-MMMMMMMMMMMMM-'
               \`\`-:::::-\`\``,
  popos: String.raw`             /////////////
         /////////////////////
      ///////*767////////////////
    //////7676767676*//////////////
   /////76767//7676767//////////////
  /////767676///*76767///////////////
 ///////767676///76767.///7676*///////
/////////767676//76767///767676////////
//////////76767676767////76767/////////
///////////76767676//////7676//////////
////////////,7676,///////767///////////
/////////////*7676///////76////////////
///////////////7676////////////////////
 ///////////////7676///767////////////
  //////////////////////'////////////
   //////.7676767676767676767,//////
    /////767676767676767676767/////
      ///////////////////////////
         /////////////////////
             /////////////`,
  opensuse: String.raw`           .;ldkO0000Okdl;.
       .;d00xl:^''''''^:ok00d;.
     .d00l'                'o00d.
   .d0Kd'  Okxol:;,.          :O0d.
  .OKKKK0kOKKKKKKKKKKOxo:,      lKO.
 ,0KKKKKKKKKKKKKKKK0P^,,,^dx:    ;00,
.OKKKKKKKKKKKKKKKKk'.oOPPb.'0k.   cKO.
:KKKKKKKKKKKKKKKKK: kKx..dd lKd   'OK:
dKKKKKKKKKKKOx0KKKd ^0KKKO' kKKc   dKd
dKKKKKKKKKKKK;.;oOKx,..^..;kKKK0.  dKd
:KKKKKKKKKKKK0o;...^cdxxOK0O/^^'  .0K:
 kKKKKKKKKKKKKKKK0x;,,......,;od  lKk
 '0KKKKKKKKKKKKKKKKKKKKK00KKOo^  c00'
  'kKKKOxddxkOO00000Okxoc;''   .dKk'
    l0Ko.                    .c00l'
     'l0Kk:.              .;xK0l'
        'lkK0xl:;,,,,;:ldO0kl'
            '^:ldxkkkkxdl:^'`,
} as const;

type NeofetchLogoKey = keyof typeof NEOFETCH_LOGOS;

const detectLogoKey = (os: string, ua: string): NeofetchLogoKey => {
  const osName = os.toLowerCase();
  const uaName = ua.toLowerCase();

  if (osName.includes('windows') || uaName.includes('windows nt')) return 'windows';
  if (osName.includes('mac') || osName.includes('ios') || uaName.includes('mac os x')) return 'macos';
  if (osName.includes('android') || uaName.includes('android')) return 'android';

  if (osName.includes('linux') || uaName.includes('linux')) {
    if (uaName.includes('ubuntu')) return 'ubuntu';
    if (uaName.includes('debian')) return 'debian';
    if (uaName.includes('fedora')) return 'fedora';
    if (uaName.includes('arch')) return 'arch';
    if (uaName.includes('manjaro')) return 'manjaro';
    if (uaName.includes('mint') || uaName.includes('linux mint')) return 'linuxmint';
    if (uaName.includes('pop!_os') || uaName.includes('popos') || uaName.includes('pop_os')) return 'popos';
    if (uaName.includes('opensuse') || uaName.includes('open suse') || uaName.includes('suse')) return 'opensuse';
    return 'linux';
  }

  return 'linux';
};

const DEFAULT_FALLBACK: SystemInfoItem[] = [
  { label: 'OS', value: 'Unknown' },
  { label: 'Browser', value: 'Unknown' },
  { label: 'Uptime', value: '0m' },
  { label: 'Screen', value: 'Unknown' },
  { label: 'Memory', value: 'Unknown' },
  { label: 'Cores', value: 'Unknown' },
];

const getUAData = (): UAData | undefined => {
  const withUAData = navigator as Navigator & { userAgentData?: UAData };
  return withUAData.userAgentData;
};

const getOSName = (): string => {
  const uaData = getUAData();
  if (uaData?.platform) return uaData.platform;
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT')) return 'Windows';
  if (ua.includes('Mac OS X') && !ua.includes('iPhone') && !ua.includes('iPad')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
};

const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  const edge = ua.match(/Edg\/([\d.]+)/);
  if (edge) return `Edge ${edge[1]}`;
  const opera = ua.match(/OPR\/([\d.]+)/);
  if (opera) return `Opera ${opera[1]}`;
  const chrome = ua.match(/Chrome\/([\d.]+)/);
  if (chrome && !ua.includes('Edg/') && !ua.includes('OPR/')) return `Chrome ${chrome[1]}`;
  const firefox = ua.match(/Firefox\/([\d.]+)/);
  if (firefox) return `Firefox ${firefox[1]}`;
  const safari = ua.match(/Version\/([\d.]+).*Safari/);
  if (safari && !ua.includes('Chrome/')) return `Safari ${safari[1]}`;
  const uaData = getUAData();
  const brand = uaData?.brands?.find((item) => item.brand !== 'Not A(Brand)');
  if (brand) return `${brand.brand} ${brand.version}`;
  return 'Unknown';
};

const formatUptime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const buildSystemInfo = (startMs: number): SystemInfoItem[] => {
  const os = getOSName();
  const browser = getBrowserName();
  const uptime = formatUptime(performance.now() - startMs);
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const navigatorInfo = navigator as Navigator & { deviceMemory?: number };
  const memory =
    typeof navigatorInfo.deviceMemory === 'number'
      ? `${navigatorInfo.deviceMemory.toFixed(0)} GB`
      : 'Unknown';
  const cores =
    typeof navigatorInfo.hardwareConcurrency === 'number'
      ? `${navigatorInfo.hardwareConcurrency}`
      : 'Unknown';
  return [
    { label: 'OS', value: os },
    { label: 'Browser', value: browser },
    { label: 'Uptime', value: uptime },
    { label: 'Screen', value: screenSize },
    { label: 'Memory', value: memory },
    { label: 'Cores', value: cores },
  ];
};

export default function SystemInfo({ fallback }: Props) {
  const initialItems =
    fallback && fallback.length > 0 ? fallback : DEFAULT_FALLBACK;
  const [items, setItems] = useState<SystemInfoItem[]>(initialItems);
  const [logo, setLogo] = useState<string>(NEOFETCH_LOGOS.windows);

  useEffect(() => {
    const startMs = performance.now();
    const update = () => {
      const nextItems = buildSystemInfo(startMs);
      setItems(nextItems);
      const nextOS = nextItems.find((item) => item.label === 'OS')?.value ?? 'Unknown';
      const nextKey = detectLogoKey(nextOS, navigator.userAgent);
      setLogo(NEOFETCH_LOGOS[nextKey]);
    };
    update();
    const interval = window.setInterval(update, 10000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <pre className="text-[10px] leading-none text-blue-600 dark:text-green-500 font-bold shrink-0">
        {logo}
      </pre>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base flex-1">
        {items.map((item) => (
          <div className="flex" key={item.label}>
            <span className="text-gray-500 w-24">{item.label}:</span>
            <span className="text-blue-600 dark:text-green-300">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
