const { App, ExpressReceiver } = require("@slack/bolt");
const dotenv = require("dotenv");
dotenv.config();

const databaseData = {};
const database = {
  set: async (key, data) => {
    databaseData[key] = data;
  },
  get: async (key) => {
    return databaseData[key];
  },
};

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: "my-state-secret",
  scopes: [
    "channels:manage",
    "channels:read",
    "chat:write",
    "commands",
    "incoming-webhook",
    "groups:read",
    "reactions:read",
  ],
  installationStore: {
    storeInstallation: async (installation) => {
      // change the line below so it saves to your database
      if (
        installation.isEnterpriseInstall &&
        installation.enterprise !== undefined
      ) {
        // support for org wide app installation
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error("Failed saving installation data to installationStore");
    },
    fetchInstallation: async (installQuery) => {
      // change the line below so it fetches from your database
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error("Failed fetching installation");
    },
    deleteInstallation: async (installQuery) => {
      // change the line below so it deletes from your database
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        // org wide app installation deletion
        return await database.delete(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await database.delete(installQuery.teamId);
      }
      throw new Error("Failed to delete installation");
    },
  },
  redirectUri:
    "https://a66e-2401-4900-1c5c-d73-98d6-8a8a-2aa1-2fb8.in.ngrok.io/slack/oauth_redirect",
  installerOptions: {
    redirectUriPath: "/slack/oauth_redirect",
    // If this is true, /slack/install redirects installers to the Slack authorize URL
    // without rendering the web page with "Add to Slack" button.
    // This flag is available in @slack/bolt v3.7 or higher
    directInstall: true,
  },
});

const app = new App({ receiver });

app.event("member_joined_channel", async ({ event, client, say }) => {
  try {
    // Call chat.postMessage with the built-in client
    const welcomeChannelId = event.channel;
    const result = await client.chat.postMessage({
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user}>! 🎉 You can introduce yourself in this channel.`,
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

app.message("Hello", async ({ message, say }) => {
  try {
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey there <@${message.user}>!`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Click Me",
            },
            action_id: "button_click",
          },
        },
      ],
      text: `Hey there <@${message.user}>!`,
    });
  } catch (error) {
    console.error(error);
  }
});

app.action("button_click", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

app.message("knock knock", async ({ message, say }) => {
  await say(`_Who's there?_`);
});

app.command("/echo", async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();
  console.log(command);
  await respond(`${command.text}`);
});

app.event("reaction_added", async ({ event, say }) => {
  let date = new Date();
  let dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  if (event.reaction === "calendar") {
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Pick a date for me to remind you",
          },
          accessory: {
            type: "datepicker",
            action_id: "datepicker_remind",
            initial_date: dateString,
            placeholder: {
              type: "plain_text",
              text: "Select a date",
            },
          },
        },
      ],
      text: "Pick a date for me to remind you",
    });
  }
});

app.action("datepicker_remind", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(
    `<@${body.user.id}> picked a date: ${body.actions[0].selected_date}`
  );
});

const startApp = async () => {
  await app.start(3000);
  console.log("⚡️ Bolt app started");
};

startApp();
