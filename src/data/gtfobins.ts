/*
 * Dataset CURATÉ (read-only) de binaires détournables — GTFOBins (Unix) &
 * LOLBAS (Windows). Référence éducative pour pentest autorisé / CTF / labo.
 * Aucune charge offensive ici : uniquement nom, plateforme, fonctions abusables
 * et lien vers la fiche officielle. Librement extensible.
 *
 * Sources :
 *   - https://gtfobins.github.io/
 *   - https://lolbas-project.github.io/
 */

export type GtfoFunction =
  | "shell"
  | "command"
  | "reverse-shell"
  | "bind-shell"
  | "file-read"
  | "file-write"
  | "file-download"
  | "file-upload"
  | "suid"
  | "sudo"
  | "capabilities"
  | "library-load"
  | "awl-bypass"
  | "uac-bypass"
  | "credentials";

export type GtfoPlatform = "unix" | "windows";

export interface GtfoBin {
  name: string;
  platform: GtfoPlatform;
  functions: GtfoFunction[];
  url: string;
}

const gtfo = (name: string, functions: GtfoFunction[]): GtfoBin => ({
  name,
  platform: "unix",
  functions,
  url: `https://gtfobins.github.io/gtfobins/${name}/`,
});

const lol = (name: string, functions: GtfoFunction[], url: string): GtfoBin => ({
  name,
  platform: "windows",
  functions,
  url,
});

export const GTFO_BINS: GtfoBin[] = [
  // ── GTFOBins (Unix) ──
  gtfo("bash", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo"]),
  gtfo("sh", ["shell", "suid", "sudo"]),
  gtfo("zsh", ["shell", "suid", "sudo"]),
  gtfo("dash", ["shell", "suid", "sudo"]),
  gtfo("find", ["shell", "command", "file-read", "file-write", "suid", "sudo"]),
  gtfo("vim", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo", "capabilities", "library-load"]),
  gtfo("vi", ["shell", "file-read", "file-write", "suid", "sudo"]),
  gtfo("nano", ["shell", "file-read", "file-write", "suid", "sudo"]),
  gtfo("less", ["shell", "command", "file-read", "suid", "sudo"]),
  gtfo("more", ["shell", "file-read", "suid", "sudo"]),
  gtfo("man", ["shell", "command", "file-read", "sudo"]),
  gtfo("awk", ["shell", "command", "file-read", "file-write", "suid", "sudo"]),
  gtfo("gawk", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo"]),
  gtfo("sed", ["shell", "command", "file-read", "file-write", "suid", "sudo"]),
  gtfo("ed", ["shell", "file-read", "file-write", "suid", "sudo"]),
  gtfo("python", ["shell", "command", "reverse-shell", "file-read", "file-write", "file-download", "suid", "sudo", "capabilities", "library-load"]),
  gtfo("perl", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo", "capabilities"]),
  gtfo("ruby", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo", "capabilities", "library-load"]),
  gtfo("php", ["shell", "command", "reverse-shell", "file-read", "file-write", "file-download", "file-upload", "suid", "sudo"]),
  gtfo("lua", ["shell", "command", "reverse-shell", "suid", "sudo"]),
  gtfo("node", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo"]),
  gtfo("nmap", ["shell", "command", "file-read", "file-write", "suid", "sudo"]),
  gtfo("tar", ["shell", "command", "file-write", "suid", "sudo"]),
  gtfo("zip", ["shell", "command", "suid", "sudo"]),
  gtfo("unzip", ["shell", "sudo"]),
  gtfo("git", ["shell", "command", "file-read", "sudo"]),
  gtfo("docker", ["shell", "command", "file-read", "file-write", "sudo"]),
  gtfo("env", ["shell", "command", "suid", "sudo"]),
  gtfo("cp", ["file-write", "suid", "sudo"]),
  gtfo("mv", ["file-write", "sudo"]),
  gtfo("tee", ["file-write", "sudo"]),
  gtfo("dd", ["file-read", "file-write", "suid", "sudo"]),
  gtfo("xxd", ["file-read", "file-write", "suid", "sudo"]),
  gtfo("base64", ["file-read", "suid", "sudo"]),
  gtfo("base32", ["file-read", "suid", "sudo"]),
  gtfo("cat", ["file-read", "suid", "sudo"]),
  gtfo("head", ["file-read", "suid", "sudo"]),
  gtfo("tail", ["file-read", "suid", "sudo"]),
  gtfo("cut", ["file-read", "suid", "sudo"]),
  gtfo("wget", ["file-download", "file-write", "command", "sudo"]),
  gtfo("curl", ["file-download", "file-upload", "file-write", "sudo"]),
  gtfo("scp", ["file-download", "file-upload", "sudo"]),
  gtfo("ssh", ["shell", "command", "file-read", "sudo"]),
  gtfo("ftp", ["shell", "file-download", "file-upload", "sudo"]),
  gtfo("rsync", ["shell", "command", "file-read", "file-write", "sudo"]),
  gtfo("socat", ["shell", "reverse-shell", "bind-shell", "file-read", "file-write", "file-download", "file-upload"]),
  gtfo("gdb", ["shell", "command", "reverse-shell", "file-read", "file-write", "suid", "sudo", "capabilities", "library-load"]),
  gtfo("strace", ["shell", "suid", "sudo"]),
  gtfo("ltrace", ["shell", "sudo"]),
  gtfo("make", ["shell", "command", "suid", "sudo"]),
  gtfo("gcc", ["shell", "command", "file-read", "file-write", "sudo"]),
  gtfo("crontab", ["sudo"]),
  gtfo("systemctl", ["shell", "command", "sudo"]),
  gtfo("journalctl", ["shell", "sudo"]),
  gtfo("mount", ["shell", "sudo"]),
  gtfo("mysql", ["shell", "command", "sudo"]),
  gtfo("openssl", ["file-read", "file-write", "reverse-shell", "sudo"]),
  gtfo("pip", ["shell", "command", "sudo"]),
  gtfo("screen", ["shell", "suid", "sudo"]),
  gtfo("tmux", ["shell", "suid", "sudo"]),
  gtfo("busybox", ["shell", "command", "file-read", "file-write", "suid", "sudo"]),
  gtfo("expect", ["shell", "command", "suid", "sudo"]),
  gtfo("jq", ["file-read", "sudo"]),
  gtfo("flock", ["shell", "suid", "sudo"]),
  gtfo("ionice", ["shell", "command", "suid", "sudo"]),
  gtfo("nice", ["shell", "command", "suid", "sudo"]),
  gtfo("time", ["shell", "command", "suid", "sudo"]),
  gtfo("timeout", ["shell", "reverse-shell", "sudo"]),
  gtfo("xargs", ["shell", "command", "file-read", "suid", "sudo"]),

  // ── LOLBAS (Windows) ──
  lol("Certutil.exe", ["file-download", "file-read", "file-write"], "https://lolbas-project.github.io/lolbas/Binaries/Certutil/"),
  lol("Bitsadmin.exe", ["file-download", "command"], "https://lolbas-project.github.io/lolbas/Binaries/Bitsadmin/"),
  lol("Mshta.exe", ["command", "file-download", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Mshta/"),
  lol("Rundll32.exe", ["command", "awl-bypass", "credentials"], "https://lolbas-project.github.io/lolbas/Binaries/Rundll32/"),
  lol("Regsvr32.exe", ["command", "file-download", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Regsvr32/"),
  lol("Msbuild.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Msbuild/"),
  lol("Installutil.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Installutil/"),
  lol("Regasm.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Regasm/"),
  lol("Regsvcs.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Regsvcs/"),
  lol("Cmstp.exe", ["command", "awl-bypass", "uac-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Cmstp/"),
  lol("Wmic.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Wmic/"),
  lol("Forfiles.exe", ["command"], "https://lolbas-project.github.io/lolbas/Binaries/Forfiles/"),
  lol("Mavinject.exe", ["command", "library-load"], "https://lolbas-project.github.io/lolbas/Binaries/Mavinject/"),
  lol("Esentutl.exe", ["file-read", "file-write", "file-download"], "https://lolbas-project.github.io/lolbas/Binaries/Esentutl/"),
  lol("Expand.exe", ["file-read", "file-write"], "https://lolbas-project.github.io/lolbas/Binaries/Expand/"),
  lol("Makecab.exe", ["file-write"], "https://lolbas-project.github.io/lolbas/Binaries/Makecab/"),
  lol("Findstr.exe", ["file-read", "file-download"], "https://lolbas-project.github.io/lolbas/Binaries/Findstr/"),
  lol("Reg.exe", ["file-write", "credentials"], "https://lolbas-project.github.io/lolbas/Binaries/Reg/"),
  lol("Schtasks.exe", ["command"], "https://lolbas-project.github.io/lolbas/Binaries/Schtasks/"),
  lol("Sc.exe", ["command"], "https://lolbas-project.github.io/lolbas/Binaries/Sc/"),
  lol("At.exe", ["command"], "https://lolbas-project.github.io/lolbas/Binaries/At/"),
  lol("Cscript.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Cscript/"),
  lol("Wscript.exe", ["command", "awl-bypass"], "https://lolbas-project.github.io/lolbas/Binaries/Wscript/"),
  lol("Csc.exe", ["command"], "https://lolbas-project.github.io/lolbas/Binaries/Csc/"),
  lol("Powershell.exe", ["command", "file-download", "reverse-shell"], "https://lolbas-project.github.io/lolbas/Binaries/Powershell/"),
];

// Liste des fonctions réellement présentes dans le dataset (pour le filtre).
export const GTFO_FUNCTIONS: GtfoFunction[] = Array.from(
  new Set(GTFO_BINS.flatMap((b) => b.functions)),
).sort();
