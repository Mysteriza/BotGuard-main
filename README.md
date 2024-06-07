# Minecraft Bodyguars (Mineflayer)
The updated version for the Minecraft Bodyguard Bot using Mineflayer. It's not stable but it's working 90% with several bugs :)

## How to use
Inside project directory:
```
npm install mineflayer mineflayer-pathfinder mineflayer-pvp
```

After installation, run:
```
node guard.js <host> <port> [<bot name>] [<password>]"
```
For example:
```
node guard.js localhost 51916 Guardian
```
You don't have to put password if you run it on singleplayer. Just make sure to enable "Open to LAN" inside your world to get the port number.
