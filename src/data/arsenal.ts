/*
 * Arsenal red team — ANNUAIRE DE LIENS (aucune doc/instruction ici).
 * Outils open-source publics, organisés par phase (kill chain).
 * Source principale : github.com/A-poc/RedTeam-Tools.
 * Usage : pentest autorisé / CTF / labo uniquement.
 */

export interface ArsenalTool {
  name: string;
  url: string;
}
export interface ArsenalGroup {
  category: string;
  tools: ArsenalTool[];
}

export const ARSENAL_SOURCES: ArsenalTool[] = [
  { name: "A-poc / RedTeam-Tools", url: "https://github.com/A-poc/RedTeam-Tools" },
  { name: "CarterPerez-dev / Cybersecurity-Projects", url: "https://github.com/CarterPerez-dev/Cybersecurity-Projects" },
  { name: "GitHub topic : hardware-hacking", url: "https://github.com/topics/hardware-hacking" },
];

export const ARSENAL: ArsenalGroup[] = [
  {
    category: "Reconnaissance",
    tools: [
      { name: "spiderfoot", url: "https://github.com/smicallef/spiderfoot" },
      { name: "reconftw", url: "https://github.com/six2dez/reconftw" },
      { name: "subzy", url: "https://github.com/PentestPad/subzy" },
      { name: "smtp-user-enum", url: "https://github.com/cytopia/smtp-user-enum" },
      { name: "nuclei", url: "https://github.com/projectdiscovery/nuclei" },
      { name: "certSniff", url: "https://github.com/A-poc/certSniff" },
      { name: "gobuster", url: "https://www.kali.org/tools/gobuster/" },
      { name: "feroxbuster", url: "https://github.com/epi052/feroxbuster" },
      { name: "CloudBrute", url: "https://github.com/0xsha/CloudBrute" },
      { name: "dnsrecon", url: "https://www.kali.org/tools/dnsrecon/" },
      { name: "Shodan.io", url: "https://www.shodan.io/" },
      { name: "AORT", url: "https://github.com/D3Ext/AORT" },
      { name: "spoofcheck", url: "https://github.com/BishopFox/spoofcheck" },
      { name: "AWSBucketDump", url: "https://github.com/jordanpotti/AWSBucketDump" },
      { name: "GitHarvester", url: "https://github.com/metac0rtex/GitHarvester" },
      { name: "truffleHog", url: "https://github.com/dxa4481/truffleHog" },
      { name: "Dismap", url: "https://github.com/zhzyker/dismap" },
      { name: "enum4linux", url: "https://github.com/CiscoCXSecurity/enum4linux" },
      { name: "skanuvaty", url: "https://github.com/Esc4iCEscEsc/skanuvaty" },
      { name: "Metabigor", url: "https://github.com/j3ssie/metabigor" },
      { name: "Gitrob", url: "https://github.com/michenriksen/gitrob" },
      { name: "gowitness", url: "https://github.com/sensepost/gowitness" },
    ],
  },
  {
    category: "Resource Development",
    tools: [
      { name: "remoteinjector", url: "https://github.com/JohnWoodman/remoteinjector" },
      { name: "Chimera", url: "https://github.com/tokyoneon/Chimera" },
      { name: "msfvenom", url: "https://www.offensive-security.com/metasploit-unleashed/Msfvenom/" },
      { name: "Shellter", url: "https://www.shellterproject.com/" },
      { name: "Freeze", url: "https://github.com/optiv/Freeze" },
      { name: "WordSteal", url: "https://github.com/0x09AL/WordSteal" },
      { name: "OffensiveVBA", url: "https://github.com/S3cur3Th1sSh1t/OffensiveVBA" },
    ],
  },
  {
    category: "Initial Access",
    tools: [
      { name: "CredMaster", url: "https://github.com/knavesec/CredMaster" },
      { name: "TREVORspray", url: "https://github.com/blacklanternsecurity/TREVORspray" },
      { name: "evilqr", url: "https://github.com/kgretzky/evilqr" },
      { name: "CUPP", url: "https://github.com/Mebus/cupp" },
      { name: "Bash Bunny", url: "https://shop.hak5.org/products/bash-bunny" },
      { name: "EvilGoPhish", url: "https://github.com/fin3ss3g0d/evilgophish" },
      { name: "Social Engineer Toolkit", url: "https://github.com/trustedsec/social-engineer-toolkit" },
      { name: "Hydra", url: "https://github.com/vanhauser-thc/thc-hydra" },
      { name: "SquarePhish", url: "https://github.com/secureworks/squarephish" },
      { name: "King Phisher", url: "https://github.com/rsmusllp/king-phisher" },
    ],
  },
  {
    category: "Execution",
    tools: [
      { name: "Responder", url: "https://github.com/lgandx/Responder" },
      { name: "secretsdump", url: "https://github.com/fortra/impacket" },
      { name: "evil-winrm", url: "https://github.com/Hackplayers/evil-winrm" },
      { name: "Donut", url: "https://github.com/TheWover/donut" },
      { name: "Macro_pack", url: "https://github.com/sevagas/macro_pack" },
      { name: "PowerSploit", url: "https://github.com/PowerShellMafia/PowerSploit" },
      { name: "Rubeus", url: "https://github.com/GhostPack/Rubeus" },
      { name: "SharpUp", url: "https://github.com/GhostPack/SharpUp" },
      { name: "SQLRecon", url: "https://github.com/skahwah/SQLRecon" },
      { name: "UltimateAppLockerByPassList", url: "https://github.com/api0cradle/UltimateAppLockerByPassList" },
      { name: "demiguise", url: "https://github.com/nccgroup/demiguise" },
      { name: "PowerZure", url: "https://github.com/hausec/PowerZure" },
    ],
  },
  {
    category: "Persistence",
    tools: [
      { name: "Impacket", url: "https://github.com/fortra/impacket" },
      { name: "Empire", url: "https://github.com/BC-SECURITY/Empire" },
      { name: "SharPersist", url: "https://github.com/mandiant/SharPersist" },
      { name: "ligolo-ng", url: "https://github.com/nicocha30/ligolo-ng" },
    ],
  },
  {
    category: "Privilege Escalation",
    tools: [
      { name: "Crassus", url: "https://github.com/vu-ls/Crassus" },
      { name: "LinPEAS", url: "https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS" },
      { name: "WinPEAS", url: "https://github.com/carlospolop/PEASS-ng/tree/master/winPEAS" },
      { name: "linux-smart-enumeration", url: "https://github.com/diego-treitos/linux-smart-enumeration" },
      { name: "Certify", url: "https://github.com/GhostPack/Certify" },
      { name: "Sherlock", url: "https://github.com/rasta-mouse/Sherlock" },
      { name: "Watson", url: "https://github.com/rasta-mouse/Watson" },
      { name: "ADFSDump", url: "https://github.com/mandiant/ADFSDump" },
      { name: "BeRoot", url: "https://github.com/AlessandroZ/BeRoot" },
    ],
  },
  {
    category: "Defense Evasion",
    tools: [
      { name: "Invoke-Obfuscation", url: "https://github.com/danielbohannon/Invoke-Obfuscation" },
      { name: "Veil", url: "https://github.com/Veil-Framework/Veil" },
      { name: "SharpBlock", url: "https://github.com/CCob/SharpBlock" },
      { name: "AMSI Fail", url: "https://github.com/Flangvik/AMSI.fail" },
      { name: "ScareCrow", url: "https://github.com/optiv/ScareCrow" },
      { name: "moonwalk", url: "https://github.com/mufeedvh/moonwalk" },
    ],
  },
  {
    category: "Credential Access",
    tools: [
      { name: "Mimikatz", url: "https://github.com/gentilkiwi/mimikatz" },
      { name: "LaZagne", url: "https://github.com/AlessandroZ/LaZagne" },
      { name: "hashcat", url: "https://hashcat.net/hashcat/" },
      { name: "John the Ripper", url: "https://www.openwall.com/john/" },
      { name: "SCOMDecrypt", url: "https://github.com/nccgroup/SCOMDecrypt" },
      { name: "nanodump", url: "https://github.com/fortra/nanodump" },
      { name: "eviltree", url: "https://github.com/t0thkr1s/eviltree" },
      { name: "SeeYouCM-Thief", url: "https://github.com/trustedsec/SeeYouCM-Thief" },
      { name: "MailSniper", url: "https://github.com/dafthack/MailSniper" },
      { name: "SharpChromium", url: "https://github.com/djhohnstein/SharpChromium" },
      { name: "dploot", url: "https://github.com/zblurx/dploot" },
    ],
  },
  {
    category: "Discovery",
    tools: [
      { name: "PCredz", url: "https://github.com/lgandx/PCredz" },
      { name: "PingCastle", url: "https://www.pingcastle.com/" },
      { name: "Seatbelt", url: "https://github.com/GhostPack/Seatbelt" },
      { name: "ADRecon", url: "https://github.com/sense-of-security/ADRecon" },
      { name: "adidnsdump", url: "https://github.com/dirkjanm/adidnsdump" },
      { name: "scavenger", url: "https://github.com/SpiderLabs/scavenger" },
    ],
  },
  {
    category: "Lateral Movement",
    tools: [
      { name: "NetExec (CrackMapExec)", url: "https://github.com/Pennyw0rth/NetExec" },
      { name: "WMIOps", url: "https://github.com/FortyNorthSecurity/WMIOps" },
      { name: "PowerLessShell", url: "https://github.com/Mr-Un1k0d3r/PowerLessShell" },
      { name: "PsExec", url: "https://learn.microsoft.com/en-us/sysinternals/downloads/psexec" },
      { name: "LiquidSnake", url: "https://github.com/RiccardoAncarani/LiquidSnake" },
      { name: "kerbrute", url: "https://github.com/ropnop/kerbrute" },
      { name: "Coercer", url: "https://github.com/p0dalirius/Coercer" },
    ],
  },
  {
    category: "Collection",
    tools: [
      { name: "BloodHound", url: "https://github.com/SpecterOps/BloodHound" },
      { name: "Snaffler", url: "https://github.com/SnaffCon/Snaffler" },
      { name: "linWinPwn", url: "https://github.com/lefayjey/linWinPwn" },
    ],
  },
  {
    category: "Command & Control",
    tools: [
      { name: "LOLBAS", url: "https://lolbas-project.github.io/" },
      { name: "Havoc", url: "https://github.com/HavocFramework/Havoc" },
      { name: "Covenant", url: "https://github.com/cobbr/Covenant" },
      { name: "Merlin", url: "https://github.com/Ne0nd0g/merlin" },
      { name: "Metasploit Framework", url: "https://github.com/rapid7/metasploit-framework" },
      { name: "Pupy", url: "https://github.com/n1nj4sec/pupy" },
      { name: "NimPlant", url: "https://github.com/chvancooten/NimPlant" },
      { name: "Hoaxshell", url: "https://github.com/t3l3machus/hoaxshell" },
      { name: "Sliver", url: "https://github.com/BishopFox/sliver" },
      { name: "Mythic", url: "https://github.com/its-a-feature/Mythic" },
    ],
  },
  {
    category: "Exfiltration",
    tools: [
      { name: "Dnscat2", url: "https://github.com/iagox86/dnscat2" },
      { name: "Cloakify", url: "https://github.com/TryCatchHCF/Cloakify" },
      { name: "PyExfil", url: "https://github.com/ytisf/PyExfil" },
      { name: "GD-Thief", url: "https://github.com/antman1p/GD-Thief" },
      { name: "goshs", url: "https://github.com/patrickhener/goshs" },
    ],
  },
  {
    category: "Impact",
    tools: [
      { name: "Conti Pentester Guide Leak (analyse)", url: "https://www.varonis.com/blog/conti-ransomware" },
      { name: "SlowLoris", url: "https://github.com/gkbrk/slowloris" },
      { name: "usbkill", url: "https://github.com/hephaest0s/usbkill" },
      { name: "Keytap", url: "https://github.com/ggerganov/keytap" },
    ],
  },
  {
    category: "Red Tips",
    tools: [
      { name: "HTML smuggling via mousemove", url: "https://x.com/pr0xylife/status/1598410732516802563" },
      { name: "Google translate pour phishing", url: "https://x.com/malmoeb/status/1671106885590630400" },
      { name: "Cacher le compte admin local", url: "https://twitter.com/Alh4zr3d/status/1612913838999113728" },
      { name: "Multiple sessions RDP par user", url: "https://twitter.com/Alh4zr3d/status/1609954528425558016" },
      { name: "Alternative locale à PsExec", url: "https://twitter.com/GuhnooPlusLinux/status/1607473627922063360" },
      { name: "Port scanner living-off-the-land", url: "https://twitter.com/Alh4zr3d/status/1605060950339588096" },
      { name: "PowerShell DownloadString proxy-aware", url: "https://twitter.com/Alh4zr3d/status/1596192664398966785" },
      { name: "Endpoints internes dans les bookmarks", url: "https://twitter.com/Alh4zr3d/status/1595488676389171200" },
      { name: "Énum via enregistrements DNS", url: "https://twitter.com/Alh4zr3d/status/1587132627823181824" },
      { name: "Unquoted service paths sans PowerUp", url: "https://twitter.com/Alh4zr3d/status/1579254955554136064" },
      { name: "Bypass cmd désactivé avec /k", url: "https://improsec.com/tech-blog/the-command-prompt-has-been-disabled-by-your-administrator" },
      { name: "Détecter une machine virtuelle", url: "https://twitter.com/dmcxblue/status/1366779034672136194" },
      { name: "Énumérer les règles AppLocker", url: "https://twitter.com/alh4zr3d/status/1614706476412698624" },
      { name: "Shell CMD via mspaint (Citrix)", url: "https://www.pentestpartners.com/security-blog/breaking-out-of-citrix-and-other-restricted-desktop-environments/" },
      { name: "Link spoofing (preventDefault)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault" },
      { name: "Règles firewall SMB via Responder", url: "https://twitter.com/malmoeb/status/1628272928855826433" },
    ],
  },
];
