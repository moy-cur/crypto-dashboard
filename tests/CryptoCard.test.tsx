import { render, screen } from "@testing-library/react";
import CryptoCard from "../components/CryptoCard";
import { describe, vi, it, expect } from "vitest";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));
vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "",
    },
  },
}));

const data = {
  usd: "3123.45",
  btc: "0.12345678",
};

describe("CryptoCard", () => {
  it("renders coin name and prices", () => {
    render(<CryptoCard id="ETH" data={data} />);
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("$3123.45")).toBeInTheDocument();
    expect(screen.getByText("0.12345678")).toBeInTheDocument();
  });

  it("handles missing data correctly", () => {
    render(<CryptoCard id="DOGE" data={{}} />);
    expect(screen.getByText("DOGE")).toBeInTheDocument();
    expect(screen.getAllByText("...").length).toBe(2);
  });
});