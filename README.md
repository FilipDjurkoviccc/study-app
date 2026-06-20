# Study App

A small social study application with topic rooms and chats for classes, hobbies, and group learning.

## Features

- Browse study and hobby rooms
- Create new rooms
- Chat inside each room
- Polls for new messages every few seconds
- Express backend can also serve the React production build

## Local Development

Open two terminals.

Backend:

```bash
cd study-app/backend
npm install
npm start
```

Frontend:

```bash
cd study-app/frontend
npm install
npm start
```

The React dev server runs on `http://localhost:3001` and talks to the backend on `http://localhost:3000`.

## Production On EC2

```bash
git pull
cd study-app/frontend
npm install
npm run build
cd ../backend
npm install
npm start
```

Then open:

```text
http://13.60.45.183:3000
```

Make sure the EC2 security group allows inbound TCP traffic on port `3000`.

## Important Security Note

Do not commit `.pem` files. If an EC2 private key was pushed to GitHub, create a new key pair in AWS and replace the old one.
