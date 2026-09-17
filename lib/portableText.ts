/** Plain-text <-> Portable Text for the public submit and edit forms */

type TextBlock = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: [];
  children: { _type: "span"; _key: string; text: string; marks: [] }[];
};

const key = () => Math.random().toString(36).slice(2, 10);

/** Each line of text becomes its own paragraph; blank lines are ignored */
export function textToBlocks(text: string | null | undefined): TextBlock[] | undefined {
  const paragraphs = (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return undefined;
  return paragraphs.map((p) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text: p, marks: [] }],
  }));
}

/** Paragraphs back to text, separated by a blank line so they read clearly in a textarea */
export function blocksToText(blocks: { children?: { text?: string }[] }[] | null | undefined): string {
  return (blocks ?? [])
    .map((block) => block.children?.map((c) => c.text ?? "").join("") ?? "")
    .filter(Boolean)
    .join("\n\n");
}
