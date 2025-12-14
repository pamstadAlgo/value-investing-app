import React, { useState, useEffect } from "react";
import { OutlinedInput } from "@mui/material";

const ValuationInputCell = ({
    value,
    onSave,
    metricName,
    index,
    scaleFactor,
    isEditable,
    isPercentInput,
    style,
    scaling,
}) => {
    const [localValue, setLocalValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Format value for display
    const formatDisplayValue = (val) => {
        if (val === undefined || val === null || val === "") return "";

        // If focused, show raw number, but handle decimal separator logic if needed?
        // Actually, when focused, we want the user to see what they typed.
        // But usually we load formatted value initially.
        // If not focused, we show formatted with ' or %.

        // For initial load or external update:
        let numVal = parseFloat(val);

        if (isPercentInput) {
            // Stored as 0.142, display as 14.2%
            return (numVal * 100).toFixed(1) + "%";
        } else {
            // Stored as 21000, display as 21'000
            // If scaleFactor is applied externally, 'value' prop here is already scaled?
            // Let's check parent logic. 
            // Parent: value = (value / scaleFactor).toFixed(0); 
            // So 'value' passed here is ALREADY SCALED appropriate to view.

            let valStr = val.toString();
            let [intPart, decPart] = valStr.split(".");
            intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
            return decPart ? `${intPart}.${decPart}` : intPart;
        }
    };

    // Sync local value with prop when not focused
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(formatDisplayValue(value));
        }
    }, [value, isFocused, isPercentInput]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    const handleFocus = () => {
        setIsFocused(true);
        // On focus, strip formatting to make it easier to edit?
        // e.g. "21'000" -> "21000". "14.2" -> "14.2".
        // Or keep formatting and let user delete ' chars?
        // "decisions": "It is annoying to delete ' chars".
        // Let's strip ' on focus.

        // Current localValue might be formatted.
        let cleanVal = localValue.toString().replace(/['%]/g, "");
        // If it's percentage "14.2%", remove % if present (we didn't add it in input value though).
        setLocalValue(cleanVal);
    };

    const handleBlur = () => {
        setIsFocused(false);

        // Parse and save
        let val = localValue;
        if (val === "" || val === "-") {
            onSave(0, metricName, index, scaleFactor);
            return;
        }

        // Parse
        let parsed = val.replace(/['%]/g, "").replace(/,/g, ".");
        if (isNaN(parsed)) {
            // Revert to old value? or save 0?
            // setLocalValue(formatDisplayValue(value)); // will trigger via useEffect
            return;
        }

        let num = parseFloat(parsed);

        // If it is percent input, the user sees 14.2, we must store 0.142
        if (isPercentInput) {
            num = num / 100;
        }

        // If it is regular input, 'value' prop was scaled.
        // Parent logic: handleValuationChange takes raw value?
        // No, handleValuationChange updates Redux/State.
        // Parent does: handleValuationChange({ target: { value: num } }, ... scaleFactor)
        // The reducer or action presumably handles un-scaling? 
        // Wait. "scaleFactor" is passed to action.
        // Let's assume onSave signature mimics handleValuationChange logic needed.
        // We pass the NUMBER value to parent.

        onSave(num, metricName, index, scaleFactor);
    };

    return (
        <OutlinedInput
            disabled={!isEditable}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            type="text"
            value={localValue}
            size="small"
            className="custom-input-valuation-table"
            sx={{
                "& .MuiInputBase-input": {
                    color: (style?.color ? `${style.color} !important` : "inherit"),
                    fontStyle: style?.fontStyle || "normal",
                    fontWeight: style?.fontWeight || "normal",
                    opacity: 1, // ensure opacity is 1
                    "-webkit-text-fill-color": (style?.color ? `${style.color} !important` : "inherit"), // for disabled state in Safari/Chrome
                },
                "& .MuiInputBase-input.Mui-disabled": {
                    opacity: 1,
                    color: (style?.color ? `${style.color} !important` : "inherit"),
                    "-webkit-text-fill-color": (style?.color ? `${style.color} !important` : "inherit"),
                }
            }}
        />
    );
};

export default ValuationInputCell;
