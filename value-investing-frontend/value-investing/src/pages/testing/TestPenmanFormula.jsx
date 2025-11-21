import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

export default function TestPenmanFormula() {
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

  // Calculate the value V
  const V =
    B0 + (OI1 - r * NOA0) / (1 + r) + (OI2 - r * NOA1) / ((1 + r) * (r - g));

  // LaTeX formula dynamically filled with user values
  const formula = String.raw`
    V = ${B0} + \frac{(${OI1} - ${r.toFixed(2)} \cdot ${NOA0})}{1 + ${r.toFixed(
    2
  )}} 
    + \frac{(${OI2} - ${r.toFixed(2)} \cdot ${NOA1})}{(1 + ${r.toFixed(
    2
  )})(${r.toFixed(2)} - ${g.toFixed(2)})}
  `;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        📘 Penman Valuation Formula
      </h2>

      {/* Formula */}
      <motion.div
        key={formula}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-50 p-4 rounded-lg text-center">
        <BlockMath math={formula} />
      </motion.div>

      {/* Input grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.keys(inputs).map((key) => (
          <div key={key} className="flex flex-col items-start">
            <label className="font-medium mb-1">{key}</label>
            <input
              type="number"
              step="any"
              value={inputs[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="border rounded-md p-2 w-full text-center"
            />
          </div>
        ))}
      </div>

      {/* Result display with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={V.toFixed(2)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.4 }}
          className="text-center text-xl font-semibold text-blue-600">
          V = {V.toFixed(2)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
