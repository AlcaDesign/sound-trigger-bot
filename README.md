# Sound Trigger Bot

A Node.js bot that will listen to Twitch chat for commands to play sound effects
or TTS in a hidden webpage (like a browser source in OBS).

## Do the things

```bash
# Clone the repo
git clone git@github.com:AlcaDesign/sound-trigger-bot.git
# Change directory into the repo
cd sound-trigger-bot
# Copy the .env.example file to .env
cp .env.example .env
# Edit the .env file
nano .env
# Install the dependencies
npm install
# Start the server
npm start
```

By default, the port is set to `8500` in the `.env`. Go to `localhost:8500` and
you'll get a link to the sfx page. This is the page that would be loaded in OBS.
The main page may be used for adding more sound effects and other options later.

## Commands

### Sound Effects

#### ***`!<sound effect>`***

Sound effects are sounds files located in `www/sound-effects/` and listed in the
`sounds` section of `db.json`.

The DB has "ding" listed with a "ping" alias. The command "!ding" or "!ping" will play the "ding.mp3" sound effect.

### Text-To-Speech

#### ***`!tts <text to say>`***

Play some text-to-speech with a chirp sound queued before.

## Adding more sound effects

Edit the `db.json` file to include additional items in the `sounds` array and
matching files in `www/sound-effects/`. The file name can include additional
directories as long as its based in the prior mentioned directory.

```json
{
	"sounds": [
		{
			"name": "ding",
			"file": "ding.mp3",
			"aliases": [ "ping" ]
		},
		{
			"name": "helloworld",
			"file": "helloworld.mp3",
			"aliases": [ "hello", "hello-world" ]
		}
	]
}
```