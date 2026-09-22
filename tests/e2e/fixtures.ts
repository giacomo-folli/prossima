import { expect, test as base } from "@playwright/test";

export const testOwner = {
	id: "11111111-1111-4111-8111-111111111111",
	email: "owner-a@prossima.test",
	password: "Prossima-test-1",
	displayName: "Owner A",
} as const;

export const test = base.extend<{ owner: typeof testOwner }>({
	owner: [testOwner, { option: true }],
});

export { expect };
