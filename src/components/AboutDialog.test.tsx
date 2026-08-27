import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { cityStore } from "../state/city-store";
import { installTestModelContext } from "../webmcp/test-model-context";

describe("About presentation", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    // JSDOM has no native top layer; real focus containment/Escape are browser QA gates.
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); }
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function (this: HTMLDialogElement) { this.removeAttribute("open"); }
    });
    cityStore.reset();
    installTestModelContext();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(<App />));
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    container?.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    for (const [key, descriptor] of [["showModal", originalShowModal], ["close", originalClose]] as const) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, key, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, key);
    }
  });

  it("opens from desktop and mobile controls, closes, and leaves shared state and tools untouched", async () => {
    const snapshot = cityStore.getSnapshot();
    const tools = await document.modelContext!.getTools();
    const dialog = container.querySelector("dialog")!;
    const triggers = container.querySelectorAll<HTMLButtonElement>('[aria-controls="about-dialog"]');
    expect(triggers).toHaveLength(2);
    for (const trigger of triggers) {
      await act(async () => trigger.click());
      expect(dialog.open).toBe(true);
      expect(dialog.getAttribute("aria-labelledby")).toBe("about-title");
      expect(dialog.querySelector("h2")?.textContent).toBe("MySoci Agent City");
      await act(async () => dialog.querySelector<HTMLButtonElement>("button")!.click());
      expect(dialog.open).toBe(false);
      expect(cityStore.getSnapshot()).toBe(snapshot);
      expect(await document.modelContext!.getTools()).toEqual(tools);
    }
    expect(tools).toHaveLength(9);
  });

  it("cycles Tab only at dialog boundaries without changing shared state", async () => {
    const snapshot = cityStore.getSnapshot();
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-controls="about-dialog"]')!.click());
    const close = container.querySelector<HTMLButtonElement>("dialog button")!;
    const link = container.querySelector<HTMLAnchorElement>("dialog a")!;
    link.focus();
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    await act(async () => link.dispatchEvent(tab));
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
    const reverseTab = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    await act(async () => close.dispatchEvent(reverseTab));
    expect(reverseTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(link);
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    await act(async () => link.dispatchEvent(escape));
    expect(escape.defaultPrevented).toBe(false);
    expect(cityStore.getSnapshot()).toBe(snapshot);
  });

  it("includes the owner-provided icon, concise context and a safe public source link", () => {
    const dialog = container.querySelector("dialog")!;
    expect(dialog.querySelector("img")?.getAttribute("src")).toBe("/favicon.svg");
    expect(dialog.querySelector("img")?.getAttribute("alt")).toBe("");
    expect(container.querySelector(".brand__copy > span")?.textContent).toBe("A WebMCP prototype for MySoci’s future agent layer");
    expect(dialog.textContent).toContain("It is not the full MySoci product.");
    expect([...dialog.querySelectorAll("h3")].map(h => h.textContent)).toEqual([
      "What is it?", "Why WebMCP?", "Human stays in control", "The bigger MySoci vision"
    ]);
    const link = dialog.querySelector("a")!;
    expect(link.href).toBe("https://github.com/MySoci/mysoci-agent-city-webmcp");
    expect(link.rel).toBe("noopener noreferrer");
    expect(container.querySelector('a[href="#about"]')).toBeNull();
  });
});
