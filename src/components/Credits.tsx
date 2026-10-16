import { photos } from "@/content/site";

export function Credits() {
  const list = Object.values(photos);
  return (
    <footer style={{ padding: "var(--section-gap) var(--margin) 32px", fontSize: "var(--step-small)" }}>
      <p style={{ margin: 0, maxWidth: "80ch" }}>
        Фотографии с&nbsp;Unsplash по&nbsp;лицензии Unsplash:{" "}
        {list.map((p, i) => (
          <span key={p.src}>
            <a href={p.page} rel="noopener">
              {p.author}
            </a>
            {i < list.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
    </footer>
  );
}
