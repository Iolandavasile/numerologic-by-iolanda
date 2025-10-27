import React, { useMemo, useState } from "react";
import sectionsRO from "./sections.ro.js";
let sectionsFR = {};
try { sectionsFR = (await import("./sections.fr.js")).default || {}; } catch { /* ok */ }

// ---------- Helpers ----------
const onlyDigits = (s) => (s || "").replace(/[^0-9]/g, "");
const sum = (arr) => arr.reduce((a,b)=>a+b,0);
const sumDigits = (n) => n.toString().split("").map(Number).reduce((a,b)=>a+b,0);
const reduceKeep = (n, keepMasters=true) => {
  if (keepMasters && [11,22,33].includes(n)) return n;
  while (n>9){
    n = sumDigits(n);
    if (keepMasters && [11,22,33].includes(n)) return n;
  }
  return n;
};
const normalizeName = (s) =>
  (s || "").toUpperCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"")
    .replace(/[^A-Z\s\-']/g,"").trim();

const VOWELS = new Set(["A","E","I","O","U","Y"]);
const charVal = (ch) => {
  const c = ch.charCodeAt(0);
  if (c<65 || c>90) return 0;
  const base = c-64;
  return ((base-1)%9)+1; // Pythagorean
};

// ---------- Date parse ----------
function parseDMY(input){
  const raw = onlyDigits(input);
  if (raw.length!==8) return {d:NaN,m:NaN,y:NaN};
  // accept DDMMYYYY sau YYYYMMDD
  const a = Number(raw.slice(0,4));
  if (a>1800 && a<3000){
    return {y:Number(raw.slice(0,4)), m:Number(raw.slice(4,6)), d:Number(raw.slice(6,8))};
  }else{
    return {d:Number(raw.slice(0,2)), m:Number(raw.slice(2,4)), y:Number(raw.slice(4,8))};
  }
}

// ---------- Codul personal (cele 4 operații) ----------
function personalCode(d,m,y){
  const digits = onlyDigits(`${d}${m}${y}`).split("").map(Number);
  const op1 = sum(digits);                // Calea (drumul) către destin (poate fi 1-2 cifre)
  const op2 = sumDigits(op1);             // Vibrația destinului (1-2 cifre, nu mai reducem încă o dată)
  const firstDayDigit = Number(String(d)[0] || 0);
  let op3 = Math.abs(op1 - 2*firstDayDigit); // Datoria karmică (modulul, 1-2 cifre)
  const op4 = sumDigits(op3);                // Modul de rezolvare (1-2 cifre)

  return { op1, op2, op3, op4 };
}

// ---------- Matrice (147 / 258 / 369) ----------
// baza = toate cifrele din data + cifrele din op1/op2/op3/op4 (fiecare cifră separat)
// nume = toate cifrele din nume (convertite prin A1..I9…)
function fillMatrixFromDigits(digits){
  // index: 0..8 => cifrele 1..9, celula string ca "111" etc
  const out = Array(9).fill("");
  digits.forEach(n=>{
    if (n>=1 && n<=9){
      out[n-1] = out[n-1] + String(n);
    }
  });
  return out;
}

function nameDigits(fullName){
  const clean = normalizeName(fullName);
  const arr = [];
  for (const ch of clean){
    if (/[A-Z]/.test(ch)){
      arr.push(charVal(ch));
    }
  }
  return arr;
}

// ---------- Numele: Exprimare / Intim / Realizare / Ereditar ----------
function nameNumbers(fullName){
  const clean = normalizeName(fullName);
  let total=0, vowels=0, consonants=0;
  for (const ch of clean){
    if (!/[A-Z]/.test(ch)) continue;
    const v = charVal(ch);
    total += v;
    if (VOWELS.has(ch)) vowels += v; else consonants += v;
  }
  return { total, vowels, consonants };
}
function hereditaryNumber(fullName){
  // numele de familie = ultimul cuvânt alfabetic din nume
  const parts = normalizeName(fullName).split(/\s+/).filter(Boolean);
  if (!parts.length) return 0;
  const surname = parts[parts.length-1];
  let s=0; for(const ch of surname){ if (/[A-Z]/.test(ch)) s+=charVal(ch); }
  return s;
}

// ---------- Vibrații (după cursul tău) ----------
function vibratii(d,m,y, keepMasters=true){
  // VI = vibrația interioară = ziua redusă la 1 cifră (omul devine mai întâi cifra simplă; 11 rămâne master în interpretare)
  const VI_raw = sumDigits(d);
  const VI = reduceKeep(VI_raw, keepMasters);

  // VE = vibrația exterioară = luna redusă
  const VE = reduceKeep(sumDigits(m), keepMasters);

  // VC = vibrația cosmică = ultimele 2 cifre din an (ex: 1981 -> 81 -> 8+1 = 9)
  const last2 = Number(String(y).slice(-2));
  const VC = reduceKeep(sumDigits(last2), keepMasters);

  // VG = vibrația globală = ziua + luna (după curs)
  const VG = reduceKeep(sumDigits(d)+sumDigits(m), keepMasters);

  // VCD = vibrația căii destinului = suma TUTUROR cifrelor (zi+luna+an) => OP1
  const allDigits = onlyDigits(`${d}${m}${y}`).split("").map(Number);
  const VCD = sum(allDigits);

  // VD = vibrația destinului = suma cifrelor din OP1 (nu mai reduci încă o dată)
  const VD = sumDigits(VCD);

  return { VI, VE, VC, VG, VCD, VD };
}

// ---------- UI ----------
export default function App(){
  const [lang, setLang] = useState("ro"); // română implicit
  const texts = useMemo(()=> lang==="fr" ? sectionsFR : sectionsRO, [lang]);

  const [dateInput, setDateInput] = useState(""); // acceptă DD.MM.YYYY sau YYYY-MM-DD etc.
  const [fullName, setFullName] = useState("");
  const [keepMasters, setKeepMasters] = useState(true);
  const [openKey, setOpenKey] = useState(null);

  const calc = useMemo(()=>{
    const {d,m,y} = parseDMY(dateInput);
    if (!d || !m || !y) return null;

    // Codul personal (4 operații)
    const {op1,op2,op3,op4} = personalCode(d,m,y);

    // Vibrații
    const vib = vibratii(d,m,y, keepMasters);

    // Matrice Bază (data + operativ)
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

    // Matrice Nume
    const nDigits = nameDigits(fullName);
    const nameMatrix = fillMatrixFromDigits(nDigits);

    // Numele – Exprimare/Intim/Realizare/Ereditar
    const { total, vowels, consonants } = nameNumbers(fullName);
    const nrExprimare = reduceKeep(total, keepMasters);
    const nrIntim = reduceKeep(vowels, keepMasters);
    const nrRealizare = reduceKeep(consonants, keepMasters);
    const ereditarRaw = hereditaryNumber(fullName);
    const nrEreditar = reduceKeep(ereditarRaw, keepMasters);

    return {
      d,m,y,
      op1,op2,op3,op4,
      ...vib,
      baseMatrix,
      nameMatrix,
      nrExprimare, nrRealizare, nrIntim, nrEreditar
    };
  }, [dateInput, fullName, keepMasters]);

  // titlurile în ordinea cerută (same order ca în sections.ro.js)
  const sectionOrder = Object.keys(texts || {});

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="brand">
          <span className="badge">✨ Numerologic by Iolanda</span>
          <span style={{color:"var(--muted)"}}>Analiză pitagoreană • RO / FR</span>
        </div>
        <div className="switch">
          <label style={{color:"var(--muted)"}}>Păstrează 11/22/33</label>
          <input type="checkbox" checked={keepMasters} onChange={e=>setKeepMasters(e.target.checked)} />
          <select className="lang" value={lang} onChange={e=>setLang(e.target.value)}>
            <option value="ro">RO</option>
            <option value="fr">FR</option>
          </select>
        </div>
      </div>

      {/* Introducere date */}
      <div className="panel">
        <div className="grid2">
          <div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>Data nașterii</div>
            <input className="input" placeholder="DD.MM.YYYY sau YYYY-MM-DD"
              value={dateInput} onChange={e=>setDateInput(e.target.value)} />
          </div>
          <div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>Nume complet</div>
            <input className="input" placeholder="Nume Prenume"
              value={fullName} onChange={e=>setFullName(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Cod personal + vibrații */}
      <div className="panel">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <h2 style={{margin:0}}>Codul personal & vibrații</h2>
          {calc ? null : <span style={{color:"var(--muted)"}}>(completează data și numele)</span>}
        </div>

        <div className="kpis">
          <div className="kpi"><div className="t">OP1 (Calea)</div><div className="v">{calc?.op1 ?? "-"}</div></div>
          <div className="kpi"><div className="t">OP2 (Destin)</div><div className="v">{calc?.op2 ?? "-"}</div></div>
          <div className="kpi"><div className="t">OP3 (Datorie)</div><div className="v">{calc?.op3 ?? "-"}</div></div>
          <div className="kpi"><div className="t">OP4 (Rezolvare)</div><div className="v">{calc?.op4 ?? "-"}</div></div>

          <div className="kpi"><div className="t">VI</div><div className="v">{calc?.VI ?? "-"}</div></div>
          <div className="kpi"><div className="t">VE</div><div className="v">{calc?.VE ?? "-"}</div></div>
          <div className="kpi"><div className="t">VC</div><div className="v">{calc?.VC ?? "-"}</div></div>
          <div className="kpi"><div className="t">VG</div><div className="v">{calc?.VG ?? "-"}</div></div>
          <div className="kpi"><div className="t">VCD (sumă data)</div><div className="v">{calc?.VCD ?? "-"}</div></div>
          <div className="kpi"><div className="t">VD (suma cifrelor OP1)</div><div className="v">{calc?.VD ?? "-"}</div></div>
        </div>
      </div>

      {/* Matrici */}
      <div className="matrices">
        <div className="matrixCard">
          <h3>Matrița de bază (data)</h3>
          <div className="legend">Aranjare 1-4-7 / 2-5-8 / 3-6-9 • fără contururi de vectori</div>
          <div className="matrix">
            {/* 1 4 7 */}
            <div className="cell">{calc?.baseMatrix?.[0] || <span className="dim">1</span>}</div>
            <div className="cell">{calc?.baseMatrix?.[3] || <span className="dim">4</span>}</div>
            <div className="cell">{calc?.baseMatrix?.[6] || <span className="dim">7</span>}</div>
            {/* 2 5 8 */}
            <div className="cell">{calc?.baseMatrix?.[1] || <span className="dim">2</span>}</div>
            <div className="cell">{calc?.baseMatrix?.[4] || <span className="dim">5</span>}</div>
            <div className="cell">{calc?.baseMatrix?.[7] || <span className="dim">8</span>}</div>
            {/* 3 6 9 */}
            <div className="cell">{calc?.baseMatrix?.[2] || <span className="dim">3</span>}</div>
            <div className="cell">{calc?.baseMatrix?.[5] || <span className="dim">6</span>}</div>
            <div className="cell">{calc?.baseMatrix?.[8] || <span className="dim">9</span>}</div>
          </div>
        </div>

        <div className="matrixCard">
          <h3>Matrița numelui</h3>
          <div className="legend">Aranjare 1-4-7 / 2-5-8 / 3-6-9 • cifre repetate „11111”</div>
          <div className="matrix">
            {/* 1 4 7 */}
            <div className="cell">{calc?.nameMatrix?.[0] || <span className="dim">1</span>}</div>
            <div className="cell">{calc?.nameMatrix?.[3] || <span className="dim">4</span>}</div>
            <div className="cell">{calc?.nameMatrix?.[6] || <span className="dim">7</span>}</div>
            {/* 2 5 8 */}
            <div className="cell">{calc?.nameMatrix?.[1] || <span className="dim">2</span>}</div>
            <div className="cell">{calc?.nameMatrix?.[4] || <span className="dim">5</span>}</div>
            <div className="cell">{calc?.nameMatrix?.[7] || <span className="dim">8</span>}</div>
            {/* 3 6 9 */}
            <div className="cell">{calc?.nameMatrix?.[2] || <span className="dim">3</span>}</div>
            <div className="cell">{calc?.nameMatrix?.[5] || <span className="dim">6</span>}</div>
            <div className="cell">{calc?.nameMatrix?.[8] || <span className="dim">9</span>}</div>
          </div>
        </div>
      </div>

      {/* Numerele numelui */}
      <div className="panel">
        <h3 style={{marginTop:0}}>Numere din nume</h3>
        <div className="subgrid">
          <div className="chip">
            <div className="label">Număr de Exprimare</div>
            <div className="value">{calc?.nrExprimare ?? "-"}</div>
          </div>
          <div className="chip">
            <div className="label">Număr de Realizare</div>
            <div className="value">{calc?.nrRealizare ?? "-"}</div>
          </div>
          <div className="chip">
            <div className="label">Număr Intim</div>
            <div className="value">{calc?.nrIntim ?? "-"}</div>
          </div>
          <div className="chip">
            <div className="label">Număr Ereditar</div>
            <div className="value">{calc?.nrEreditar ?? "-"}</div>
          </div>
        </div>
      </div>

      {/* Interpretări (acordeon, pe aceeași pagină) */}
      <div className="panel">
        <h3 style={{marginTop:0}}>Interpretări</h3>
        {sectionOrder.map((key)=>(
          <div key={key} className="accordionItem">
            <button className="accordionBtn" onClick={()=>setOpenKey(openKey===key?null:key)}>
              {key}
            </button>
            {openKey===key && (
              <div className="body">
                {texts?.[key] || "(completează în sections.ro.js)"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
