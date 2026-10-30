import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
export type Locale = "en" | "fr";
export type Page = "home" | "products" | "solutions" | "resources" | "about";
export const Language = createContext<Locale>("en");
export const useT = () => {
  const lang = useContext(Language);
  return (en: string, fr: string) => (lang === "fr" ? fr : en);
};
export const useLanguage = () => useContext(Language);
export const WA = "https://wa.me/8613857409664";
export const pagePath = (page: Page, lang: Locale) =>
  `${lang === "fr" ? "/fr" : ""}/${page === "home" ? "" : page + ".html"}`;
export const Arrow = ({ left = false }: { left?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={left ? { transform: "rotate(180deg)" } : {}}
  >
    <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
export const Close = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
export const WhatsApp = () => (
  <svg
    viewBox="0 0 32 32"
    width="26"
    height="26"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16.04 3A12.8 12.8 0 0 0 4.95 22.2L3.2 28.6l6.56-1.72A12.8 12.8 0 1 0 16.04 3Zm0 23.34a10.5 10.5 0 0 1-5.36-1.47l-.38-.22-3.9 1.02 1.04-3.8-.25-.4A10.57 10.57 0 1 1 16.04 26.34Zm5.8-7.92c-.32-.16-1.88-.93-2.17-1.04-.29-.1-.5-.16-.71.16-.22.32-.82 1.04-1 1.26-.19.21-.37.24-.69.08-.31-.16-1.34-.49-2.56-1.58-.95-.85-1.6-1.9-1.79-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.31.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.72-.98-2.36-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.53 1.81.68.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
  </svg>
);
export function Contact({
  children,
  className = "button",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <a
      className={className}
      href={WA}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children || t("Chat on WhatsApp", "Parlons sur WhatsApp")}
      <Arrow />
    </a>
  );
}
export function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <p className="eyebrow">
      <span>{number}</span>
      {children}
    </p>
  );
}
export function Gallery({
  images,
  label,
}: {
  images: string[];
  label: string;
}) {
  const t = useT(),
    ref = useRef<HTMLDivElement>(null),
    [index, setIndex] = useState(0);
  function go(i: number) {
    ref.current?.children[i]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
  return (
    <div className="gallery">
      <div className="gallery-frame">
      <button className="gallery-side-button gallery-side-prev" disabled={index === 0} onClick={() => go(index - 1)} aria-label={t("Previous image", "Image précédente")}><Arrow left /></button>
      <div
        className="gallery-track"
        ref={ref}
        onScroll={() => {
          const e = ref.current;
          if (e) setIndex(Math.round(e.scrollLeft / (e.clientWidth + 12)));
        }}
      >
        {images.map((src, i) => (
          <figure key={src}>
            <img
              src={src}
              alt={`${label} ${i + 1}`}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
      <button className="gallery-side-button gallery-side-next" disabled={index >= images.length - 1} onClick={() => go(index + 1)} aria-label={t("Next image", "Image suivante")}><Arrow /></button>
      </div>
      <div className="gallery-controls">
        <span>
          {String(index + 1).padStart(2, "0")}{" "}
          <span className="muted">
            / {String(images.length).padStart(2, "0")}
          </span>
        </span>
      </div>
    </div>
  );
}
