# Botmate - A Slack App

This repository contains the code implementation for creating a Slack app using the Bolt framework for JavaScript and implemented in an Express app.

The code is part of a blog post titled "A Comprehensive Guide to Creating Your Own Slack App". To check out the full blog post, go to https://docs.google.com/document/d/1GbNsH-7h7qSfjNi-hHRXSHvMMoyBLJw76jZUCB04Bgs/edit.

## Installation

To install the dependencies, run the following command:

```
npm install
```

## Environment Variables

Before running the app, you need to set up a few environment variables. You can get these values by navigating to your app's [BASIC INFORMATION Page](https://api.slack.com/apps).

```
SLACK_SIGNING_SECRET=<YOUR_SLACK_APP_SIGNING_SECRET>
SLACK_CLIENT_ID=<YOUR_SLACK_APP_CLIENT_ID>
SLACK_CLIENT_SECRET=<YOUR_SLACK_APP_CLIENT_ID>
```

## Running the App

To start the app, run the following command:

```
npm run start
```

This will start the app on port `3000`. To access the app on an external network, you need to use ngrok to create a `redirect url` for OAuth and a `request url` for events.

```
.\ngrok http 3000
```

This will output a forwarding address for `http` and `https`. Take note of the `https` one. It should look something like the following:

```
Forwarding https://a66e-2401-4900-1c5c-d73-98d6-8a8a-2aa1-2fb8.in.ngrok.io -> http://localhost:3000
```

Next, go to your app on https://api.slack.com/apps and navigate to your app's **OAuth & Permissions** page. Under **Redirect URLs**, add your ngrok forwarding address with the `/oauth_redirect` path appended, like this:

```
https://a66e-2401-4900-1c5c-d73-98d6-8a8a-2aa1-2fb8.in.ngrok.io/oauth_redirect
```

Now go to **Event Subscriptions** and enable events. For the **Request URL**, pass your ngrok forwarding address with the `/slack/events` path appended, like this:

```
https://a66e-2401-4900-1c5c-d73-98d6-8a8a-2aa1-2fb8.in.ngrok.io/slack/events
```

Repeat the same process for other commands and interactivity.

I hope that helps!
