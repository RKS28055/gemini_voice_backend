Gemini Voice Backend


Files:

- server.js        Main Express server handling /voice

- package.json     Project dependencies

- .gitignore       Ignore node_modules, uploads, env


Setup:

1. Create Gemini API key at Google AI Studio

2. Add GEMINI_API_KEY in Render Environment Variables

3. Deploy to Render (connect GitHub or zip upload)

4. Ensure Node version >=16


Endpoint:

POST /voice with form-data key 'audio' (audio/wav)

Returns: MP3 audio of GPT response