import { quicktype, InputData, jsonInputForTargetLanguage } from "quicktype-core";

/**
 * Thin wrapper around quicktype-core's TypeScript generation. quicktype-core
 * is a Node-oriented library; kept in its own module (rather than inlined in
 * the component) so the dynamic import in JsonToTypescriptTool.tsx has a
 * single boundary to lazy-load across.
 */
export async function jsonToTypeScript(json: string, typeName: string): Promise<string> {
  const jsonInput = jsonInputForTargetLanguage("typescript");
  await jsonInput.addSource({ name: typeName, samples: [json] });
  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const result = await quicktype({ inputData, lang: "typescript", rendererOptions: { "just-types": "true" } });
  return result.lines.join("\n");
}
