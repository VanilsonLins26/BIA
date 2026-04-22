async function test() {
  const KEY = "AIzaSyAZxQPV-7GwZYz_GguAZ-jT7u3KsyAoFYg";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`);
  const data = await response.json();
  const names = data.models.map(m => m.name.replace("models/", ""));
  console.log("AVAILABLE MODELS:", names.filter(n => n.includes("gemini")));
}
test();
