# VibeSpek - Robot Interview Game 🤖

An interactive AI-powered robot interview experience using p5.js, speech recognition, and OpenAI. Choose between two robot personalities and have a conversation!

## 🎭 Features

- **Two Robot Personalities:**
  - **Robot A (Sarcastic)**: A cynical robot that responds with beeps (synthesized audio). Watch out for the sass!
  - **Robot B (Kind)**: An overly friendly robot that speaks responses using text-to-speech. Annoying in the best way!

- **Speech Recognition**: Speak to the robots using your microphone
- **3D Robot Visualization**: Animated 3D robot cubes with emoji faces
- **Real-time Conversation**: Powered by OpenAI GPT-4o-mini
- **Mobile Optimized**: Responsive design for desktop and mobile browsers

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the project root:

   ```env
   VITE_OPENAI_API_KEY=sk-your-openai-key-here
   OPENAI_API_KEY=sk-your-openai-key-here
   ```

3. **Run development server:**

   ```bash
   pnpm dev
   ```

   Open http://localhost:5173 in your browser.

4. **Allow microphone access** when prompted by your browser.

5. **Click "Start Listening"** and start talking to your robot!

### Production Build

1. **Build the frontend:**

   ```bash
   pnpm build
   ```

2. **Start the production server:**
   ```bash
   pnpm start
   ```
   The server will serve the built frontend AND handle API requests.

## 🏗️ Project Structure

```
my-robot-game/
├── dist/                   # Build output (generated)
├── public/                 # Static assets
│   └── assets/            # Robot emoji images
├── src/
│   ├── main.js            # Main p5.js sketch (Instance Mode)
│   └── style.css          # Styles
├── server.js              # Express backend + OpenAI integration
├── index.html             # Entry point
├── package.json           # Dependencies & scripts
└── .env                   # Environment variables (local)
```

## 🎮 How to Use

1. **Start the app** and grant microphone permissions
2. **Select a robot** using the dropdown (Robot A or Robot B)
3. **Click "Start Listening"** button
4. **Speak clearly** into your microphone
5. **Watch the robot respond!**
   - Robot A: Responds with musical beeps
   - Robot B: Speaks back to you
6. The conversation history appears at the bottom of the screen

## 🧪 Technologies

- **Frontend:**
  - [p5.js](https://p5js.org/) - Creative coding library
  - [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) - Audio synthesis
  - [Vite](https://vitejs.dev/) - Build tool
  - Web Speech API - Speech recognition
  - Speech Synthesis API - Text-to-speech

- **Backend:**
  - [Express](https://expressjs.com/) - Web server
  - [OpenAI API](https://openai.com/) - GPT-4o-mini for conversations
  - [Axios](https://axios-http.com/) - HTTP client

## 🚂 Railway Deployment

### Step 1: Prepare Repository

Push this project to GitHub. **Important:** Make sure `.env` is in `.gitignore`!

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository

### Step 3: Configure Build Settings

In Railway dashboard:

**Build Command:**

```
pnpm run build
```

**Start Command:**

```
pnpm start
```

### Step 4: Add Environment Variables

In Railway → **Variables** tab:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

Railway automatically sets `PORT`, don't override it.

### Step 5: Deploy!

Railway will:

1. Install dependencies (`pnpm install`)
2. Build frontend (`pnpm build` → creates `dist/`)
3. Start server (`pnpm start` → runs `server.js`)
4. Serve frontend and API from the same domain

## 📡 API Endpoints

### `POST /api/chat`

Send messages to the robot.

**Request:**

```json
{
  "message": "Tell me about yourself",
  "personality": "robotA_single",
  "conversationHistory": []
}
```

**Response:**

```json
{
  "response": "Oh great, another human who wants to chat. How delightful."
}
```

### `GET /api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-09T..."
}
```

## 🎨 p5.js Instance Mode

This project uses p5.js **Instance Mode** (required for Vite):

```javascript
const sketch = (s) => {
  s.setup = () => {
    s.createCanvas(800, 400, s.WEBGL);
  };

  s.draw = () => {
    s.background(40);
  };
};

new p5(sketch);
```

All p5 functions are accessed via the sketch instance (`s`).

## 🐛 Troubleshooting

### Microphone not working

- Ensure you've granted microphone permissions in your browser
- Check browser console for errors
- Try clicking the canvas first to enable audio context

### No audio output

- Click anywhere on the page first (browser requirement)
- Check your system/browser volume
- Look for audio context errors in console

### OpenAI API errors

- Verify `OPENAI_API_KEY` is set correctly
- Check Railway logs for detailed error messages
- Ensure your OpenAI account has credits

### Build fails

- Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install`
- Check for Node.js version compatibility (recommend Node 18+)
- Review build logs for specific errors

## 🔐 Security Notes

- ✅ **Never commit `.env` file** - it's in `.gitignore`
- ✅ **Use Railway environment variables** for production
- ✅ **API key only on backend** - never exposed to client in production
- ✅ **Client-side key only for local dev** - uses `VITE_` prefix

## 📝 Development Scripts

```bash
pnpm dev      # Start Vite dev server (frontend only, port 5173)
pnpm build    # Build frontend to dist/
pnpm preview  # Preview built frontend locally
pnpm start    # Start production server (serves frontend + API)
```

## 🎯 Future Enhancements

- [ ] Add ggwave audio data transmission
- [ ] Implement conversation export/save
- [ ] Add more robot personalities
- [ ] Enhanced 3D robot animations
- [ ] Voice selection for text-to-speech
- [ ] Mobile-specific UI improvements

## 📄 License

Check LICENSE file in the root directory.

## 🤝 Contributing

Feel free to submit issues or pull requests!

---

**Enjoy conversing with your robot interviewers! 🤖✨**
