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
    appTitle: "✨ Numerologic by Iolanda",
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

const personalYear = (d, m, keepMaster) => reduceNumber(sumDigits(d) + sumDigits(m) + sumDigits(currentYear), keepMaster);
const personalMonth = (py, keepMaster) => reduceNumber(py + currentMonth, keepMaster);

// ============================= //
//         Interpretări          //
// ============================= //

const meaningsRO = {
  1: "Inițiator, curajos, lider. Lecția: încredere și direcție.",
  2: "Diplomat, empatic, cooperant. Lecția: echilibru emoțional.",
  3: "Creativ, expresiv, jucăuș. Lecția: finalizează proiectele.",
  4: "Structurat, muncitor, disciplinat. Lecția: deschidere spre nou.",
  5: "Liber, adaptabil, călător. Lecția: stabilitate interioară.",
  6: "Familist, estetic, grijuliu. Lecția: echilibru între tine și ceilalți.",
  7: "Cercetător, spiritual, analitic. Lecția: deschidere și încredere.",
  8: "Ambițios, lider, manager. Lecția: etică și echilibru.",
  9: "Umanitar, artistic, vizionar. Lecția: detașare și iertare.",
  11: "Maestru inspirat. Lecția: încredere în intuiție.",
  22: "Arhitect vizionar. Lecția: manifestare conștientă.",
  33: "Vindecător prin iubire. Lecția: granițe sănătoase.",
};

const meaningsFR = {
  1: "Initiateur, courageux, leader. Leçon : confiance et direction.",
  2: "Diplomate, empathique, coopératif. Leçon : équilibre émotionnel.",
  3: "Créatif, expressif, joueur. Leçon : terminer ce qui est commencé.",
  4: "Structuré, travailleur, discipliné. Leçon : ouverture d'esprit.",
  5: "Libre, adaptable, voyageur. Leçon : stabilité intérieure.",
  6: "Familial, esthétique, attentionné. Leçon : équilibre personnel.",
  7: "Chercheur, spirituel, analytique. Leçon : confiance et ouverture.",
  8: "Ambitieux, dirigeant, gestionnaire. Leçon : éthique et équilibre.",
  9: "Humanitaire, artistique, visionnaire. Leçon : détachement et pardon.",
  11: "Maître inspiré. Leçon : faire confiance à l’intuition.",
  22: "Architecte visionnaire. Leçon : manifestation consciente.",
  33: "Guérisseur par l’amour. Leçon : limites saines.",
};

// ============================= //
//         Raport DOCX           //
// ============================= //

async function exportDocx({ name, date, results, lang }) {
  const t = UI[lang];
  const m = lang === "ro" ? meaningsRO : meaningsFR;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: t.appTitle, heading: HeadingLevel.TITLE }),
          new Paragraph(`Nume / Nom: ${name}`),
          new Paragraph(`Data / Date: ${date}`),
          new Paragraph(""),
          new Paragraph(`${t.lifePath}: ${results.lifePath} – ${m[results.lifePath] || ""}`),
          new Paragraph(`${t.expression}: ${results.expression} – ${m[results.expression] || ""}`),
          new Paragraph(`${t.heart}: ${results.heart}`),
          new Paragraph(`${t.personality}: ${results.personality}`),
          new Paragraph(`${t.personalYear}: ${results.py}`),
          new Paragraph(`${t.personalMonth}: ${results.pm}`),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.appTitle.replace(/[^a-z0-9]/gi, "_")}_${name}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

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

  const generate = () => {
    const m = lang === "ro" ? meaningsRO : meaningsFR;
    const txt = [
      `${t.appTitle}`,
      `Nume: ${name} | Data: ${date}`,
      "",
      `${t.lifePath}: ${results.lifePath} – ${m[results.lifePath] || ""}`,
      `${t.expression}: ${results.expression} – ${m[results.expression] || ""}`,
      `${t.heart}: ${results.heart}`,
      `${t.personality}: ${results.personality}`,
      `${t.personalYear}: ${results.py}`,
      `${t.personalMonth}: ${results.pm}`,
    ].join("\n");
    setReport(txt);
    navigator.clipboard?.writeText(txt);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.appTitle}</h1>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border rounded-lg px-2 py-1"
          >
            <option value="ro">Română</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">{t.name}</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">{t.birthdate}</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="master"
            type="checkbox"
            checked={keepMaster}
            onChange={(e) => setKeepMaster(e.target.checked)}
          />
          <label htmlFor="master">{t.keepMaster}</label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-indigo-50 p-3">
            <div className="text-xs uppercase text-indigo-700">{t.lifePath}</div>
            <div className="text-2xl font-extrabold">{results.lifePath || "-"}</div>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <div className="text-xs uppercase text-amber-700">{t.expression}</div>
            <div className="text-2xl font-extrabold">{results.expression || "-"}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="text-xs uppercase text-emerald-700">{t.heart}</div>
            <div className="text-2xl font-extrabold">{results.heart || "-"}</div>
          </div>
          <div className="rounded-xl bg-rose-50 p-3">
            <div className="text-xs uppercase text-rose-700">{t.personality}</div>
            <div className="text-2xl font-extrabold">{results.personality || "-"}</div>
          </div>
          <div className="rounded-xl bg-sky-50 p-3">
            <div className="text-xs uppercase text-sky-700">{t.personalYear}</div>
            <div className="text-2xl font-extrabold">{results.py || "-"}</div>
          </div>
          <div className="rounded-xl bg-purple-50 p-3">
            <div className="text-xs uppercase text-purple-700">{t.personalMonth}</div>
            <div className="text-2xl font-extrabold">{results.pm || "-"}</div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={generate}
          >
            {t.generate}
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() => exportDocx({ name, date, results, lang })}
          >
            {t.export}
          </button>
        </div>

        <textarea
          className="w-full min-h-[200px] border rounded-xl p-3 font-mono text-sm"
          value={report}
          onChange={(e) => setReport(e.target.value)}
        />
      </div>
    </div>
  );
}
