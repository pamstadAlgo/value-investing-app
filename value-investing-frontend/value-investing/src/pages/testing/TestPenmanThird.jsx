import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

export default function TestPenmanThird() {
  const [inputs, setInputs] = useState({
    B0: 100,
    OI1: 15,
    NOA0: 100,
    OI2: 15.75,
    NOA1: 105,
    r: 0.1,
    g: 0.03,
  });

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const { B0, OI1, NOA0, OI2, NOA1, r, g } = inputs;

  const V =
    B0 + (OI1 - r * NOA0) / (1 + r) + (OI2 - r * NOA1) / ((1 + r) * (r - g));

  const symbolicFormula = String.raw`
    V = B_0 + \frac{(OI_1 - r \cdot NOA_0)}{1 + r} 
      + \frac{(OI_2 - r \cdot NOA_1)}{(1 + r)(r - g)}
  `;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-8">
      <h2 className="text-2xl font-semibold text-center">
        📘 Penman Valuation Formula
      </h2>

      {/* Symbolic formula (KaTeX) */}
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <BlockMath math={symbolicFormula} />
      </div>

      {/* Editable numeric formula */}
      <div className="bg-blue-50 p-4 rounded-lg text-center text-xl leading-relaxed flex flex-wrap justify-center gap-2">
        <span>V =</span>
        <EditableInput value={B0} onChange={(v) => handleChange("B0", v)} />

        <span> + (</span>
        <EditableInput value={OI1} onChange={(v) => handleChange("OI1", v)} />
        <span> − </span>
        <EditableInput value={r} onChange={(v) => handleChange("r", v)} />
        <span> × </span>
        <EditableInput value={NOA0} onChange={(v) => handleChange("NOA0", v)} />
        <span>) / (1 + </span>
        <EditableInput value={r} onChange={(v) => handleChange("r", v)} />
        <span>) + (</span>

        <EditableInput value={OI2} onChange={(v) => handleChange("OI2", v)} />
        <span> − </span>
        <EditableInput value={r} onChange={(v) => handleChange("r", v)} />
        <span> × </span>
        <EditableInput value={NOA1} onChange={(v) => handleChange("NOA1", v)} />
        <span>) / ((1 + </span>
        <EditableInput value={r} onChange={(v) => handleChange("r", v)} />
        <span>) × (</span>
        <EditableInput value={r} onChange={(v) => handleChange("r", v)} />
        <span> − </span>
        <EditableInput value={g} onChange={(v) => handleChange("g", v)} />
        <span>))</span>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        <motion.div
          key={V.toFixed(2)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.4 }}
          className="text-center text-2xl font-semibold text-blue-700">
          V = {V.toFixed(2)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Small inline numeric input styled like math text */
function EditableInput({ value, onChange }) {
  return (
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-16 text-center bg-transparent border-b border-blue-400 focus:border-blue-600 focus:outline-none"
    />
  );
}
