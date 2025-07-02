// components/KeyboardLogger.tsx
import React, { useEffect, useRef } from 'react';

const TYPING_WINDOW_MS = 100; // The time limit for consecutive key presses

type Alphabet = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' |
              'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' |
              'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' |
              'v' | 'w' | 'x' | 'y' | 'z' |
              'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' |
              'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' |
              'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' |
              'V' | 'W' | 'X' | 'Y' | 'Z';
interface FunctionOnKeyPressProps {
  onShortcutTriggered: () => void;
  shortcuts: [Alphabet,Alphabet];
}

const FunctionOnKeyPress: React.FC<FunctionOnKeyPressProps> = ({onShortcutTriggered,shortcuts}) => {
  // useRef to store mutable values that don't trigger re-renders
  // and persist across renders, which is perfect for event handlers.
  const lastCharRef = useRef<string | null>(null);
  const lastKeyPressTimeRef = useRef<number | null>(null);
  console.log('FunctionOnKeyPress called ')
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement).tagName.toLowerCase();

      // Skip if user is typing in an input or textarea or has a contenteditable element focused
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }
      const currentTime = Date.now();
      const pressedKey = event.key.toLowerCase(); // Convert to lowercase for case-insensitivity

      // Get the values from refs
      const lastChar = lastCharRef.current;
      const lastKeyPressTime = lastKeyPressTimeRef.current;

      // --- Logic for 'nc' sequence ---
      if (pressedKey === shortcuts[0] && lastChar === shortcuts[1] && lastKeyPressTime !== null) {
        // Check if 'c' was pressed within the allowed time window after 'n'
        if (currentTime - lastKeyPressTime <= TYPING_WINDOW_MS) {
          console.log('trigged function')
          onShortcutTriggered()
          // Reset the state to prevent trigger if "n->c->c" after "n->c" from triggering multiple times
          // and to require a new 'n' to start a sequence.
          lastCharRef.current = null; 
          lastKeyPressTimeRef.current = null;
          return; // Exit early as we've processed a successful sequence
        }
      }

      // --- Update state for the current key press ---
      // This ensures that any key press updates the 'lastChar' and 'lastKeyPressTime'
      // which is crucial for checking the *next* key press.
      lastCharRef.current = pressedKey;
      lastKeyPressTimeRef.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <></>
  );
};

export default FunctionOnKeyPress;
