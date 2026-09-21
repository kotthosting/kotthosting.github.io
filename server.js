import express from "express";
import archiver from "archiver";
import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

function safeName(value) {
  return String(value || "MyPlugin").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "MyPlugin";
}

function yamlQuote(value) {
  return `"${String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function makePluginYml(p) {
  const lines = [
    `name: ${safeName(p.name)}`,
    `version: ${yamlQuote(p.version || "1.0.0")}`,
    `main: ${p.mainClass || "com.example.plugin.Main"}`,
    `api-version: '${p.apiVersion || "1.21"}'`,
    `author: ${yamlQuote(p.author || "Plugin Builder")}`,
    `description: ${yamlQuote(p.description || "Generated Minecraft plugin")}`
  ];

  const commands = Array.isArray(p.commands) ? p.commands.filter(Boolean) : [];
  if (commands.length) {
    lines.push("commands:");
    for (const command of commands) {
      const name = String(command).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
      if (!name) continue;
      lines.push(`  ${name}:`);
      lines.push(`    description: Generated command`);
    }
  }

  return lines.join("\n") + "\n";
}

app.post("/api/build", async (req, res) => {
  const p = req.body || {};
  const pluginName = safeName(p.name);
  const mainClass = p.mainClass || "com.example.plugin.Main";
  const classPath = mainClass.replace(/\./g, "/") + ".java";

  const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), "mc-plugin-"));
  const src = path.join(tmp, "src", "main", "java", path.dirname(classPath));
  const resources = path.join(tmp, "src", "main", "resources");
  await fs.promises.mkdir(src, { recursive: true });
  await fs.promises.mkdir(resources, { recursive: true });

  const javaSource = p.java || `package ${mainClass.split(".").slice(0, -1).join(".")};

import org.bukkit.plugin.java.JavaPlugin;

public class ${mainClass.split(".").pop()} extends JavaPlugin {
    @Override
    public void onEnable() {
        getLogger().info("${pluginName} enabled!");
    }

    @Override
    public void onDisable() {
        getLogger().info("${pluginName} disabled!");
    }
}
`;

  await fs.promises.writeFile(path.join(tmp, "src", "main", "java", classPath), javaSource);
  await fs.promises.writeFile(path.join(resources, "plugin.yml"), makePluginYml({ ...p, name: pluginName, mainClass }));

  // Build a self-contained source JAR when no Java/Paper build tool is available.
  // This keeps the demo deployable anywhere; the UI clearly labels it as source/demo.
  const out = path.join(tmp, `${pluginName}.jar`);
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(out);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.file(path.join(tmp, "src", "main", "java", classPath), { name: `src/main/java/${classPath}` });
    archive.file(path.join(resources, "plugin.yml"), { name: "plugin.yml" });
    archive.append(JSON.stringify({
      generatedBy: "Minecraft Plugin Builder",
      note: "This starter JAR contains source and plugin.yml. Compile it with a Paper API build setup to make a server-ready plugin JAR."
    }, null, 2), { name: "builder-info.json" });
    archive.finalize();
  });

  res.download(out, `${pluginName}.jar`, async () => {
    fs.promises.rm(tmp, { recursive: true, force: true }).catch(() => {});
  });
});

app.listen(PORT, () => {
  console.log(`Minecraft Plugin Builder running at http://localhost:${PORT}`);
});
