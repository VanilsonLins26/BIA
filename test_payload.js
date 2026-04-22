async function test() {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer DUMMY_KEY`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-pro",
        messages: [
          { role: "system", content: "You are helpful." },
          { role: "user", content: "test" }
        ],
      }),
    }
  );
  console.log("Status:", response.status);
  console.log(await response.text());
}
test();
