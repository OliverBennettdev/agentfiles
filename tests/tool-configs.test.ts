import { beforeAll, describe, expect, mock, test } from "bun:test";

let activeVariant = "";
let activeExtensionId = "";

mock.module("os", () => ({
	homedir: () => "/home/agentfiles-test",
	platform: () => "linux",
}));

mock.module("fs", () => ({
	existsSync: (path: unknown) => {
		const normalized = String(path).replaceAll("\\", "/");
		return normalized.endsWith(
			`/${activeVariant}/User/globalStorage/${activeExtensionId}`,
		);
	},
	readdirSync: () => [],
}));

let toolConfigs: typeof import("../src/tool-configs");

beforeAll(async () => {
	toolConfigs = await import("../src/tool-configs");
});

const VSCODE_VARIANTS = [
	"Code",
	"Code - Insiders",
	"Cursor",
	"Cursor Nightly",
	"VSCodium",
	"Windsurf",
	"Windsurf Next",
	"Trae",
	"Void",
	"Positron",
] as const;

const VSCODE_EXTENSION_TOOLS = [
	{ id: "cline", extensionId: "saoudrizwan.claude-dev" },
	{ id: "roo-code", extensionId: "RooVeterinaryInc.roo-cline" },
] as const;

describe("VS Code fork extension storage detection", () => {
	for (const variant of VSCODE_VARIANTS) {
		test(`detects extension-backed tools in ${variant}`, () => {
			for (const tool of VSCODE_EXTENSION_TOOLS) {
				activeVariant = variant;
				activeExtensionId = tool.extensionId;
				toolConfigs.clearInstallCache();

				const config = toolConfigs.TOOL_CONFIGS.find(({ id }) => id === tool.id);
				expect(config).toBeDefined();
				expect(config?.isInstalled()).toBe(true);
			}
		});
	}
});
