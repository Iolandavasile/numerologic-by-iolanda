import React, { useMemo, useState } from "react";
import sectionsRO from "../data/sections.ro.js";
import sectionsFR from "../data/sections.fr.js";

export default function NumerologyApp() {
  const [lang, setLang] = useState("ro");
  const sections = lang === "fr" ? sectionsFR : sectionsRO;

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

  return (
    <div className="min-h-screen w-full bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-neutral-900 rounded-2xl shadow-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">
            ✨ Numerologic by Iolanda
          </h1>
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
          {Object.entries(sections).map(([title, text], i) => (
            <div key={i} className="border border-gray-700 rounded-lg">
              <button
                className="w-full text-left px-4 py-3 bg-neutral-800 hover:bg-neutral-700 font-semibold text-yellow-300"
                onClick={() => toggleSection(i)}
              >
                {title}
              </button>
              {activeSection === i && (
                <div className="px-4 py-3 bg-neutral-900 text-gray-100 whitespace-pre-line">
                  {text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
