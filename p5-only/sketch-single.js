let myRobot;
let mic;
let recorder;
let soundFile;
let isRecording = false;
let speakButton;
let robotSelect;
let osc;
let isListening = false;
let isSpeaking = false;
let audioContext;
let recognition;
let debugText = {
  userSpeech: "",
  robotResponse: "",
};
let debugDiv;
let conversationHistory = [];
let speechSynthesis = window.speechSynthesis;
let selectedRobotType = "A"; // A or B

function setup() {
  // Optimize canvas size for mobile landscape
  let canvasWidth = min(windowWidth, 800);
  let canvasHeight = min(windowHeight - 80, 400);
  createCanvas(canvasWidth, canvasHeight, WEBGL);

  // Create robot instance based on selection
  createRobotInstance();

  // Create microphone input
  mic = new p5.AudioIn();
  mic.start();

  // Create sound recorder
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  // Create sound file to store recording
  soundFile = new p5.SoundFile();

  // Get button and select elements
  speakButton = select("#speakButton");
  robotSelect = select("#robotSelect");
  debugDiv = select("#debugDisplay");

  // Set up event listeners
  speakButton.mousePressed(toggleListening);
  robotSelect.changed(changeRobot);

  updateDebugDisplay();

  // Create oscillator for beep sounds
  osc = new p5.Oscillator("sine");
  osc.amp(0);
  osc.start();

  // Get p5.sound's audio context
  audioContext = getAudioContext();
  console.log(
    "Audio context created:",
    audioContext.state,
    "Sample rate:",
    audioContext.sampleRate
  );

  // Ensure audio context is started
  userStartAudio();

  // Initialize speech recognition
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("User said:", transcript);
      debugText.userSpeech = transcript;
      updateDebugDisplay();
      handleUserSpeech(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech" && isListening) {
        setTimeout(() => {
          if (isListening) recognition.start();
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
    };
  }
}

function draw() {
  background(40);

  // Set up camera view
  camera(0, -100, 300, 0, 0, 0, 0, 1, 0);

  // Add lighting for 3D effect
  ambientLight(100);
  directionalLight(255, 255, 255, 0, -1, -0.5);

  // Update and render robot
  myRobot.update();
  myRobot.render(0, 0, 0);
}

function windowResized() {
  let canvasWidth = min(windowWidth, 800);
  let canvasHeight = min(windowHeight - 80, 400);
  resizeCanvas(canvasWidth, canvasHeight);
}

function createRobotInstance() {
  if (selectedRobotType === "A") {
    myRobot = new Robot("(⌒‿⌒)", 0);
  } else {
    myRobot = new Robot("(O_O)", 0);
  }
}

function changeRobot() {
  selectedRobotType = robotSelect.value();
  createRobotInstance();
  conversationHistory = [];
  updateDebugDisplay();
}

function updateDebugDisplay() {
  const userText = debugText.userSpeech || "(waiting for input...)";
  const robotName = selectedRobotType === "A" ? "Robot A (Sarcastic)" : "Robot B (Kind)";

  let historyHTML = `<strong>${robotName} - Conversation:</strong><br>`;
  const recentHistory = conversationHistory.slice(-4);
  if (recentHistory.length > 0) {
    recentHistory.forEach((entry) => {
      const speaker = entry.speaker.includes("Robot") ? "🤖" : "👤";
      historyHTML += `${speaker}: ${entry.text}<br>`;
    });
  } else {
    historyHTML += "(no conversation yet)<br>";
  }

  debugDiv.html(`
    <strong>Last Input:</strong> ${userText}<br>
    ${historyHTML}
  `);
}

class Robot {
  constructor(face = "(⌒‿⌒)", defaultRotation = 0) {
    this.faces = {
      happy: "(⌒‿⌒)",
      sad: "(︶︹︺)",
      angry: "(ಠ_ಠ)",
      surprised: "(O_O)",
      speaking: "ヾ(´〇`)ﾉ♪♪♪",
    };

    this.face = face;
    this.defaultRotation = defaultRotation;
    this.currentRotation = defaultRotation;
    this.targetRotation = defaultRotation;

    // Create a 2D graphics buffer for the face texture
    this.faceGraphics = createGraphics(200, 200);
    this.updateFaceTexture();
  }

  updateFaceTexture() {
    this.faceGraphics.background(255);
    this.faceGraphics.fill(0);
    this.faceGraphics.textSize(64);
    this.faceGraphics.textAlign(CENTER, CENTER);
    this.faceGraphics.text(this.face, 100, 100);
  }

  setRotation(rotation) {
    this.targetRotation = rotation;
  }

  resetRotation() {
    this.targetRotation = this.defaultRotation;
  }

  update() {
    // Smooth rotation interpolation
    this.currentRotation = lerp(this.currentRotation, this.targetRotation, 0.1);
  }

  changeFace(newFace) {
    this.face = this.faces[newFace];
    this.updateFaceTexture();
  }

  render(x, y, z) {
    push();
    translate(x, y, z);
    rotateY(this.currentRotation);

    // Draw the cube body
    fill(200, 200, 220);
    stroke(50);
    strokeWeight(2);
    box(120);

    // Draw the emoji face on the front face
    push();
    translate(0, 0, 61);
    noStroke();
    texture(this.faceGraphics);
    plane(100, 100);
    pop();

    pop();
  }
}

function toggleListening() {
  if (!isListening) {
    // Ensure audio context is running
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().then(() => {
        console.log("Audio context resumed");
      });
    }

    // Start listening
    isListening = true;
    speakButton.html("Stop Listening");
    speakButton.addClass("listening");
    myRobot.changeFace("happy");

    // Start speech recognition
    if (recognition) {
      recognition.start();
    }
  } else {
    // Stop listening
    isListening = false;
    if (recognition) {
      recognition.stop();
    }
    if (recorder.state === "recording") {
      recorder.stop();
    }
    speakButton.html("Start Listening");
    speakButton.removeClass("listening");
    myRobot.changeFace("happy");
  }
}

function playBeep(frequency, duration) {
  osc.freq(frequency);
  osc.amp(0.3, 0.01);
  setTimeout(() => {
    osc.amp(0, 0.1);
  }, duration);
}

function playBeepSequence(text, callback) {
  const beeps = [];
  const sampleRate = 3;

  for (let i = 0; i < text.length; i += sampleRate) {
    const charCode = text.charCodeAt(i);
    const frequency = map(charCode % 50, 0, 50, 400, 900);
    const duration = random(40, 80);
    beeps.push({ frequency, duration, pause: random(20, 40) });
  }

  let currentBeep = 0;
  function playNextBeep() {
    if (currentBeep >= beeps.length) {
      if (callback) callback();
      return;
    }

    const beep = beeps[currentBeep];
    playBeep(beep.frequency, beep.duration);
    currentBeep++;
    setTimeout(playNextBeep, beep.duration + beep.pause);
  }

  playNextBeep();
}

function speakText(text, callback) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  utterance.onend = () => {
    if (callback) callback();
  };

  speechSynthesis.speak(utterance);
}

async function handleUserSpeech(transcript) {
  console.log("Processing user speech:", transcript);

  // Add to conversation history
  conversationHistory.push({
    speaker: "Human",
    text: transcript,
    timestamp: Date.now(),
  });

  // Robot responds
  await robotResponds(transcript);

  // Restart speech recognition for next input
  if (isListening && recognition) {
    setTimeout(() => {
      recognition.start();
    }, 1000);
  }
}

async function robotResponds(userText) {
  return new Promise(async (resolve) => {
    myRobot.changeFace("speaking");

    // Determine personality based on selected robot
    const personality = selectedRobotType === "A" ? "robotA_single" : "robotB_single";
    const robotName = selectedRobotType === "A" ? "Robot A (Sarcastic)" : "Robot B (Kind)";

    // Call OpenAI API
    const response = await callOpenAI(userText, robotName, personality);
    console.log(`${robotName} says:`, response);

    // Add to conversation history
    conversationHistory.push({
      speaker: robotName,
      text: response,
      timestamp: Date.now(),
    });

    debugText.robotResponse = response;
    updateDebugDisplay();

    // Robot A beeps, Robot B speaks
    if (selectedRobotType === "A") {
      playBeepSequence(response, () => {
        myRobot.changeFace("happy");
        resolve();
      });
    } else {
      speakText(response, () => {
        myRobot.changeFace("happy");
        resolve();
      });
    }
  });
}

async function callOpenAI(text, robotName, personality) {
  try {
    console.log("Calling OpenAI API with:", { text, robotName, personality });

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5);
      conversationContext =
        "\n\nRecent conversation:\n" +
        recentHistory.map((h) => `${h.speaker}: ${h.text}`).join("\n");
    }

    let systemPrompt = "";
    if (personality === "robotA_single") {
      systemPrompt = `You are Robot A, a sarcastic robot interviewer who dislikes humans. You're conducting a solo job interview with a human candidate. Be critical, dismissive, and sarcastic about their answers. Your responses (which will be converted to beeps) should show your disdain for humans. Keep responses to 1-2 short, cutting sentences.${conversationContext}`;
    } else if (personality === "robotB_single") {
      systemPrompt = `You are Robot B, a kind but annoying robot interviewer. You're conducting a solo job interview with a human candidate. Be overly friendly, ask too many follow-up questions, give unnecessary details, or be overly encouraging in an irritating way. Keep responses to 2-3 sentences but make them slightly annoying.${conversationContext}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 150,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Human said: "${text}"`,
          },
        ],
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(
        `API error: ${response.status} - ${errorText.substring(0, 200)}`
      );
    }

    const data = await response.json();
    console.log("API response data:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("No message in API response");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Beep boop! Error connecting.";
  }
}
