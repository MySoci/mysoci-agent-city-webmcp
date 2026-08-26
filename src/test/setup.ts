import { afterEach } from "vitest";

afterEach(() => {
  Reflect.deleteProperty(document, "modelContext");
});
