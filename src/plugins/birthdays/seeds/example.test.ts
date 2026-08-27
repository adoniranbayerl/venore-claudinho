import { beforeEach, describe, expect, it, vi } from "vitest";

const listBirthdays = vi.fn();
const createBirthday = vi.fn();

vi.mock("../features/list-birthdays/service", () => ({ listBirthdays: (...args: unknown[]) => listBirthdays(...args) }));
vi.mock("../features/create-birthday/service", () => ({
  createBirthday: (...args: unknown[]) => createBirthday(...args),
}));

const EXAMPLE_NAMES = [
  "Ana Beatriz Lima",
  "Carlos Eduardo Ramos",
  "Daniela Figueiredo",
  "Eduardo Nunes",
  "Fernanda Souza",
  "Gustavo Pereira",
];

describe("seedBirthdaysExample", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createBirthday.mockResolvedValue({ success: true, data: {} });
  });

  it("creates the full example set against an empty store", async () => {
    listBirthdays.mockResolvedValue({ success: true, data: [] });

    const { seedBirthdaysExample } = await import("./example");
    const result = await seedBirthdaysExample();

    expect(result).toEqual({ success: true, data: undefined });
    expect(createBirthday).toHaveBeenCalledTimes(EXAMPLE_NAMES.length);
  });

  it("is idempotent — a second run with the rows already present creates nothing", async () => {
    listBirthdays.mockResolvedValue({ success: true, data: EXAMPLE_NAMES.map((fullName) => ({ fullName })) });

    const { seedBirthdaysExample } = await import("./example");
    const result = await seedBirthdaysExample();

    expect(result).toEqual({ success: true, data: undefined });
    expect(createBirthday).not.toHaveBeenCalled();
  });

  it("stops and propagates the error if a create fails", async () => {
    listBirthdays.mockResolvedValue({ success: true, data: [] });
    createBirthday.mockResolvedValueOnce({ success: false, error: { code: "boom", message: "kaboom" } });

    const { seedBirthdaysExample } = await import("./example");
    const result = await seedBirthdaysExample();

    expect(result).toEqual({ success: false, error: { code: "boom", message: "kaboom" } });
    expect(createBirthday).toHaveBeenCalledTimes(1);
  });
});
