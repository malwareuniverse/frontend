"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  onToggle?: (isOpen: boolean) => void;
}

export function Accordion({ title, children, onToggle }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newIsOpenState = !isOpen;
    setIsOpen(newIsOpenState);
    onToggle?.(newIsOpenState);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className="focus-visible:ring-opacity-75 flex w-full items-center justify-between px-4 py-3 text-left font-medium text-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 sm:px-6"
      >
        <span className="text-lg">{title}</span>
        <ChevronDown
          className={`h-6 w-6 transform text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-200/60 px-4 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
