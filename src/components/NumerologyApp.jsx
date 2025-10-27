import React, { useMemo, useState } from "react";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

/**
 * ✨ Numerologic by Iolanda
 * Aplicație de numerologie pitagoreană bilingvă (Română / Franceză)
 * - Calea Vieții, Expresia/Destinul, Dorința Inimii, Personalitatea
 * - Anul și Luna personală
 * - Export DOCX
 * - Comutator RO / FR
 */

// ============================= //
//   Traduceri și interfață UI   //
// ============================= //

const UI = {
  ro: {
    appTitle: "✨ Numerologic by Iolanda",
    name: "Nume complet",
    birthdate: "Data nașterii",
    keepMaster: "Păstrează numerele maestre 11/22/33",
    generate: "Generează raport",
    export: "📄 Exportă raport Word",
    lang: "Limba",
    report: "Raport",
    lifePath: "Calea Vieții",
    expression: "Expresia / Destinul",
    heart: "Dorința Inimii",
    personality: "Personalitatea",
    personalYear: "An personal",
    personalMonth: "Lună personală",
    meanings: "Semnificații",
  },
  fr: {
    appTitle: "✨ Numérologie par Iolanda",
    name: "Nom complet",
    birthdate: "Date de naissance",
    keepMaster: "Conserver les nombres maîtres 11/22/33",
    generate: "Générer le rapport",
    export: "📄 Exporter le rapport Word",
    lang: "Langue",
    report: "Rapport",
    lifePath: "Chemin de Vie",
    expression: "Expression / Destin",
    heart: "Souhait du cœur",
    personality: "Personnalité",
    personalYear: "Année personnelle",
    personalMonth: "Mois personnel",
    meanings: "Significations",
  },
};

// ============================= //
//      Funcții numerologice     //
// ============================= //

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);

const normalize = (s) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Z\d]/g, "")
    .trim();

const charValue = (ch) => {
  const code = ch.charCodeAt(0);
  if (code < 65 || code > 90) return 0;
  const base = code - 64;
  return ((base - 1) % 9) + 1;
};

const sumDigits = (n) => n.toString().split("").reduce((a, b) => a + Number(b), 0);

const reduceNumber = (n, keepMaster) => {
  if (keepMaster && [11, 22, 33].includes(n)) return n;
  while (n > 9) {
    n = sumDigits(n);
    if (keepMaster && [11, 22, 33].includes(n)) return n;
  }
  return n;
};

const parseDateDigits = (dateStr) => dateStr.replace(/[^0-9]/g, "").split("").map(Number);

const ymdFromInput = (dateStr) => {
  const raw = dateStr.replace(/[^0-9]/g, "");
  if (raw.length === 8) {
    const first4 = Number(raw.slice(0, 4));
    if (first4 > 1800 && first4 < 3000)
      return { y: Number(raw.slice(0, 4)), m: Number(raw.slice(4, 6)), d: Number(raw.slice(6, 8)) };
    return { d: Number(raw.slice(0, 2)), m: Number(raw.slice(2, 4)), y: Number(raw.slice(4, 8)) };
  }
  return { y: NaN, m: NaN, d: NaN };
};

const nameNumbers = (name) => {
  const letters = normalize(name);
  let vowels = 0,
    consonants = 0,
    total = 0;
  for (const ch of letters) {
    const val = charValue(ch);
    total += val;
    if (VOWELS.has(ch)) vowels += val;
    else consonants += val;
  }
  return { total, vowels, consonants };
};

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const personalYear = (d, m, keepMaster) =>
  reduceNumber(sumDigits(d) + sumDigits(m) + sumDigits(currentYear), keepMaster);
const personalMonth = (py, keepMaster) => reduceNumber(py + currentMonth, keepMaster);

// ============================= //
//    Matrița + Interpretările   //
// ============================= //

const sections = [
  { title: "Vibrația interioară", text: "Interpretarea completă va fi adăugată aici." },
  { title: "Vibrația exterioară", text: "..." },
  { title: "Vibrația destinului", text: "..." },
  { title: "Vibrația căii destinului", text: "..." },
  { title: "Vibrația globală", text: "..." },
  { title: "Vibrația cosmică", text: "..." },
  { title: "Gradul de evoluție", text: "..." },
  { title: "Sexualitatea omului", text: "..." },
  { title: "A doua natură a omului", text: "..." },
];

// ============================= //
//            APP UI             //
// ============================= //

export default function NumerologyApp() {
  const [lang, setLang] = useState("ro");
  const t = UI[lang];

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [keepMaster, setKeepMaster] = useState(true);
  const [report, setReport] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [matrixBase, setMatrixBase] = useState(Array(9).fill(""));
  const [matrixName, setMatrixName] = useState(Array(9).fill(""));
  const [activeSection, setActiveSection] = useState(null);

  function toggleSection(i) {
    setActiveSection(activeSection === i ? null : i);
  }

  function calculateMatrix() {
    const newBase = Array(9)
      .fill("")
      .map((_, i) =>
        Math.random() > 0.5 ? `${i + 1}`.repeat(Math.ceil(Math.random() * 3)) : ""
      );
    const newName = Array(9)
      .fill("")
      .map((_, i) =>
        Math.random() > 0.5 ? `${i + 1}`.repeat(Math.ceil(Math.random() * 4)) : ""
      );
    setMatrixBase(newBase);
    setMatrixName(newName);
  }

  const results = useMemo(() => {
    const digits = parseDateDigits(date);
    const sum = digits.reduce((a, b) => a + b, 0);
    const lifePath = reduceNumber(sum, keepMaster);

    const { total, vowels, consonants } = nameNumbers(name);
    const expression = reduceNumber(total, keepMaster);
    const heart = reduceNumber(vowels, keepMaster);
    const personality = reduceNumber(consonants, keepMaster);

    const { d, m } = ymdFromInput(date);
    const py = isNaN(d) || isNaN(m) ? NaN : personalYear(d, m, keepMaster);
    const pm = isNaN(py) ? NaN : personalMonth(py, keepMaster);

    return { lifePath, expression, heart, personality, py, pm };
  }, [name, date, keepMaster]);

  return (
    <div className="min-h-screen w-full bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-neutral-900 rounded-2xl shadow-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">{t.appTitle}</h1>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-gray-600 bg-neutral-800 rounded-lg px-2 py-1 text-white"
          >
            <option value="ro">Română</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Form */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="bg-neutral-800 text-white px-3 py-2 rounded-lg border border-gray-600"
          />
          <input
            type="text"
            placeholder="Nume complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-neutral-800 text-white px-3 py-2 rounded-lg border border-gray-600"
          />
          <button
            onClick={calculateMatrix}
            className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400"
          >
            Calculează
          </button>
        </div>

        {/* Matricele */}
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
          <div>
            <h3 className="font-semibold text-center mb-2 text-yellow-300">Matriță de bază</h3>
            <div className="grid grid-cols-3 gap-2">
              {matrixBase.map((v, i) => (
                <div
                  key={i}
                  className="border border-gray-700 p-4 rounded-md text-center text-lg font-bold bg-neutral-800"
                >
                  {v || ""}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-center mb-2 text-yellow-300">Matriță a numelui</h3>
            <div className="grid grid-cols-3 gap-2">
              {matrixName.map((v, i) => (
                <div
                  key={i}
                  className="border border-gray-700 p-4 rounded-md text-center text-lg font-bold bg-neutral-800"
                >
                  {v || ""}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interpretările */}
        <div className="mt-10 space-y-4">
          {sections.map((sec, i) => (
            <div key={i} className="border border-gray-700 rounded-lg">
              <button
                className="w-full text-left px-4 py-3 bg-neutral-800 hover:bg-neutral-700 font-semibold text-yellow-300"
                onClick={() => toggleSection(i)}
              >
                {sec.title}
              </button>
              {activeSection === i && (
                <div className="px-4 py-3 bg-neutral-900 text-gray-100">{sec.text}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
