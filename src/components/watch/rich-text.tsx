import { Fragment } from "react";

const URL_PATTERN = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]'’”])/g;

/**
 * Plain text from a YouTube description, as paragraphs with single line breaks kept and web
 * addresses made into links (opening in a new tab). Nothing in it is treated as markup.
 */
export function RichText({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="whitespace-pre-line break-words">
          {paragraph.split(URL_PATTERN).map((part, j) =>
            j % 2 === 1 ? (
              <a
                key={j}
                href={part}
                target="_blank"
                rel="noreferrer nofollow"
                className="font-medium text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                {part.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
