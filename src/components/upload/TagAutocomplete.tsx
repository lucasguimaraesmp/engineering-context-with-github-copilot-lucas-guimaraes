"use client";

import { useId, useState } from "react";

type TagAutocompleteProps = {
  availableTags: readonly string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TagAutocomplete({ availableTags, label, value, onChange }: TagAutocompleteProps) {
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastCommaIndex = value.lastIndexOf(",");
  const currentToken = value.slice(lastCommaIndex + 1).trim();
  const normalizedToken = currentToken.toLowerCase();
  const selectedTags = value
    .slice(0, lastCommaIndex < 0 ? 0 : lastCommaIndex)
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const suggestions = normalizedToken
    ? availableTags.filter((tag) => {
        const normalizedTag = tag.toLowerCase();
        return normalizedTag.startsWith(normalizedToken) && !selectedTags.includes(normalizedTag);
      })
    : [];
  const showSuggestions = isOpen && suggestions.length > 0;
  const activeOptionId = showSuggestions && activeIndex !== null && activeIndex < suggestions.length
    ? `${listboxId}-option-${activeIndex}`
    : undefined;

  function selectTag(tag: string) {
    const prefix = lastCommaIndex < 0 ? "" : value.slice(0, lastCommaIndex + 1);
    const spacing = lastCommaIndex < 0 ? "" : value.slice(lastCommaIndex + 1).match(/^\s*/)?.[0] ?? " ";
    onChange(`${prefix}${spacing}${tag}`);
    setIsOpen(false);
    setActiveIndex(null);
  }

  function closeSuggestions() {
    setIsOpen(false);
    setActiveIndex(null);
  }

  return (
    <div className="tag-autocomplete">
      <label htmlFor={inputId}>{label}</label>
      <input
        aria-autocomplete="list"
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-activedescendant={activeOptionId}
        aria-expanded={showSuggestions}
        autoComplete="off"
        id={inputId}
        name="tags"
        onChange={(event) => {
          onChange(event.currentTarget.value);
          setIsOpen(true);
          setActiveIndex(null);
        }}
        onBlur={closeSuggestions}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && suggestions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) => current === null ? 0 : (current + 1) % suggestions.length);
          } else if (event.key === "ArrowUp" && suggestions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) => current === null
              ? suggestions.length - 1
              : (current - 1 + suggestions.length) % suggestions.length);
          } else if (event.key === "Enter" && showSuggestions && activeIndex !== null) {
            event.preventDefault();
            selectTag(suggestions[activeIndex]);
          } else if (event.key === "Escape") {
            closeSuggestions();
          } else if (event.key === "Tab") {
            closeSuggestions();
          }
        }}
        placeholder="wedding, portrait, outdoor..."
        role="combobox"
        type="text"
        value={value}
      />
      {showSuggestions ? (
        <div className="tag-suggestions" id={listboxId} role="listbox">
          {suggestions.map((tag, index) => (
            <div
              aria-selected={index === activeIndex}
              className="tag-suggestion"
              id={`${listboxId}-option-${index}`}
              key={tag}
              onClick={() => selectTag(tag)}
              onMouseDown={(event) => event.preventDefault()}
              role="option"
            >
              {tag}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}