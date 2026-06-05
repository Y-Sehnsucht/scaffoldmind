import { useEffect, useState } from 'react';

export function TypingAnimation({ text, className = '', speed = 48 }) {
  const [visible, setVisible] = useState('');

  useEffect(() => {
    setVisible('');
    if (!text) return undefined;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={`typing-animation ${className}`}>
      {visible}
    </span>
  );
}
