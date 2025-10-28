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

  // extragem data
  const [year, month, day] = dob.split("-");
  const d = +day, m = +month, y = +year;

  // cifrele din data
  const digits = `${d}${m}${y}`.split("").map(Number);

  // calcule OP1-4
  const sum = digits.reduce((a, b) => a + b, 0);
  const op1 = sum;
  const op2 = sumDigits(op1);
  const op3 = Math.abs(op1 - 2 * Number(String(d)[0] || 0));
  const op4 = sumDigits(op3);

  // === COD PERSONAL ===
  const dStr = String(d).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const yStr = String(y);
  const codPersonal = `${dStr}${mStr}${yStr}${op1}${op2}${op3}${op4}`;

  const box = document.getElementById("personal-code");
  if (box) box.textContent = `Cod personal: ${codPersonal}`;

  // === VIBRAȚII ===
  const VI = reduceKeep(sumDigits(d));
  const VE = reduceKeep(sumDigits(m));
  const VC = reduceKeep(sumDigits(Number(String(y).slice(-2))));
  const VG = reduceKeep(sumDigits(d) + sumDigits(m));
  const VCD = sum;
  const VD = sumDigits(sum);

  const codes = [
    `OP1: ${op1}`, `OP2: ${op2}`, `OP3: ${op3}`, `OP4: ${op4}`,
    `VI: ${VI}`, `VE: ${VE}`, `VC: ${VC}`, `VG: ${VG}`, `VCD: ${VCD}`, `VD: ${VD}`
  ];
  document.getElementById("codes").innerHTML = codes.map(c => `<div>${c}</div>`).join("");

  // === MATRICEA de bază ===
  // folosim cifrele exacte din codul personal
  renderMatrix("matrixDate", codPersonal.split("").map(Number));

  // === MATRICEA numelui ===
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

  // afisăm – celulele goale rămân goale
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
    body.innerHTML = SECTIONS[k];
    body.style.display = "none";
    btn.onclick = () => {
      body.style.display = body.style.display === "none" ? "block" : "none";
    };
    div.appendChild(btn);
    div.appendChild(body);
    container.appendChild(div);
  });
}
