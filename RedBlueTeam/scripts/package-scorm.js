import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Available missions metadata catalog
const MISSION_CATALOG = [
  {
    num: '1',
    id: 'mission-1-petrolog',
    title: 'MISJA 1 – PETROLOG',
    dataFile: path.resolve(rootDir, 'src', 'scenarios', 'mission_01_petrolog', 'data', 'mission1.json')
  },
  {
    num: '2',
    id: 'mission-2-carbonflow',
    title: 'MISJA 2 – CARBONFLOW',
    dataFile: path.resolve(rootDir, 'src', 'scenarios', 'mission_02_carbon_flow', 'data', 'mission2.json')
  },
  {
    num: '3',
    id: 'mission-3-ol-company',
    title: 'MISJA 3 – O&L COMPANY',
    dataFile: path.resolve(rootDir, 'src', 'scenarios', 'mission_03_ol_company', 'data', 'mission3.json')
  },
  {
    num: '4',
    id: 'mission-4-energy-rock',
    title: 'MISJA 4 – ENERGY ROCK',
    dataFile: path.resolve(rootDir, 'src', 'scenarios', 'mission_04_energy_rock', 'data', 'mission4.json')
  }
];

function resolveMissionInfo(missionArg) {
  const cleanArg = String(missionArg).trim().toLowerCase();

  for (const item of MISSION_CATALOG) {
    if (item.num === cleanArg || item.id === cleanArg || item.id.includes(cleanArg)) {
      if (fs.existsSync(item.dataFile)) {
        try {
          const raw = JSON.parse(fs.readFileSync(item.dataFile, 'utf-8'));
          return {
            id: raw.mission?.id || item.id,
            title: raw.mission?.title || item.title,
            num: item.num
          };
        } catch (e) {}
      }
      return { id: item.id, title: item.title, num: item.num };
    }
  }

  // Fallback for custom or future mission numbers
  const candidateFiles = [
    path.resolve(rootDir, 'src', 'scenarios', `mission_0${cleanArg}_energy_rock`, 'data', `mission${cleanArg}.json`),
    path.resolve(rootDir, 'src', 'scenarios', `mission_0${cleanArg}_ol_company`, 'data', `mission${cleanArg}.json`),
    path.resolve(rootDir, 'src', 'data', `mission${cleanArg}.json`)
  ];

  for (const f of candidateFiles) {
    if (fs.existsSync(f)) {
      try {
        const raw = JSON.parse(fs.readFileSync(f, 'utf-8'));
        return {
          id: raw.mission?.id || `mission-${cleanArg}`,
          title: raw.mission?.title || `Misja ${cleanArg}`,
          num: cleanArg
        };
      } catch (e) {}
    }
  }

  return {
    id: `mission-${cleanArg}`,
    title: `Misja ${cleanArg}`,
    num: cleanArg
  };
}

function buildAndPackageMission(missionInfo) {
  const { id: missionId, title: missionTitle } = missionInfo;
  const safeMissionId = missionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const zipFile = path.resolve(distDir, `scorm-${safeMissionId}.zip`);

  console.log(`\n======================================================================`);
  console.log(`>>> [SCORM 2004 Packager] Budowanie i pakowanie: ${missionId}`);
  console.log(`    Tytuł: "${missionTitle}"`);
  console.log(`======================================================================`);

  // Backup existing .zip packages in dist before Vite empties the directory
  const tempBackupDir = path.resolve(rootDir, '.scorm_tmp_zips');
  if (fs.existsSync(distDir)) {
    const existingZips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
    if (existingZips.length > 0) {
      if (!fs.existsSync(tempBackupDir)) {
        fs.mkdirSync(tempBackupDir, { recursive: true });
      }
      for (const zip of existingZips) {
        fs.copyFileSync(path.resolve(distDir, zip), path.resolve(tempBackupDir, zip));
      }
    }
  }

  // 1. Build Vite application with VITE_MISSION_ID injected
  console.log(`>>> [1/3] Kompilacja produkcyjna Vite z VITE_MISSION_ID="${missionId}"...`);
  try {
    execSync(`node node_modules/vite/bin/vite.js build`, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_MISSION_ID: missionId
      }
    });
  } catch (err) {
    console.error(`BŁĄD: Kompilacja Vite nie powiodła się dla ${missionId}:`, err);
    process.exit(1);
  }

  // Restore previously existing .zip packages
  if (fs.existsSync(tempBackupDir)) {
    const backedZips = fs.readdirSync(tempBackupDir).filter(f => f.endsWith('.zip'));
    for (const zip of backedZips) {
      fs.copyFileSync(path.resolve(tempBackupDir, zip), path.resolve(distDir, zip));
    }
    fs.rmSync(tempBackupDir, { recursive: true, force: true });
  }

  // 2. Generate mission-specific imsmanifest.xml
  console.log(`>>> [2/3] Generowanie dedykowanego imsmanifest.xml...`);
  const manifestPath = path.resolve(distDir, 'imsmanifest.xml');
  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.hackers.os.${safeMissionId}" version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>

  <organizations default="org_hackers_os_${safeMissionId}">
    <organization identifier="org_hackers_os_${safeMissionId}">
      <title>${missionTitle.replace(/&/g, '&amp;')} (HACKERS.OS)</title>
      <item identifier="item_${safeMissionId}_sim" identifierref="res_${safeMissionId}_sim" isvisible="true">
        <title>Symulacja Hakerska: ${missionTitle.replace(/&/g, '&amp;')}</title>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true" />
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="res_${safeMissionId}_sim" type="webcontent" adlcp:scormType="sco" href="index.html?mission=${missionId}">
      <file href="index.html" />
    </resource>
  </resources>
</manifest>`;

  fs.writeFileSync(manifestPath, manifestXml, 'utf-8');

  // 3. Compress to ZIP
  console.log(`>>> [3/3] Tworzenie archiwum ZIP SCORM 2004...`);
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }

  try {
    if (process.platform === 'win32') {
      execSync(`powershell.exe -NoProfile -Command "Get-ChildItem -Path '${distDir}' -Exclude '*.zip' | Compress-Archive -DestinationPath '${zipFile}' -Force"`, {
        stdio: 'inherit'
      });
    } else {
      execSync(`cd "${distDir}" && zip -r "${zipFile}" . -x "*.zip"`, {
        stdio: 'inherit'
      });
    }

    if (fs.existsSync(zipFile)) {
      const stats = fs.statSync(zipFile);
      console.log(`\n✔ SUKCES: Gotowa niezależna paczka SCORM 2004 dla misji "${missionId}"!`);
      console.log(`  Ścieżka: ${zipFile}`);
      console.log(`  Rozmiar: ${(stats.size / 1024).toFixed(1)} KB`);
      console.log(`  Paczka jest w 100% gotowa do wgrania w Moodle jako osobna aktywność.`);
    } else {
      throw new Error('Nie znaleziono wyjściowego pliku ZIP.');
    }
  } catch (err) {
    console.error(`BŁĄD podczas kompresji ZIP dla ${missionId}:`, err);
    process.exit(1);
  }
}

// Parse command line arguments
let isAll = false;
let selectedMissions = [];

for (const arg of process.argv.slice(2)) {
  if (arg === '--all' || arg === '-a') {
    isAll = true;
  } else if (arg.startsWith('--mission=')) {
    selectedMissions.push(arg.split('=')[1]);
  } else if (arg.startsWith('-m=')) {
    selectedMissions.push(arg.split('=')[1]);
  }
}

if (isAll) {
  console.log('>>> [SCORM Packager] Wybrano pakowanie WSZYSTKICH scenariuszy...');
  for (const sc of MISSION_CATALOG) {
    buildAndPackageMission(sc);
  }
  console.log('\n======================================================================');
  console.log('✔ UKOŃCZONO: Wszystkie niezależne paczki SCORM zostały pomyślnie wygenerowane w folderze dist/!');
  console.log('======================================================================\n');
} else {
  if (selectedMissions.length === 0) {
    selectedMissions.push(process.env.MISSION_ID || '3');
  }
  for (const m of selectedMissions) {
    const info = resolveMissionInfo(m);
    buildAndPackageMission(info);
  }
}
