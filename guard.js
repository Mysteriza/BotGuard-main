/**
 * This bot example shows the basic usage of the mineflayer-pvp plugin for guarding a defined area from nearby mobs.
 */

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node guard.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;

const bot1 = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] + "_1" : "Guard_1",
  password: process.argv[5],
});

const bot2 = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] + "_2" : "Guard_2",
  password: process.argv[5],
});

const bot3 = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] + "_3" : "Guard_3",
  password: process.argv[5],
});

const bots = [bot1, bot2, bot3];

bots.forEach((bot) => {
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);
});

let guardPos = null;

// Assign the given location to be guarded
function guardArea(pos) {
  guardPos = pos;

  bots.forEach((bot) => {
    // We we are not currently in combat, move to the guard pos
    if (!bot.pvp.target) {
      moveToGuardPos(bot);
    }
  });
}

// Cancel all pathfinder and combat
function stopGuarding() {
  guardPos = null;
  bots.forEach((bot) => {
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  });
}

// Pathfinder to the guard position
function moveToGuardPos(bot) {
  bot.pathfinder.setMovements(new Movements(bot));
  bot.pathfinder.setGoal(
    new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z)
  );
}

// Function to check if there are no hostile entities around any bot
function noHostileEntitiesAround() {
  for (let bot of bots) {
    const filter = (entity) =>
      entity.type === "hostile" && // Check if entity is hostile
      entity.position.distanceTo(bot.entity.position) < 15 && // Check if distance is less than 15 blocks
      entity.displayName !== "Armor Stand"; // Ignore Armor Stand

    if (bot.nearestEntity(filter)) {
      return false; // Hostile entity found
    }
  }
  return true; // No hostile entities found around any bot
}

// Event listener untuk tick fisika
bots.forEach((bot) => {
  bot.on("physicsTick", () => {
    if (!guardPos) return; // Tidak melakukan apa-apa jika bot tidak menjaga posisi tertentu

    // Hanya mencari mob dalam jarak 15 blok
    const filter = (e) =>
      e.type === "hostile" && // Memeriksa apakah entity adalah hostile
      e.position.distanceTo(bot.entity.position) < 5 && // Memeriksa apakah jaraknya kurang dari 15 blok
      e.displayName !== "Armor Stand"; // Mengabaikan Armor Stand (Mojang mengklasifikasikan armor stand sebagai mob)

    // Mendapatkan entity terdekat yang sesuai dengan filter
    const entity = bot.nearestEntity(filter);
    if (entity) {
      // Memulai serangan
      bot.pvp.attack(entity);
    } else {
      // Jika tidak ada musuh, cek apakah semua bot sudah selesai membunuh musuh
      if (noHostileEntitiesAround()) {
        // Kembali ke dekat pemain "Mysteriza"
        bots.forEach((bot) => {
          if (bot.players["Mysteriza"]) {
            bot.pathfinder.setMovements(new Movements(bot));
            bot.pathfinder.setGoal(
              new goals.GoalFollow(bot.players["Mysteriza"].entity, 4), // Set a follow goal with a distance of 3 blocks
              true // Enable auto pathfinding
            );
          }
        });
      }
    }
  });
});

// Listen for player commands
bots.forEach((bot) => {
  bot.on("chat", (username, message) => {
    // Guard the location the player is standing
    if (message === "guard") {
      const player = bot.players[username];

      if (!player) {
        bot.chat("I can't see you.");
        return;
      }

      bot.chat("I will guard that location.");
      guardArea(player.entity.position);
    }

    // Stop guarding
    if (message === "stop") {
      bot.chat("I will no longer guard this area.");
      stopGuarding();
    }

    // Follow and protect the player
    if (message === "fnp") {
      const player = bot.players[username];

      if (!player) {
        bot.chat("I can't see you.");
        return;
      }

      bot.chat("I will follow and protect you.");
      followAndProtect(player, bot);
    }
  });
});
