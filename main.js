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

  const digits = `${d}${m}${y}`.split("").map(Number);

  // --- OP1–OP4 ---
  const sum = digits.reduce((a, b) => a + b, 0);
  const op1 = sum;
  const op2 = sumDigits(op1);
  const op3 = Math.abs(op1 - 2 * Number(String(d)[0] || 0));
  const op4 = sumDigits(op3);

  const dStr = String(d);
  const mStr = String(m);
  let yStr = String(y).replace(/0/g, "");
  if (yStr === "") yStr = "0";

  const codPersonal = `${dStr}${mStr}${yStr}${op1}${op2}${op3}${op4}`;
  const codPersonalAfisat = `${dStr} ${mStr} ${yStr} ${op1} ${op2} ${op3} ${op4}`;

  let box = document.getElementById("personal-code");
  if (box) box.textContent = `Cod personal: ${codPersonalAfisat}`;

  // --- Vibrații ---
  const VI = reduceKeep(sumDigits(d));
  window.lastVI = VI;

  const VE = reduceKeep(sumDigits(m));
  window.lastVE = VE;

  const VC = reduceKeep(sumDigits(Number(String(y).slice(-2))));
  window.lastVC = VC;

  const VG = reduceKeep(sumDigits(d) + sumDigits(m));
  window.lastVG = VG;

  const VCD = sum;
  const VD = sumDigits(sum);

  const codes = [
    `VI: ${VI}`,
    `VE: ${VE}`,
    `VC: ${VC}`,
    `VG: ${VG}`,
    `VCD: ${VCD}`,
    `VD: ${VD}`
  ];

  document.getElementById("codes").innerHTML =
    codes.map(c => `<div class="vibration-box">${c}</div>`).join("");

  renderMatrix("matrixDate", codPersonal.split("").map(Number));
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
  const cells = Array(9).fill("");
  digits.forEach(n => {
    if (n >= 1 && n <= 9) cells[n - 1] += n;
  });

  const reordered = [
    cells[0] || "", cells[3] || "", cells[6] || "",
    cells[1] || "", cells[4] || "", cells[7] || "",
    cells[2] || "", cells[5] || "", cells[8] || ""
  ];

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

// ===== SECTIUNI =====
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

    const keyLower = k.toLowerCase();
    let extracted = "";
    let label = "";

    if (keyLower.includes("interioară") || keyLower.includes("interioara")) {
      label = "Vibrația interioară";
      const vi = window.lastVI || "?";
      extracted = extractVibrationBlock(SECTIONS[k], vi, "interioara");
    } else if (keyLower.includes("exterioară") || keyLower.includes("exterioara")) {
      label = "Vibrația exterioară";
      const ve = window.lastVE || "?";
      extracted = extractVibrationBlock(SECTIONS[k], ve, "exterioara");
    } else if (keyLower.includes("cosmică") || keyLower.includes("cosmica")) {
      label = "Vibrația cosmică";
      const vc = window.lastVC || "?";
      extracted = extractVibrationBlock(SECTIONS[k], vc, "cosmica");
    } else if (
      keyLower.includes("generală") || keyLower.includes("generala") ||
      keyLower.includes("globală") || keyLower.includes("globala")
    ) {
      label = keyLower.includes("globala") ? "Vibrația globală" : "Vibrația generală";
      const vg = window.lastVG || "?";
      extracted = extractVibrationBlock(SECTIONS[k], vg, "globala");
    }

    body.innerHTML = extracted
      ? `<h4>${label}</h4>${formatTextWithNewlines(extracted)}`
      : `<h4>${label}</h4><p>Nu există interpretare pentru această vibrație.</p>`;

    btn.onclick = () => {
      body.style.display = body.style.display === "none" ? "block" : "none";
    };

    div.appendChild(btn);
    div.appendChild(body);
    container.appendChild(div);
  });
}

// ===== EXTRAGERE TEXT =====
function extractVibrationBlock(fullText, n, type = "interioara") {
  if (!fullText) return "";

  const text = fullText
    .toString()
    .replace(/\r\n/g, "\n")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  let pattern = "";

  if (type.includes("interioara")) {
    pattern = `(^|\\n)\\s*plusuri\\s*${n}\\b[\\s\\S]*?(?=(^|\\n)\\s*plusuri\\s*\\d+\\b|$)`;
  } else if (type.includes("exterioara")) {
    pattern = `(^|\\n).*vibrati[ae]?\\s*exterioar[ae]?\\s*${n}\\b[\\s\\S]*?(?=(^|\\n).*vibrati[ae]?\\s*exterioar[ae]?\\s*\\d+\\b|$)`;
  } else if (type.includes("cosmica")) {
    pattern = `(^|\\n).*vibrati[ae]?\\s*cosmic[ae]?\\s*${n}\\b[\\s\\S]*?(?=(^|\\n).*vibrati[ae]?\\s*cosmic[ae]?\\s*\\d+\\b|$)`;
  } else if (type.includes("globala") || type.includes("generala")) {
    pattern = `(^|\\n).*vibrati[ae]?\\s*(globala|generala)\\s*${n}\\b[\\s\\S]*?(?=(^|\\n).*vibrati[ae]?\\s*(globala|generala)\\s*\\d+\\b|$)`;
  }

  const re = new RegExp(pattern, "i");
  const match = re.exec(text);
  return match ? match[0].trim() : "";
}

// ===== FORMATARE TEXT =====
function formatTextWithNewlines(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*[-•]\s*/g, "<br>• ")
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>")
    .replace(/(Plusuri\s*\d*)/gi, "<br><strong>$1</strong>")
    .replace(/(Minusuri\s*\d*)/gi, "<br><strong>$1</strong>")
    .replace(/(Lucruri\s*Distructive)/gi, "<br><strong>$1</strong>");
}
