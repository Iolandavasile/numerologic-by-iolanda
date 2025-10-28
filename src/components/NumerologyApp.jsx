import React, { useMemo, useState } from "react";
import sectionsRO from "../data/sections.ro.js";
import sectionsFR from "../data/sections.fr.js";

// ---------- Helpers ----------
const onlyDigits = (s) => (s || "").replace(/[^0-9]/g, "");
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const sumDigits = (n) => n.toString().split("").map(Number).reduce((a, b) => a + b, 0);
const reduceKeep = (n, keepMasters = true) => {
  if (keepMasters && [11, 22, 33].includes(n)) return n;
  while (n > 9) {
    n = sumDigits(n);
    if (keepMasters && [11, 22, 33].includes(n)) return n;
  }
  return n;
};
const normalizeName = (s) =>
  (s || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Z\s\-']/g, "")
    .trim();

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);
const charVal = (ch) => {
  const c = ch.charCodeAt(0);
  if (c < 65 || c > 90) return 0;
  const base = c - 64;
  return ((base - 1) % 9) + 1;
};

// ---------- Date parse ----------
function parseDMY(input) {
  const raw = onlyDigits(input);
  if (raw.length !== 8) return { d: NaN, m: NaN, y: NaN };
  const a = Number(raw.slice(0, 4));
  if (a > 1800 && a < 3000) {
    return {
      y: Number(raw.slice(0, 4)),
      m: Number(raw.slice(4, 6)),
      d: Number(raw.slice(6, 8)),
    };
  } else {
    return {
      d: Number(raw.slice(0, 2)),
      m: Number(raw.slice(2, 4)),
      y: Number(raw.slice(4, 8)),
    };
  }
}

// ---------- Codul personal ----------
function personalCode(d, m, y) {
  // asigurăm ordinea corectă zi-lună-an
  const dStr = String(d).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const yStr = String(y);
  const digits = onlyDigits(`${dStr}${mStr}${yStr}`).split("").map(Number);

  // calcule clasice pentru codul personal
  const op1 = sum(digits);                // Calea destinului
  const op2 = sumDigits(op1);             // Destinul
  const firstDayDigit = Number(String(dStr)[0] || 0);
  const op3 = Math.abs(op1 - 2 * firstDayDigit); // Problemele karmice
  const op4 = sumDigits(op3);             // Rezolvarea karmei

  return { op1, op2, op3, op4, dStr, mStr, yStr };
}

// ---------- Matrice ----------
function fillMatrixFromDigits(digits) {
  const out = Array(9).fill("");
  digits.forEach((n) => {
    if (n >= 1 && n <= 9) {
      out[n - 1] = out[n - 1] + String(n);
    }
  });
  return out;
}

function reorderMatrixVertical(matrixArray) {
  // Reordonăm pentru structura 147 / 258 / 369
  const order = [0, 3, 6, 1, 4, 7, 2, 5, 8];
  return order.map(i => matrixArray[i] || "");
}

function nameDigits(fullName) {
  const clean = normalizeName(fullName);
  const arr = [];
  for (const ch of clean) {
    if (/[A-Z]/.test(ch)) {
      arr.push(charVal(ch));
    }
  }
  return arr;
}

function nameNumbers(fullName) {
  const clean = normalizeName(fullName);
  let total = 0,
    vowels = 0,
    consonants = 0;
  for (const ch of clean) {
    if (!/[A-Z]/.test(ch)) continue;
    const v = charVal(ch);
    total += v;
    if (VOWELS.has(ch)) vowels += v;
    else consonants += v;
  }
  return { total, vowels, consonants };
}

function hereditaryNumber(fullName) {
  const parts = normalizeName(fullName).split(/\s+/).filter(Boolean);
  if (!parts.length) return 0;
  const surname = parts[parts.length - 1];
  let s = 0;
  for (const ch of surname) {
    if (/[A-Z]/.test(ch)) s += charVal(ch);
  }
  return s;
}

// ---------- Vibrații ----------
function vibratii(d, m, y, keepMasters = true) {
  const VI_raw = sumDigits(d);
  const VI = reduceKeep(VI_raw, keepMasters);
  const VE = reduceKeep(sumDigits(m), keepMasters);
  const last2 = Number(String(y).slice(-2));
  const VC = reduceKeep(sumDigits(last2), keepMasters);
  const VG = reduceKeep(sumDigits(d) + sumDigits(m), keepMasters);
  const allDigits = onlyDigits(`${d}${m}${y}`).split("").map(Number);
  const VCD = sum(allDigits);
  const VD = sumDigits(VCD);
  return { VI, VE, VC, VG, VCD, VD };
}

// ---------- Componenta principală ----------
export default function NumerologyApp() {
  const [lang, setLang] = useState("ro");
  const texts = useMemo(() => (lang === "fr" ? sectionsFR : sectionsRO), [lang]);
  const [dateInput, setDateInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [keepMasters, setKeepMasters] = useState(true);
  const [openKey, setOpenKey] = useState(null);

  const calc = useMemo(() => {
    const { d, m, y } = parseDMY(dateInput);
    if (!d || !m || !y) return null;
    const { op1, op2, op3, op4 } = personalCode(d, m, y);
    const vib = vibratii(d, m, y, keepMasters);
    const baseDigits = [
      ...onlyDigits(String(d)).split("").map(Number),
      ...onlyDigits(String(m)).split("").map(Number),
      ...onlyDigits(String(y)).split("").map(Number),
      ...onlyDigits(String(op1)).split("").map(Number),
      ...onlyDigits(String(op2)).split("").map(Number),
      ...onlyDigits(String(op3)).split("").map(Number),
      ...onlyDigits(String(op4)).split("").map(Number),
    ];
    const baseMatrix = fillMatrixFromDigits(baseDigits);
    const nDigits = nameDigits(fullName);
    const nameMatrix = fillMatrixFromDigits(nDigits);
    const { total, vowels, consonants } = nameNumbers(fullName);
    const nrExprimare = reduceKeep(total, keepMasters);
    const nrIntim = reduceKeep(vowels, keepMasters);
    const nrRealizare = reduceKeep(consonants, keepMasters);
    const ereditarRaw = hereditaryNumber(fullName);
    const nrEreditar = reduceKeep(ereditarRaw, keepMasters);
    return {
      d, m, y, op1, op2, op3, op4,
      ...vib,
      baseMatrix,
      nameMatrix,
      nrExprimare, nrRealizare, nrIntim, nrEreditar,
    };
  }, [dateInput, fullName, keepMasters]);

  // ✅ Codul Personal concatenat
  const codPersonal = calc
  ? `${String(calc.d).padStart(2, "0")}${String(calc.m).padStart(2, "0")}${String(calc.y)}${calc.op1}${calc.op2}${calc.op3}${calc.op4}`
  : "";

  const sectionOrder = Object.keys(texts || {});

  return (
    <div style={{
      backgroundColor: "#000",
      color: "#fff",
      minHeight: "100vh",
      fontFamily: "Poppins, sans-serif",
      padding: "20px"
    }}>
      <h1 style={{ color: "#FFD700", textAlign: "center" }}>
        ✨ Numerologic by Iolanda
      </h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="ro">Română</option>
          <option value="fr">Français</option>
        </select>
        <input
          type="text"
          placeholder="Data nașterii (DD.MM.YYYY)"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nume complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {/* ✅ Afișăm codul personal */}
      {codPersonal && (
        <div style={{ textAlign: "center", color: "#FFD700", fontSize: "1.2rem", marginBottom: "20px" }}>
          <strong>Cod personal:</strong> {codPersonal}
        </div>
      )}

      {/* Restul calculelor */}
      {calc && (
        <>
          <h2 style={{ color: "#FFD700" }}>Cod personal și vibrații</h2>
          <p>OP1: {calc.op1} | OP2: {calc.op2} | OP3: {calc.op3} | OP4: {calc.op4}</p>
          <p>VI: {calc.VI} | VE: {calc.VE} | VC: {calc.VC} | VG: {calc.VG} | VCD: {calc.VCD} | VD: {calc.VD}</p>
        </>
      )}
    </div>
  );
}
