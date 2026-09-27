import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export interface TextTypeProps {
  text: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string | React.ReactNode;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
  as?: React.ElementType;
  onSentenceComplete?: (sentence: string, index: number) => void;
}

export const TextType: React.FC<TextTypeProps> = ({
  text,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseDuration = 1800,
  showCursor = true,
  cursorCharacter = "|",
  loop = true,
  className = "",
  cursorClassName = "",
  as: Component = "span",
  onSentenceComplete,
}) => {
  const texts = Array.isArray(text) ? text : [text];
  const [displayedText, setDisplayedText] = useState("");
  const cursorRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // GSAP blinking cursor effect
  useEffect(() => {
    if (!cursorRef.current || !showCursor) return;

    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    return () => {
      tween.kill();
    };
  }, [showCursor]);

  // Typewriter engine
  useEffect(() => {
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isCancelled = false;

    const tick = () => {
      if (isCancelled) return;
      const currentFullText = texts[currentTextIndex] || "";

      if (!isDeleting) {
        // Typing forward
        if (currentCharIndex <= currentFullText.length) {
          setDisplayedText(currentFullText.slice(0, currentCharIndex));
          currentCharIndex++;
          timeoutRef.current = setTimeout(tick, typingSpeed);
        } else {
          // Finished typing sentence
          if (onSentenceComplete) {
            onSentenceComplete(currentFullText, currentTextIndex);
          }
          if (texts.length > 1 || loop) {
            isDeleting = true;
            timeoutRef.current = setTimeout(tick, pauseDuration);
          }
        }
      } else {
        // Deleting backward
        if (currentCharIndex > 0) {
          currentCharIndex--;
          setDisplayedText(currentFullText.slice(0, currentCharIndex));
          timeoutRef.current = setTimeout(tick, deletingSpeed);
        } else {
          // Finished deleting
          isDeleting = false;
          currentTextIndex = (currentTextIndex + 1) % texts.length;
          if (!loop && currentTextIndex === 0) {
            return;
          }
          timeoutRef.current = setTimeout(tick, typingSpeed * 1.5);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, typingSpeed);

    return () => {
      isCancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [texts, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <Component className={`inline-flex items-center tracking-tight ${className}`}>
      <span>{displayedText}</span>
      {showCursor && (
        <span
          ref={cursorRef}
          aria-hidden="true"
          className={`inline-block ml-0.5 select-none font-mono text-[#ff5a36] ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      )}
    </Component>
  );
};
