/*
 * Projets hardware / électronique cyber — simple ANNUAIRE DE LIENS vers des
 * dépôts open-source existants (aucune documentation de fabrication ici).
 * Usage éducatif / matériel & réseau t'appartenant / labo autorisé.
 */

export type HwCategory =
  | "WiFi"
  | "RFID/NFC"
  | "Recon"
  | "USB"
  | "Sub-GHz"
  | "SDR"
  | "BadUSB"
  | "JTAG"
  | "Bus"
  | "Ressources";
export type HwStatus = "possédé" | "actif" | "prototype" | "prévu" | "non réalisé";

export interface HwProject {
  id: string;
  name: string;
  board: string;
  category: HwCategory;
  status: HwStatus;
  desc: string;
  url?: string;
  warn?: string;
}

export const HW_CATEGORIES: HwCategory[] = [
  "WiFi",
  "RFID/NFC",
  "Recon",
  "USB",
  "Sub-GHz",
  "SDR",
  "BadUSB",
  "JTAG",
  "Bus",
  "Ressources",
];

export const HARDWARE: HwProject[] = [
  {
    id: "esp32-marauder",
    name: "ESP32 Marauder",
    board: "ESP32",
    category: "WiFi",
    status: "actif",
    desc: "Suite de reconnaissance WiFi/Bluetooth (scan, sniff, tests deauth).",
    url: "https://github.com/justcallmekoko/ESP32Marauder",
    warn: "Tests réseau : tes équipements / labo autorisé.",
  },
  {
    id: "esp8266-deauther",
    name: "WiFi Deauther",
    board: "ESP8266",
    category: "WiFi",
    status: "actif",
    desc: "Outil pédagogique 802.11 par SpacehuhnTech.",
    url: "https://github.com/SpacehuhnTech/esp8266_deauther",
    warn: "Tes réseaux uniquement.",
  },
  {
    id: "esp32-wifi-pen",
    name: "ESP32 WiFi Penetration Tool",
    board: "ESP32",
    category: "WiFi",
    status: "prototype",
    desc: "Capture de handshakes / PMKID et attaques WiFi.",
    url: "https://github.com/risinek/esp32-wifi-penetration-tool",
    warn: "Labo / réseaux autorisés.",
  },
  {
    id: "bruce",
    name: "Bruce",
    board: "ESP32 / M5Stack",
    category: "Recon",
    status: "prototype",
    desc: "Firmware multi-outils (WiFi, BLE, RF, RFID, BadUSB).",
    url: "https://github.com/pr3y/Bruce",
  },
  {
    id: "ghost-esp",
    name: "Ghost ESP",
    board: "ESP32",
    category: "Recon",
    status: "prévu",
    desc: "Firmware de reconnaissance WiFi/BLE.",
    url: "https://github.com/Spooks4576/Ghost_ESP",
  },
  {
    id: "nemo",
    name: "M5Stick NEMO",
    board: "M5StickC Plus",
    category: "Recon",
    status: "prévu",
    desc: "Multi-outil de poche (recon WiFi/BLE/IR).",
    url: "https://github.com/n0xa/m5stick-nemo",
  },
  {
    id: "espkey",
    name: "ESPKey",
    board: "ESP8266",
    category: "RFID/NFC",
    status: "prévu",
    desc: "Implant Wiegand pour audit de contrôle d'accès (red team physique).",
    url: "https://github.com/octosavvi/ESPKey",
    warn: "Audit avec mandat explicite uniquement.",
  },
  {
    id: "pn532-nfc",
    name: "PN532 NFC",
    board: "ESP32 + PN532",
    category: "RFID/NFC",
    status: "prototype",
    desc: "Bibliothèque NFC 13.56 MHz (lecture / émulation).",
    url: "https://github.com/elechouse/PN532",
    warn: "Tes propres badges uniquement.",
  },
  {
    id: "rf-jammer",
    name: "Brouilleur RF (jammer)",
    board: "—",
    category: "WiFi",
    status: "non réalisé",
    desc: "Interdit à la détention et à l'usage (ANFR / la plupart des pays). Volontairement non listé — pour la résilience réseau en labo, voir les outils deauth/recon ci-dessus.",
    warn: "Illégal — non réalisé, aucun lien.",
  },

  // ── Multi-outils ──
  {
    id: "flipper-zero",
    name: "Flipper Zero (firmware)",
    board: "Flipper Zero",
    category: "Recon",
    status: "prévu",
    desc: "Multi-outil de poche : Sub-GHz, RFID/NFC, infrarouge, GPIO, BadUSB.",
    url: "https://github.com/flipperdevices/flipperzero-firmware",
    warn: "Tes équipements / labo autorisé uniquement.",
  },
  {
    id: "flipper-unleashed",
    name: "Unleashed Firmware (Flipper)",
    board: "Flipper Zero",
    category: "Recon",
    status: "prévu",
    desc: "Firmware custom pour Flipper Zero (fonctions étendues, moins de bridages régionaux).",
    url: "https://github.com/DarkFlippers/unleashed-firmware",
    warn: "Respecte les bandes RF légales de ton pays.",
  },

  // ── Sub-GHz (RF 433/868 MHz) ──
  {
    id: "rtl433",
    name: "rtl_433",
    board: "RTL-SDR",
    category: "Sub-GHz",
    status: "prévu",
    desc: "Décode les appareils ISM 433/868/915 MHz (capteurs, télécommandes, stations météo).",
    url: "https://github.com/merbanan/rtl_433",
  },
  {
    id: "urh",
    name: "Universal Radio Hacker",
    board: "SDR",
    category: "Sub-GHz",
    status: "prévu",
    desc: "Analyse et rétro-ingénierie de protocoles radio sans fil (démodulation, fuzzing).",
    url: "https://github.com/jopohl/urh",
    warn: "Émission RF : sur tes propres équipements / bandes autorisées.",
  },

  // ── SDR (radio logicielle) ──
  {
    id: "gnuradio",
    name: "GNU Radio",
    board: "SDR",
    category: "SDR",
    status: "prévu",
    desc: "Boîte à outils de traitement du signal pour radio logicielle (flowgraphs).",
    url: "https://github.com/gnuradio/gnuradio",
  },
  {
    id: "hackrf",
    name: "HackRF One",
    board: "HackRF",
    category: "SDR",
    status: "prévu",
    desc: "Périphérique SDR émission/réception 1 MHz–6 GHz (firmware + outils, Great Scott Gadgets).",
    url: "https://github.com/greatscottgadgets/hackrf",
    warn: "Émission RF : bandes autorisées / labo uniquement.",
  },

  // ── RFID / NFC (suite) ──
  {
    id: "proxmark3",
    name: "Proxmark3 (Iceman)",
    board: "Proxmark3 RDV4",
    category: "RFID/NFC",
    status: "prévu",
    desc: "Référence de l'audit RFID/NFC LF & HF (lecture, clonage, émulation) — fork Iceman.",
    url: "https://github.com/RfidResearchGroup/proxmark3",
    warn: "Tes propres badges / audit mandaté uniquement.",
  },

  // ── BadUSB (injection de frappe HID) ──
  {
    id: "rubberducky-payloads",
    name: "USB Rubber Ducky Payloads",
    board: "Rubber Ducky",
    category: "BadUSB",
    status: "prévu",
    desc: "Dépôt officiel Hak5 de payloads DuckyScript pour l'injection de frappe HID.",
    url: "https://github.com/hak5/usbrubberducky-payloads",
    warn: "Postes t'appartenant / engagement autorisé uniquement.",
  },
  {
    id: "wifiduck",
    name: "WiFi Duck",
    board: "ESP8266 / ESP32",
    category: "BadUSB",
    status: "prévu",
    desc: "BadUSB pilotable à distance via WiFi (SpacehuhnTech).",
    url: "https://github.com/SpacehuhnTech/WiFiDuck",
    warn: "Tes équipements / labo autorisé uniquement.",
  },

  // ── JTAG / SWD & glitching ──
  {
    id: "openocd",
    name: "OpenOCD",
    board: "JTAG / SWD",
    category: "JTAG",
    status: "prévu",
    desc: "Debug on-chip et programmation via JTAG/SWD (dump et patch de firmware).",
    url: "https://github.com/openocd-org/openocd",
  },
  {
    id: "jtagulator",
    name: "JTAGulator",
    board: "JTAGulator",
    category: "JTAG",
    status: "prévu",
    desc: "Identifie automatiquement les broches JTAG/UART exposées sur une carte.",
    url: "https://github.com/grandideastudio/jtagulator",
  },
  {
    id: "chipwhisperer",
    name: "ChipWhisperer",
    board: "ChipWhisperer",
    category: "JTAG",
    status: "prévu",
    desc: "Plateforme open-source d'analyse par canaux auxiliaires et d'injection de fautes (glitching).",
    url: "https://github.com/newaetech/chipwhisperer",
    warn: "Recherche / matériel t'appartenant uniquement.",
  },

  // ── Bus (UART / SPI / I²C / flash) ──
  {
    id: "buspirate",
    name: "Bus Pirate",
    board: "Bus Pirate",
    category: "Bus",
    status: "prévu",
    desc: "Sonde universelle pour dialoguer avec les bus UART/SPI/I²C/1-Wire.",
    url: "https://github.com/DangerousPrototypes/BusPirate",
  },
  {
    id: "flashrom",
    name: "flashrom",
    board: "SPI flash",
    category: "Bus",
    status: "prévu",
    desc: "Lit, écrit et efface les puces flash SPI/parallèles (dump de firmware via pince).",
    url: "https://github.com/flashrom/flashrom",
  },
  {
    id: "sigrok-pulseview",
    name: "sigrok / PulseView",
    board: "Logic analyzer",
    category: "Bus",
    status: "prévu",
    desc: "Suite open-source d'analyseur logique : capture et décodage de protocoles.",
    url: "https://github.com/sigrokproject/pulseview",
  },

  // ── Ressources & labs (collections de liens / wikis / cours) ──
  {
    id: "koutto-hardware-hacking",
    name: "Hardware Hacking (Koutto)",
    board: "Guide",
    category: "Ressources",
    status: "actif",
    desc: "Slides et ressources d'un cours pratique de hardware hacking (UART, JTAG, SPI, dump de firmware).",
    url: "https://github.com/koutto/hardware-hacking",
  },
  {
    id: "awesome-hw-iot-hacking",
    name: "Awesome Hardware & IoT Hacking",
    board: "Awesome list",
    category: "Ressources",
    status: "actif",
    desc: "Liste curatée d'outils, ressources et lectures sur le hacking hardware & IoT.",
    url: "https://github.com/JoasASantos/Awesome-Hardware-and-IoT-Hacking",
  },
  {
    id: "hardbreak",
    name: "HardBreak",
    board: "Wiki",
    category: "Ressources",
    status: "actif",
    desc: "Base de connaissances communautaire du hardware hacking (méthodo, attaques, outils).",
    url: "https://github.com/f3nter/HardBreak",
  },
  {
    id: "hardware-hacking-es-dreg",
    name: "Hardware Hacking ES (Dreg)",
    board: "Cours",
    category: "Ressources",
    status: "actif",
    desc: "Cours et ressources de hardware hacking en espagnol (Dreg).",
    url: "https://github.com/therealdreg/hardware_hacking_es",
  },
  {
    id: "voidstar-hw-hacking-lab",
    name: "VoidStar HW Hacking Lab",
    board: "Lab",
    category: "Ressources",
    status: "actif",
    desc: "Guide de mise en place d'un labo de hardware hacking (outils, bancs, instruments).",
    url: "https://github.com/voidstarsec/hw-hacking-lab",
  },

  // ── USB ──
  {
    id: "luna",
    name: "LUNA",
    board: "FPGA / USB",
    category: "USB",
    status: "actif",
    desc: "Gateware et matériel pour analyser, émuler et bidouiller l'USB (Great Scott Gadgets).",
    url: "https://github.com/greatscottgadgets/luna",
    warn: "Analyse USB sur ton propre matériel / labo autorisé.",
  },
];
