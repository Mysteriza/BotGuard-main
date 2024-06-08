# Minecraft Bodyguard (Mineflayer)
The updated version for the Minecraft Bodyguard Bot using Mineflayer. It's not stable but it's working 80% with several bugs. Please somebody fix it for me :)

Works on **1.20.1 Fabric** version. I don't know about other version. Probably not working, hehe.

## Features:
- Auto respawn
- Auto teleport to your location after respawn
- Auto equip diamond sword
- Auto protecting you (delay 5 seconds after teleport, sometimes it's not working.

Make sure you enabled **allow cheats** to get diamond sword for the bot.

## Bugs
- Can't enter through door (it will destroy the door or any blocks)
- Sometimes bot get disconnected
- Sometimes bot can't teleport

## How to use
Inside project directory:
```
npm install mineflayer mineflayer-pathfinder mineflayer-pvp
```

After installation, run:
```
node guard.js <host> <port> [<bot name>]
```
For example:
```
node guard.js localhost 51916 Guardian
```
Just make sure to enable "Open to LAN" inside your world to get the port number.
