// ===== NUMEROLOGIC BY IOLANDA (Static Vanilla JS) =====

// Import din sections.ro.js
let SECTIONS = window.sectionsRO;
let currentLang = "ro";

document.getElementById("lang").addEventListener("change", e => {
  currentLang = e.target.value;
  SECTIONS = currentLang === "fr" ? window.sectionsFR || {} : window.sectionsRO;
  renderSections();
});

document.getElementById("calcBtn").addEventListener("click", calculate);

function calculate() {
  const dob = document.getElementById("dob").value;
  const name = document.getElementById("fullname").value.trim();
  if (!dob || !name) return alert("Completează toate câmpurile!");

  document.getElementById("results").classList.remove("hidden");

  // --- Data de naștere ---
  const [year, month, day] = dob.split("-");
  const d = +day, m = +month, y = +year;

  // Cifrele brute pentru OP-uri (inclusiv zerourile din an, cum e corect în numerologie)
  const digits = `${d}${m}${y}`.split("").map(Number);

  // --- OP1–OP4 ---
  const sum = digits.reduce((a, b) => a + b, 0);
  const op1 = sum;
  const op2 = sumDigits(op1);
  const op3 = Math.abs(op1 - 2 * Number(String(d)[0] || 0));
  const op4 = sumDigits(op3);

  // --- Cod personal (afisare fara zerouri inutile la zi/lună si CU anul fara zerouri) ---
  const dStr = String(d);       // zi fără zero în față
  const mStr = String(m);       // lună fără zero în față
  let   yStr = String(y).replace(/0/g, ""); // eliminăm TOATE zerourile din an
  if (yStr === "") yStr = "0";  // caz extrem (ex: 0000)

  // Pentru calcule (matrice) folosim șirul fără spații:
  const codPersonal = `${dStr}${mStr}${yStr}${op1}${op2}${op3}${op4}`;

  // Pentru afișare cu spații între grupe:
  const codPersonalAfisat = `${dStr} ${mStr} ${yStr} ${op1} ${op2} ${op3} ${op4}`;

  let box = document.getElementById("personal-code");
  if (box) box.textContent = `Cod personal: ${codPersonalAfisat}`;

  // --- Vibrații ---
 const VI = reduceKeep(sumDigits(d));
  window.lastVI = VI;
  const VE  = reduceKeep(sumDigits(m));
  window.lastVI = VI;
  const VC  = reduceKeep(sumDigits(Number(String(y).slice(-2))));
  window.lastVI = VI;
  const VG  = reduceKeep(sumDigits(d) + sumDigits(m));
  window.lastVI = VI;
  const VCD = sum;
  const VD  = sumDigits(sum);

 // ✅ Afișăm doar vibrațiile, în ordinea dorită
const codes = [
  `VI: ${VI}`,
  `VE: ${VE}`,
  `VC: ${VC}`,
  `VG: ${VG}`,
  `VCD: ${VCD}`,
  `VD: ${VD}`
];

// Afișare ordonată (poți adăuga stiluri CSS dacă vrei)
document.getElementById("codes").innerHTML =
  codes.map(c => `<div class="vibration-box">${c}</div>`).join("");

  // --- MATRICEA de bază: DOAR cifrele din codul personal complet (fără spații) ---
  renderMatrix("matrixDate", codPersonal.split("").map(Number));

  // --- MATRICEA numelui ---
  renderMatrix("matrixName", nameDigits(name));

  renderNameNumbers(name);
  renderSections();
}

// ===== Helperi =====
function sumDigits(n) {
  return String(n).split("").map(Number).reduce((a, b) => a + b, 0);
}

function reduceKeep(n) {
  while (n > 9) n = sumDigits(n);
  return n;
}

function charVal(ch) {
  const c = ch.toUpperCase().charCodeAt(0);
  if (c < 65 || c > 90) return 0;
  return ((c - 64 - 1) % 9) + 1;
}

function nameDigits(name) {
  return name.toUpperCase().split("").map(charVal).filter(Boolean);
}

// ===== MATRICE =====
function renderMatrix(id, digits) {
  // 9 celule pentru cifrele 1-9
  const cells = Array(9).fill("");

  // umplem fiecare poziție cu cifrele corespunzătoare
  digits.forEach(n => {
    if (n >= 1 && n <= 9) cells[n - 1] += n;
  });

  // ordonare verticală 147 / 258 / 369
  const reordered = [
    cells[0] || "", cells[3] || "", cells[6] || "",
    cells[1] || "", cells[4] || "", cells[7] || "",
    cells[2] || "", cells[5] || "", cells[8] || ""
  ];

  // afișăm – celulele goale rămân goale
  const html = reordered.map(v => `<div>${v || ""}</div>`).join("");
  document.getElementById(id).innerHTML = html;
}

// ===== Alte calcule =====
function renderNameNumbers(name) {
  const vals = name.toUpperCase().split("").map(charVal).filter(Boolean);
  const total = vals.reduce((a, b) => a + b, 0);
  const vowels = name.toUpperCase().split("")
    .filter(ch => "AEIOUY".includes(ch))
    .map(charVal)
    .reduce((a, b) => a + b, 0);
  const consonants = total - vowels;
  const surname = name.split(" ").pop();
  const ered = surname.split("").map(charVal).reduce((a, b) => a + b, 0);

  const data = [
    `Exprimare: ${reduceKeep(total)}`,
    `Realizare: ${reduceKeep(consonants)}`,
    `Intim: ${reduceKeep(vowels)}`,
    `Ereditar: ${reduceKeep(ered)}`
  ];
  document.getElementById("nameNumbers").innerHTML =
    data.map(d => `<div>${d}</div>`).join("");
}

function renderSections() {
  const container = document.getElementById("sections");
  container.innerHTML = "";

  Object.keys(SECTIONS).forEach(k => {
    const div = document.createElement("div");
    div.className = "section";

    const btn = document.createElement("button");
    btn.textContent = k;

    const body = document.createElement("div");
    body.className = "body";
    body.style.display = "none";

    // === FILTRARE INTELIGENTĂ pentru fiecare tip de vibrație ===
    const keyLower = k.toLowerCase();
    let extracted = "";
    let label = "";

    if (keyLower.includes("interioară") || keyLower.includes("interioara")) {
      label = "Vibrația interioară";
      const vi = window.lastVI || "?";
      extracted = extractVibrationBlock(SECTIONS[k], vi);
      body.innerHTML = extracted
        ? `<h4>${label} (${vi})</h4>${formatTextWithNewlines(extracted)}`
        : `<h4>${label} (${vi})</h4><p>Nu există interpretare pentru vibrația ${vi}.</p>`;
    }

    else if (keyLower.includes("exterioară") || keyLower.includes("exterioara")) {
      label = "Vibrația exterioară";
      const ve = window.lastVE || "?";
      extracted = extractVibrationBlock(SECTIONS[k], ve);
      body.innerHTML = extracted
        ? `<h4>${label} (${ve})</h4>${formatTextWithNewlines(extracted)}`
        : `<h4>${label} (${ve})</h4><p>Nu există interpretare pentru vibrația ${ve}.</p>`;
    }

    else if (keyLower.includes("cosmică") || keyLower.includes("cosmica")) {
      label = "Vibrația cosmică";
      const vc = window.lastVC || "?";
      extracted = extractVibrationBlock(SECTIONS[k], vc);
      body.innerHTML = extracted
        ? `<h4>${label} (${vc})</h4>${formatTextWithNewlines(extracted)}`
        : `<h4>${label} (${vc})</h4><p>Nu există interpretare pentru vibrația ${vc}.</p>`;
    }

    else if (keyLower.includes("generală") || keyLower.includes("generala")) {
      label = "Vibrația generală";
      const vg = window.lastVG || "?";
      extracted = extractVibrationBlock(SECTIONS[k], vg);
      body.innerHTML = extracted
        ? `<h4>${label} (${vg})</h4>${formatTextWithNewlines(extracted)}`
        : `<h4>${label} (${vg})</h4><p>Nu există interpretare pentru vibrația ${vg}.</p>`;
    }

    else {
      // alte secțiuni (rămân complete)
      body.innerHTML = SECTIONS[k];
    }

    // ✅ face butonul clicabil pentru a afișa / ascunde conținutul
    btn.onclick = () => {
      body.style.display = body.style.display === "none" ? "block" : "none";
    };

    div.appendChild(btn);
    div.appendChild(body);
    container.appendChild(div);
  });
}
function extractVibrationBlock(fullText, n) {
  if (!fullText) return "";

  const text = fullText.replace(/\r\n/g, "\n");
  const re = /(^|\n)\s*Plusuri\s+(\d+)[^\n]*\n([\s\S]*?)(?=(?:^|\n)\s*Plusuri\s+\d+\b|$)/gi;

  let match, wanted = "";
  while ((match = re.exec(text)) !== null) {
    const num = Number(match[2]);
    const content = match[3].trim();
    if (num === Number(n)) {
      wanted = `<h5>Plusuri ${n}</h5>\n${content}`;
      break;
    }
  }

  return wanted;
}
// 🧩 Funcție care formatează frumos textul: titluri bold, linii noi, puncte pe rânduri separate
function formatTextWithNewlines(text) {
  if (!text) return "";

  return text
    // Normalizează liniile
    .replace(/\r\n/g, "\n")
    // Pune <br> înainte de fiecare punct (• sau –)
    .replace(/\n\s*[-•]\s*/g, "<br>• ")
    // Păstrează paragrafele duble
    .replace(/\n{2,}/g, "<br><br>")
    // Restul liniilor
    .replace(/\n/g, "<br>")
    // Titluri bold (Plusuri, Minusuri, Lucruri distructive)
    .replace(/(Plusuri\s*\d*)/gi, "<br><strong>$1</strong>")
    .replace(/(Minusuri\s*\d*)/gi, "<br><strong>$1</strong>")
    .replace(/(Lucruri\s*Distructive)/gi, "<br><strong>$1</strong>");
}

