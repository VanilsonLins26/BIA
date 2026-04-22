import * as fs from 'fs';

let env = fs.readFileSync('.env', 'utf-8');
let key = env.split('\n').find(line => line.includes('GEMINI_API_KEY'))?.split('=')[1]?.replace(/"'/g, '').trim();

if (!key) {
  // Try finding it maybe via other names or we don't have it
  console.error("Could not find GEMINI_API_KEY in .env");
  process.exit(1);
}

async function test() {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-pro",
        messages: [{ role: "user", content: "test" }],
      }),
    }
  );
  console.log("Status:", response.status);
  console.log(await response.text());
}
test();
