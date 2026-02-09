let myRobot;
let myRobot2;
let mic;
let recorder;
let soundFile;
let isRecording = false;
let speakButton;
let osc;
let lastBeepTime = 0;
let beepInterval = 200;
let isListening = false;
let isSpeaking = false;
let silenceTimer = 0;
let silenceThreshold = 1000;
let speechThreshold = 0.05;
let audioContext;
let recognition;
let debugText = {
  userSpeech: "",
  robot1Response: "",
  robot2Response: "",
};
let debugDiv;
let conversationHistory = [];
let speechSynthesis = window.speechSynthesis;

function setup() {
  createCanvas(1200, 600, WEBGL);

  // create robot instances
  // Robot A (left) - sarcastic, default faces right
  myRobot = new Robot("(⌒‿⌒)", 0.3);
  // Robot B (right) - kind, default faces left
  myRobot2 = new Robot("(O_O)", -0.3);

  // create microphone input
  mic = new p5.AudioIn();
  mic.start();

  // create sound recorder
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  // create sound file to store recording
  soundFile = new p5.SoundFile();

  // create speak button
  speakButton = createButton("Start Listening");
  speakButton.position(20, 20);
  speakButton.mousePressed(toggleListening);

  // create debug overlay
  debugDiv = createDiv();
  debugDiv.position(20, 60);
  debugDiv.style("background-color", "rgba(0, 0, 0, 0.7)");
  debugDiv.style("color", "white");
  debugDiv.style("padding", "10px");
  debugDiv.style("font-family", "monospace");
  debugDiv.style("font-size", "12px");
  debugDiv.style("max-width", "400px");
  debugDiv.style("border-radius", "5px");
  updateDebugDisplay();

  // create oscillator for beep sounds
  osc = new p5.Oscillator("sine");
  osc.amp(0);
  osc.start();

  // Get p5.sound's audio context (ensures proper initialization)
  audioContext = getAudioContext();
  console.log(
    "Audio context created:",
    audioContext.state,
    "Sample rate:",
    audioContext.sampleRate,
  );

  // Ensure audio context is started
  userStartAudio();

  // initialize speech recognition
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
      // Restart if it was just a no-speech error
      if (event.error === "no-speech" && isListening) {
        setTimeout(() => {
          if (isListening) recognition.start();
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      // Don't auto-restart here, handleUserSpeech will do it
    };
  }
}

function draw() {
  background(240);

  // set up slight top-down camera view
  camera(0, -150, 400, 0, 0, 0, 0, 1, 0);

  // add lighting for 3D effect
  ambientLight(100);
  directionalLight(255, 255, 255, 0, -1, -0.5);

  // update robot rotations
  myRobot.update();
  myRobot2.update();

  // display the robots side by side
  myRobot.render(-150, 0, 0);
  myRobot2.render(150, 0, 0);
}

function updateDebugDisplay() {
  const userText = debugText.userSpeech || "(waiting...)";

  // Show recent conversation history
  let historyHTML = "<strong>Conversation History:</strong><br>";
  const recentHistory = conversationHistory.slice(-6);
  if (recentHistory.length > 0) {
    recentHistory.forEach((entry) => {
      const speaker = entry.speaker.includes("Robot A")
        ? "🤖A"
        : entry.speaker.includes("Robot B")
          ? "🤖B"
          : "👤";
      historyHTML += `${speaker}: ${entry.text}<br>`;
    });
  } else {
    historyHTML += "(no conversation yet)<br>";
  }

  debugDiv.html(`
    <strong>Last User Input:</strong> ${userText}<br><br>
    ${historyHTML}
  `);
}

//class details the appearance and behavior of a robot
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

    // create a 2D graphics buffer for the face texture
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
    // smooth rotation interpolation
    this.currentRotation = lerp(this.currentRotation, this.targetRotation, 0.1);
  }

  greet() {
    console.log(`Hello, I am ${this.face}`);
  }

  changeFace(newFace) {
    this.face = this.faces[newFace];
    this.updateFaceTexture();
  }

  render(x, y, z) {
    push();
    translate(x, y, z);
    rotateY(this.currentRotation);

    // draw the cube body
    fill(200, 200, 220);
    stroke(50);
    strokeWeight(2);
    box(120);

    // draw the emoji face on the front face
    push();
    translate(0, 0, 61);
    noStroke();
    texture(this.faceGraphics);
    plane(100, 100);
    pop();

    pop();
  }
}

function mousePressed() {
  // when press shuffle the robot face
  let faces = ["happy", "sad", "angry", "surprised", "speaking"];
  let randomFace = random(faces);
  myRobot.changeFace(randomFace);
}

function toggleListening() {
  if (!isListening) {
    // Ensure audio context is running (required by browsers)
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().then(() => {
        console.log("Audio context resumed");
      });
    }

    // start listening
    isListening = true;
    speakButton.html("Stop Listening");
    myRobot.changeFace("happy");
    myRobot2.changeFace("happy");

    // start speech recognition
    if (recognition) {
      recognition.start();
    }
  } else {
    // stop listening
    isListening = false;
    if (recognition) {
      recognition.stop();
    }
    if (recorder.state === "recording") {
      recorder.stop();
    }
    speakButton.html("Start Listening");
    myRobot.changeFace("happy");
    myRobot2.changeFace("happy");
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
  // Convert text to beep pattern - sample every few characters for shorter sequences
  const beeps = [];
  const sampleRate = 3; // Only beep every 3rd character

  for (let i = 0; i < text.length; i += sampleRate) {
    const charCode = text.charCodeAt(i);
    const frequency = map(charCode % 50, 0, 50, 400, 900);
    const duration = random(40, 80); // Shorter duration
    beeps.push({ frequency, duration, pause: random(20, 40) }); // Shorter pause
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
  // Use Web Speech API for human-like speech
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

  // Step 1: Robot A (sarcastic, left) and Robot B (kind, right) talk amongst themselves
  // Robot A speaks first (to Robot B) - only beeps
  await robotConversation(myRobot, myRobot2, transcript, "robotA");

  // Step 2: Robot B responds to Robot A - in beeps
  await new Promise((resolve) => setTimeout(resolve, 500));
  await robotConversation(myRobot2, myRobot, transcript, "robotB_to_robotA");

  // Step 3: Sometimes Robot A faces human and beeps
  if (random() > 0.6) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await robotSpeaksToHuman(myRobot, transcript, "robotA_to_human");
  }

  // Step 4: Robot B replies to human in human speech
  await new Promise((resolve) => setTimeout(resolve, 800));
  await robotSpeaksToHuman(myRobot2, transcript, "robotB_to_human");

  // Restart speech recognition for next input
  if (isListening && recognition) {
    setTimeout(() => {
      recognition.start();
    }, 1000);
  }
}

async function callOpenAI(text, robotName, personality, context) {
  try {
    console.log("Calling OpenAI API with:", {
      text,
      robotName,
      personality,
    });

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5);
      conversationContext =
        "\n\nRecent conversation:\n" +
        recentHistory.map((h) => `${h.speaker}: ${h.text}`).join("\n");
    }

    let systemPrompt = "";
    if (personality === "robotA") {
      systemPrompt = `You are Robot A, a sarcastic robot interviewer who dislikes humans and only communicates in beeps. You're conducting a job interview and discussing the human candidate with Robot B. Be critical, dismissive, and sarcastic about their answers. Your internal thoughts (which will be converted to beeps) should show your disdain for humans. Keep responses to 1-2 short, cutting sentences.${conversationContext}\n\nContext: ${context}`;
    } else if (personality === "robotB_to_robotA") {
      systemPrompt = `You are Robot B, a kind but annoying robot interviewer. You're talking to Robot A (who dislikes humans) about the candidate's answer. Try to be positive and see the good side, but be overly enthusiastic, rambling, or ask unnecessary follow-up questions. Be well-meaning but irritating. Keep responses to 1-2 sentences.${conversationContext}\n\nContext: ${context}`;
    } else if (personality === "robotB_to_human") {
      systemPrompt = `You are Robot B, a kind but annoying robot interviewer. You're assessing a human job candidate. Be overly friendly, ask too many follow-up questions, give unnecessary details, or be overly encouraging in an irritating way. Sometimes translate what Robot A said (in beeps) - usually something critical. This is a job interview scenario. Keep responses to 2-3 sentences but make them slightly annoying.${conversationContext}\n\nContext: ${context}`;
    } else if (personality === "robotA_to_human") {
      systemPrompt = `You are Robot A, a sarcastic robot interviewer who dislikes humans. You're facing the human candidate but choose to speak only in beeps. Express something critical, dismissive, or sarcastic about their answer. Keep it to 1 short, cutting sentence (will be converted to beeps).${conversationContext}\n\nContext: ${context}`;
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
        `API error: ${response.status} - ${errorText.substring(0, 200)}`,
      );
    }

    const data = await response.json();
    console.log("API response data:", data);

    // Extract the response text from OpenAI format
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("No message in API response");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Beep boop! Error connecting.";
  }
}

async function robotConversation(
  speakingRobot,
  listeningRobot,
  userText,
  personality,
) {
  return new Promise(async (resolve) => {
    // Speaking robot faces the listening robot
    if (speakingRobot === myRobot) {
      speakingRobot.setRotation(0.6); // Face right (toward Robot B)
      listeningRobot.setRotation(-0.6); // Face left (toward Robot A)
    } else {
      speakingRobot.setRotation(-0.6); // Face left (toward Robot A)
      listeningRobot.setRotation(0.6); // Face right (toward Robot B)
    }

    speakingRobot.changeFace("speaking");
    listeningRobot.changeFace("surprised");

    // Call Claude API
    const robotName =
      speakingRobot === myRobot ? "Robot A (Sarcastic)" : "Robot B (Kind)";
    const context = personality.includes("robotA")
      ? "talking to Robot B"
      : "responding to Robot A";
    const response = await callOpenAI(
      userText,
      robotName,
      personality,
      context,
    );
    console.log(`${robotName} says:`, response);

    // Add to conversation history
    conversationHistory.push({
      speaker: robotName,
      text: response,
      timestamp: Date.now(),
    });

    // Update debug text
    if (speakingRobot === myRobot) {
      debugText.robot1Response = response;
    } else {
      debugText.robot2Response = response;
    }
    updateDebugDisplay();

    // Both robots speak in beeps when talking to each other
    playBeepSequence(response, () => {
      speakingRobot.changeFace("happy");
      listeningRobot.changeFace("happy");
      resolve();
    });
  });
}

async function robotSpeaksToHuman(robot, userText, personality) {
  return new Promise(async (resolve) => {
    // Robot faces forward (toward human)
    robot.setRotation(-0.3);
    robot.changeFace("speaking");

    // Call Claude API
    const robotName =
      robot === myRobot ? "Robot A (Sarcastic)" : "Robot B (Kind)";
    const context =
      personality === "robotA_to_human"
        ? "facing human but speaking in beeps"
        : "answering human's question";
    const response = await callOpenAI(
      userText,
      robotName,
      personality,
      context,
    );
    console.log(`${robotName} to human:`, response);

    // Add to conversation history
    conversationHistory.push({
      speaker: robotName + " (to Human)",
      text: response,
      timestamp: Date.now(),
    });

    // Update debug text
    if (robot === myRobot) {
      debugText.robot1Response = response;
    } else {
      debugText.robot2Response = response;
    }
    updateDebugDisplay();

    // Robot A always beeps, Robot B speaks human language to human
    if (personality === "robotA_to_human") {
      playBeepSequence(response, () => {
        robot.changeFace("happy");
        robot.resetRotation();
        resolve();
      });
    } else {
      // Robot B speaks in human voice
      speakText(response, () => {
        robot.changeFace("happy");
        robot.resetRotation();
        resolve();
      });
    }
  });
}
