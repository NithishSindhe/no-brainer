"use client";
import { Pencil } from "lucide-react"
import { useState } from "react"
import React from "react";

interface ChatTitleProps {
  chatId: string;
  selectCurrentChatId: (id:string)=>void;
  selectedChatId:string;
  title:string;
  changeTitle: (id: string,newTitle:string) => void;
}
export default React.memo(function ChatTitle({chatId,selectedChatId,title,changeTitle,selectCurrentChatId}:ChatTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const handleTitleSubmit = () => {
    if (newTitle.trim() && newTitle.trim() !== title) {//change the title only if it has changed
      changeTitle(chatId, newTitle.trim());
    }
    setIsEditing(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents any default form submission behavior
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewTitle(title); // Revert to the original title
      setIsEditing(false);
    }
  };

  return (
    <div
      key={chatId}
      onClick={() => selectCurrentChatId(chatId)}
      className={`group cursor-pointer block w-full text-left p-2 rounded-lg ${
        chatId === selectedChatId ? "bg-gray-800" : "hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            onBlur={handleTitleSubmit}// Save changes when input loses focus
            autoFocus
            className="text-sm w-full bg-transparent outline-none border-none p-0 m-0 text-gray-200 truncate"
          />
        ) : (
          <span className="truncate text-sm text-gray-200">{title}</span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="invisible group-hover:visible p-1 rounded-md hover:bg-gray-700 flex-shrink-0"
          aria-label={`Edit chat title: ${title}`}
        >
          <Pencil className="cursor-pointer h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
})
