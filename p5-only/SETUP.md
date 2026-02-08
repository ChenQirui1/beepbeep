# Setup Instructions

## Prerequisites
- A modern web browser (Chrome, Firefox, Edge, or Safari)
- Claude API key from Anthropic

## Configuration Steps

1. **Get your Claude API key**
   - Visit https://console.anthropic.com/
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key

2. **Configure the application**
   - Copy `config.template.js` to `config.js`
   - Open `config.js` in a text editor
   - Replace `'sk-ant-api03-...'` with your actual API key
   - Save the file

3. **Run the application**
   - Open `index.html` in your web browser
   - Click "Start Listening" to begin
   - Speak to the robots and they will respond using Claude API

## Features

- **3D Robot Heads**: Two cube robots with emoji faces
- **Speech Recognition**: Uses browser's built-in speech recognition
- **Claude API Integration**: Each robot uses Claude 3 Haiku for responses
- **GGWave Audio**: Responses are encoded as audio using ggwave
- **Dynamic Animations**: Robots face each other when speaking, then return to face the viewer

## Troubleshooting

- **Speech recognition not working**: Make sure you're using HTTPS or localhost, and grant microphone permissions
- **API errors**: Check that your API key is correct in `config.js`
- **No audio**: Ensure your browser supports Web Audio API and check volume settings
- **GGWave not loading**: Check your internet connection (CDN required)

## Cost Considerations

This application uses Claude 3 Haiku, which is Anthropic's most cost-effective model. Each robot call is limited to 100 tokens to minimize costs.
