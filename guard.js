const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node guard.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] || "Guard",
  password: process.argv[5],
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

let guardPos = null;

// Function to equip the bot with a diamond sword
function equipBot() {
  const diamondSword = bot.inventory
    .items()
    .find((i) => i.name.includes("diamond_sword"));
  if (diamondSword) {
    bot.equip(diamondSword, "hand");
  } else {
    // Give the item to the bot if not found in inventory
    bot.chat(`/give ${bot.username} diamond_sword`);
  }
}

// Event listener for when the bot spawns
// Event listener for when the bot spawns
bot.on("spawn", () => {
  // Teleport the bot to your position when it spawns
  const player = bot.players["Mysteriza"]; // Ganti "your_username" dengan username Anda
  if (player && player.entity) {
    bot.chat(`/teleport ${bot.username} Mysteriza`);

    // Tambahkan delay 5 detik sebelum menjalankan fungsi guard
    setTimeout(() => {
      bot.chat(`guard`);
    }, 5000); // Delay 5 detik
  }
  equipBot();
});

// Assign the given location to be guarded
function guardArea(pos) {
  guardPos = pos;

  // If we are not currently in combat, move to the guard pos
  if (!bot.pvp.target) {
    moveToGuardPos();
  }
}

// Cancel all pathfinder and combat
function stopGuarding() {
  guardPos = null;
  bot.pvp.stop();
  bot.pathfinder.setGoal(null);
}

// Pathfinder to the guard position
function moveToGuardPos() {
  bot.pathfinder.setMovements(new Movements(bot));
  bot.pathfinder.setGoal(
    new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z)
  );
}

// Function to check if there are no hostile entities around the bot
function noHostileEntitiesAround() {
  const filter = (entity) =>
    entity.type === "hostile" && // Check if entity is hostile
    entity.position.distanceTo(bot.entity.position) < 15 && // Check if distance is less than 15 blocks
    entity.displayName !== "Armor Stand"; // Ignore Armor Stand

  return !bot.nearestEntity(filter); // No hostile entities found
}

// Event listener
bot.on("physicsTick", () => {
  if (!guardPos) return; // Does nothing if the bot does not maintain a certain position

  // Only search for hostile mobs within 15 blocks
  const filter = (e) =>
    e.type === "hostile" && // Checks whether the entity is hostile
    e.position.distanceTo(bot.entity.position) < 15 && // Checks if the distance is less than 15 blocks
    e.displayName !== "Armor Stand"; // Ignores Armor Stands (Mojang classifies armor stand as mobs)

  // Gets the closest entity that matches the filter
  const entity = bot.nearestEntity(filter);
  if (entity) {
    // Initiating an attack
    bot.pvp.attack(entity);
  } else {
    // If there are no enemies, check whether all bots have finished killing enemies
    if (noHostileEntitiesAround()) {
      // Back near the "Mysteriza" player, you can change this username to your username
      if (bot.players["Mysteriza"] && bot.players["Mysteriza"].entity) {
        bot.pathfinder.setMovements(new Movements(bot));
        bot.pathfinder.setGoal(
          new goals.GoalFollow(bot.players["Mysteriza"].entity, 3), // Set a follow goal with a distance of 3 blocks
          true // Enable auto pathfinding
        );
      }
    }
  }
});

// Listen for player commands
bot.on("chat", (username, message) => {
  // Guard the location the player is standing
  if (message === "guard") {
    const player = bot.players[username];

    if (!player) {
      bot.chat("I can't see you.");
      return;
    }

    bot.chat("I will protect you, baby!.");
    guardArea(player.entity.position);
  }

  // Stop guarding
  if (message === "stop") {
    bot.chat("OK then... See you!");
    stopGuarding();
  }
});

// Menambahkan handler untuk event 'error'
bot.on("error", (err) => {
  console.error(`Bot error: ${err}`);
});
