```javascript
let serverOnline = true;

function addConsole(message) {
  const consoleBox = document.getElementById("console");

  const line = document.createElement("p");
  const time = new Date().toLocaleTimeString("sv-SE");

  line.innerHTML = `<span>[${time}]</span> ${message}`;

  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function startServer() {
  if (serverOnline) {
    addConsole("[Server] Servern är redan igång.");
    return;
  }

  serverOnline = true;

  document.getElementById("statusText").textContent = "ONLINE";

  addConsole("[Server] Startar Minecraft-server...");
  setTimeout(() => {
    addConsole("[Server] Minecraft-servern är online!");
  }, 1200);
}

function stopServer() {
  if (!serverOnline) {
    addConsole("[Server] Servern är redan stoppad.");
    return;
  }

  serverOnline = false;

  document.getElementById("statusText").textContent = "OFFLINE";

  addConsole("[Server] Stoppar Minecraft-server...");
  setTimeout(() => {
    addConsole("[Server] Servern har stoppats.");
  }, 700);
}

function restartServer() {
  addConsole("[Server] Startar om servern...");

  serverOnline = false;
  document.getElementById("statusText").textContent = "OFFLINE";

  setTimeout(() => {
    serverOnline = true;
    document.getElementById("statusText").textContent = "ONLINE";
    addConsole("[Server] Servern startades om!");
  }, 2000);
}

function sendCommand() {
  const input = document.getElementById("commandInput");
  const command = input.value.trim();

  if (!command) return;

  addConsole(`<span>></span> ${command}`);
  input.value = "";

  if (command === "list") {
    addConsole("There are 7 of a max of 50 players online.");
  } else if (command === "stop") {
    stopServer();
  } else {
    addConsole(`[Server] Kommando skickat: ${command}`);
  }
}

function commandEnter(event) {
  if (event.key === "Enter") {
    sendCommand();
  }
}

function clearConsole() {
  document.getElementById("console").innerHTML = "";
}

// Simulerar serverstatistik
setInterval(() => {
  if (!serverOnline) return;

  const cpu = Math.floor(Math.random() * 35) + 15;
  const ram = (Math.random() * 1.2 + 2.8).toFixed(1);

  document.getElementById("cpu").textContent = cpu + "%";
  document.getElementById("cpuBar").style.width = cpu + "%";

  document.getElementById("ram").textContent = ram + " GB";
  document.getElementById("ramBar").style.width =
    Math.min((ram / 6) * 100, 100) + "%";
}, 3000);
```
