const Eris = require("eris");
const MixerStream = require("./mixer")
const { PassThrough } = require("stream")
const spawn = require('child_process').spawn;

const bot = Eris("Mjc4MTQ4MzQ5MzIyODU0NDEw.XL1n-Q.dt47OVKqQpPV3PjQ7FoHbr44fnY");

const playCommand = "!test";

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("messageCreate", (msg) => { // When a message is created
    if(msg.content.startsWith(playCommand)) {
        bot.joinVoiceChannel(msg.member.voiceState.channelID).catch((err) => { // Join the user's voice channel
            bot.createMessage(msg.channel.id, "Error joining voice channel: " + err.message); // Notify the user if there is an error
            console.log(err); // Log the error
        }).then((connection) => {
            const mixer = new MixerStream(16, 2, 48000);

            connection.on('speakingStart', user => {
                console.log('1', user)
            })
            connection.on('speakingStop', user => {
                console.log('1', user)
            })
            connection.on('disconnect', user => {
                console.log('2', user)
                // delete users[user]
            })

            const streams = connection.receive('pcm')
            streams.on('data', (buffer, user) => {
                // console.log('3', , user)
                if (!users[user]) {
                    console.log('3', user)
                    users[user] = new PassThrough()
                    mixer.addSource(users[user])
                }
                users[user].write(buffer)
            })


            /**
             * @type {{ [user: string]: PassThrough }}
             */
            const users = {}

            console.log(require('ffmpeg-static'))
            const outputStream = spawn(require('ffmpeg-static'), [
                '-f', 's16le', // Input is signed 16-bit raw PCM
                '-ac', '2', // Input channels
                '-ar', '48000', // Input sample rate
                '-i', '-', // Get from stdin
                '-y', `test-${new Date().toISOString().replace(/[^\d]/g, '')}.mp3`
            ])

            mixer.pipe(outputStream.stdin)
            outputStream.stdout.pipe(process.stdout, { end: false })
            outputStream.stderr.pipe(process.stderr, { end: false })
        });
    }
});

bot.connect(); // Get the bot to connect to Discord