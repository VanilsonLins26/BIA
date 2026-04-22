async function test() {
  const KEY = "AIzaSyAZxQPV-7GwZYz_GguAZ-jT7u3KsyAoFYg";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
