import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VehicleCard } from "@/components/vehicle-card";
import { VEHICLE } from "@/lib/vehicle";

describe("VehicleCard", () => {
  it("renders the vehicle Arabic title", () => {
    render(<VehicleCard />);
    expect(screen.getByText(VEHICLE.arabic.title)).toBeInTheDocument();
  });

  it("renders the Arabic subtitle", () => {
    render(<VehicleCard />);
    expect(screen.getByText(VEHICLE.arabic.subtitle)).toBeInTheDocument();
  });

  it("displays the VIN number", () => {
    render(<VehicleCard />);
    expect(screen.getByText(VEHICLE.vin)).toBeInTheDocument();
  });

  it("shows engine spec in Arabic label", () => {
    render(<VehicleCard />);
    expect(screen.getByText("المحرك")).toBeInTheDocument();
    expect(screen.getByText("6.0L V8 FHEV")).toBeInTheDocument();
  });

  it("shows hybrid system label", () => {
    render(<VehicleCard />);
    expect(screen.getByText("النظام")).toBeInTheDocument();
    expect(screen.getByText("2-Mode Hybrid")).toBeInTheDocument();
  });

  it("shows drivetrain spec", () => {
    render(<VehicleCard />);
    expect(screen.getByText("الدفع")).toBeInTheDocument();
    expect(screen.getByText("4WD — 2010")).toBeInTheDocument();
  });
});
