import React from 'react';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';

export default function Theme({ isDarkTheme, toggleTheme }) {
  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="bg-background text-foreground px-4 py-2"
      title={isDarkTheme ? "Light Theme" : "Dark Theme"}
    >
      {isDarkTheme ? (
        <Sun size={28} color="#ff9933" strokeWidth={1.75} />
      ) : (
        <Moon size={28} color="#0de343" strokeWidth={1.75} />
      )}
    </Button>
  );
}
