import React, { useRef, useState } from "react";

function ChipInput() {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([
    "Person",
    "User",
    "Aligator",
    "Hero",
  ]);
  const [chips, setChips] = useState([]);
  const [removedSuggestions, setRemovedSuggestions] = useState([]);

  const inputRef = useRef();

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setChips([...chips, suggestion]);
    setSuggestions((prevSuggestions) =>
      prevSuggestions.filter((prevSuggestion) => prevSuggestion !== suggestion)
    );
    setRemovedSuggestions((prevRemoved) => [...prevRemoved, suggestion]);
    setInputValue("");
  };

  return (
    <div>
      <div>
        {chips.map((chip) => (
          <div>{chip}</div>
          // <Chip
          //   key={chip}
          //   containerClass="h-[26px]"
          //   label={chip}
          //   isDelete={true}
          //   color={chipColor}
          //   onDelete={() => handleDeleteChip(chip)}
          // />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>
      {!!suggestions.length && inputValue && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded shadow z-10">
          {!!suggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase())
          ).length &&
            inputValue && (
              <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10">
                {suggestions
                  .filter((suggestion) =>
                    suggestion.toLowerCase().includes(inputValue.toLowerCase())
                  )
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-200 cursor-pointer w-full text-left">
                      {suggestion}
                    </button>
                  ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default ChipInput;
