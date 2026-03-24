// Launcher script: deletes ELECTRON_RUN_AS_NODE before spawning Electron
// This is needed because Claude Code sets ELECTRON_RUN_AS_NODE=1 in its environment,
// which causes Electron to run as plain Node.js instead of as an Electron app.
const { spawn } = require("child_process");
const path = require("path");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronExe = path.join(__dirname, "node_modules", "electron", "dist", "electron.exe");

const proc = spawn(electronExe, ["."], {
  env,
  stdio: "inherit",
  cwd: __dirname,
});

proc.on("exit", (code) => process.exit(code || 0));
