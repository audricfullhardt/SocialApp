import { cn } from "../utils";

describe("cn (utility)", () => {
  it("devrait combiner des classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("devrait gérer les valeurs conditionnelles", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("devrait gérer undefined et null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("devrait fusionner les classes Tailwind en conflit", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("devrait gérer les classes Tailwind de couleur", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("devrait retourner une chaîne vide sans arguments", () => {
    expect(cn()).toBe("");
  });

  it("devrait gérer les objets clsx", () => {
    expect(cn({ "bg-red-500": true, "bg-blue-500": false })).toBe(
      "bg-red-500",
    );
  });

  it("devrait gérer les tableaux", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });
});
