import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "./Logo";

describe("Logo", () => {
  it("el símbolo se anuncia como Nexabit", () => {
    render(<Logo conNombre={false} />);
    expect(screen.getByRole("img", { name: "Nexabit" })).toBeInTheDocument();
  });

  it("con nombre muestra Nexa + bit", () => {
    const { container } = render(<Logo />);
    expect(container).toHaveTextContent("Nexabit");
  });

  it("dos logos en la misma página no comparten ids de degradado", () => {
    const { container } = render(
      <>
        <Logo />
        <Logo />
      </>,
    );
    const ids = [...container.querySelectorAll("linearGradient")].map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
