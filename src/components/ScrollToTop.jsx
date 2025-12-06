"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 transform z-50 shadow-lg rounded-full h-12 w-12"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </Button>
  );
}
