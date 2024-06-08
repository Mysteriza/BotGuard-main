const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node guard.js <host> <port> [<name>]");
  process.exit(1);
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] || "Guard",
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

let guardPos = null;

function equipBot() {
  const diamondSword = bot.inventory
    .items()
    .find((i) => i.name.includes("diamond_sword"));
  if (diamondSword) {
    bot.equip(diamondSword, "hand");
  } else {
    bot.chat(`/give ${bot.username} diamond_sword`);
  }
}

bot.on("spawn", () => {
  const player = bot.players["Mysteriza"];
  if (player && player.entity) {
    bot.chat(`/teleport ${bot.username} Mysteriza`);
    setTimeout(() => {
      bot.chat("guard");
    }, 5000);
  }
  equipBot();
});

function guardArea(pos) {
  guardPos = pos;
  if (!bot.pvp.target) {
    moveToGuardPos();
  }
}

function stopGuarding() {
  guardPos = null;
  bot.pvp.stop();
  bot.pathfinder.setGoal(null);
}

function moveToGuardPos() {
  bot.pathfinder.setMovements(new Movements(bot));
  bot.pathfinder.setGoal(
    new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z)
  );
}

function noHostileEntitiesAround() {
  const filter = (entity) =>
    entity.type === "hostile" &&
    entity.position.distanceTo(bot.entity.position) < 15 &&
    entity.displayName !== "Armor Stand";

  return !bot.nearestEntity(filter);
}

bot.on("physicsTick", () => {
  if (!guardPos) return;

  const filter = (e) =>
    e.type === "hostile" &&
    e.position.distanceTo(bot.entity.position) < 15 &&
    e.displayName !== "Armor Stand";

  const entity = bot.nearestEntity(filter);
  if (entity) {
    bot.pvp.attack(entity);
  } else if (noHostileEntitiesAround()) {
    const player = bot.players["Mysteriza"];
    if (player && player.entity) {
      bot.pathfinder.setMovements(new Movements(bot));
      bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 3), true);
    }
  }
});

bot.on("chat", (username, message) => {
  if (message === "guard") {
    const player = bot.players[username];
    if (!player) {
      bot.chat("I can't see you.");
      return;
    }
    bot.chat("I will protect you, baby!");
    guardArea(player.entity.position);
  } else if (message === "stop") {
    bot.chat("OK then... See you!");
    stopGuarding();
  }
});

bot.on("error", (err) => {
  console.error(`Bot error: ${err}`);
});
