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
  const dStr = String(d).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const yStr = String(y);
  const digits = onlyDigits(`${dStr}${mStr}${yStr}`).split("").map(Number);

  const op1 = sum(digits);
  const op2 = sumDigits(op1);
  const firstDayDigit = Number(String(dStr)[0] || 0);
  const op3 = Math.abs(op1 - 2 * firstDayDigit);
  const op4 = sumDigits(op3);

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

// Reordonare matrice 147 / 258 / 369
function reorderMatrixVertical(matrixArray) {
  const order = [0, 3, 6, 1, 4, 7, 2, 5, 8];
  return order.map((i) => matrixArray[i] || "");
}

function nameDigits(fullName) {
  const clean = normalizeNa
