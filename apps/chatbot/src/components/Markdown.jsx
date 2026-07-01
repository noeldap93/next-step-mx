import React from 'react';
import ReactMarkdown from 'react-markdown';

// react-markdown is XSS-safe by default (renders React elements, never
// innerHTML). We disable images so the LLM can't embed graphics into the
// chat flow, and force links to open in a new tab.
const COMPONENTS = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noreferrer noopener" />
  ),
  img: () => null,
};

const DISALLOWED = ['img'];

export default function Markdown({ children, className }) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown disallowedElements={DISALLOWED} components={COMPONENTS}>
        {String(children)}
      </ReactMarkdown>
    </div>
  );
}
