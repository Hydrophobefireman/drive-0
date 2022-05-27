import {Renderable, useEffect, useState} from "@hydrophobefireman/ui-lib";

interface PaginateProps<T> {
  atOnce: number;
  buttonClass?: string;
  buttonWrapperClass?: string;
  containerClass?: string | string[];
  dualButtons?: boolean;
  items: T[];
  nextButtonClass?: string | string[];
  nextText?: string;
  previousButtonClass?: string | string[];
  previousText?: string;
  render(item: T, i: number): Renderable;
  listParentClass?: string;
}
export function Paginate<T>({
  atOnce,
  buttonClass,
  buttonWrapperClass,
  containerClass,
  dualButtons,
  items,
  nextButtonClass,
  nextText,
  previousButtonClass,
  previousText,
  listParentClass,
  render,
}: PaginateProps<T>) {
  const itemLength = items.length;
  const [index, setIndex] = useState(0);
  const endIndex = index + atOnce;
  const hasPrev = index !== 0;
  const hasMore = endIndex < itemLength;
  useEffect(() => setIndex(0), [items]);
  const list = useCurrentItems(items, render, index, endIndex);
  function next() {
    setIndex(index + atOnce);
  }
  function prev() {
    setIndex(Math.max(0, index - atOnce));
  }
  const buttons = list && (
    <div class={buttonWrapperClass}>
      <button
        class={previousButtonClass || buttonClass}
        onClick={prev}
        disabled={!hasPrev}
        style={{
          opacity: hasPrev ? "1" : "0.5",
          transition: "var(--kit-transition)",
        }}
      >
        {previousText || "Previous"}
      </button>

      <button
        class={nextButtonClass || buttonClass}
        onClick={next}
        disabled={!hasMore}
        style={{
          opacity: hasMore ? "1" : "0.5",
          transition: "var(--kit-transition)",
        }}
      >
        {nextText || "Next"}
      </button>
    </div>
  );

  return (
    <div class={containerClass}>
      {buttons}
      <div class={listParentClass}>{list}</div>
      {dualButtons && buttons}
    </div>
  );
}

function useCurrentItems(
  all: any[],
  render: (a: any, i: number) => Renderable,
  currentIndex: number,
  endndex: number
) {
  function getItems() {
    const items = [];
    for (let i = currentIndex; i < Math.min(endndex, all.length); i++) {
      items.push(render(all[i], i));
    }
    return items;
  }
  function updateItems() {
    setItems(getItems);
  }
  const [items, setItems] = useState(null);
  useEffect(updateItems, [all, render, currentIndex, endndex]);
  return items;
}
