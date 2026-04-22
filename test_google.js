async function test() {
  const KEY = "AIzaSyAZxQPV-7GwZYz_GguAZ-jT7u3KsyAoFYg";
  const models = ["gemini-1.5-pro-latest", "gemini-1.5-flash", "gemini-1.5-pro-002", "gemini-1.5-flash-latest"];
  
  for (const m of models) {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: m,
          messages: [
            { role: "system", content: "You are helpful." },
            { role: "user", content: "test" }
          ],
        }),
      }
    );
    console.log(`Model: ${m} -> Status: ${response.status}`);
    if (response.status !== 200) {
      console.log(await response.text());
    }
  }
}
test();
