import { createSignal, Show } from "solid-js";
import { fetch } from "@tauri-apps/plugin-http";
import * as auth from "./auth";
import "./App.css";

// @ts-ignore
window.process = {
  env: {}
}

function App() {
  const [token, setToken] = createSignal<string | undefined>();
  const [json, setJson] = createSignal<string | undefined>();

  async function login() {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setToken(await auth.authorize());
      localStorage.setItem("token", token() as string);
    } else {
      setToken(stored);
    }
  }

  async function getToken() {
    const locationResponse = await fetch(
      "https://connect.squareupsandbox.com/v2/locations",
      {
        headers: {
          "Square-Version": "2025-05-21",
          "Authorization": `Bearer ${token()}`,
          "Content-Type": "application/json",
          "Origin": ""
        },
        method: "GET"
      }
    );
    const locationJson = await locationResponse.json();
    console.log(locationJson);
    const locationId = locationJson["locations"][0]["id"];
    const ordersResponse = await fetch(
      "https://connect.squareupsandbox.com/v2/orders/search",
      {
        headers: {
          "Square-Version": "2025-05-21",
          "Authorization": `Bearer ${token()}`,
          "Content-Type": "application/json",
          "Origin": ""
        },
        method: "POST",
        body: JSON.stringify({ location_ids: [locationId] })
      }
    );
    const ordersJson = await ordersResponse.json();
    
    setJson(JSON.stringify(ordersJson));
  }

  return (
    <main class="container">
      <h1>Welcome to Kvadrato (esperanto for square)</h1>
      <button type="button" onClick={login}>Login</button>
      <br/>
      <button type="button" onClick={getToken}>Get Token</button>
      <br/>
      <Show when={token()}>
        <p>
          Your API token is <code>{token()}</code>
        </p>
      </Show>
      <Show when={json}>
        <code>
          {json()}
        </code>
      </Show>
    </main>
  );
}

export default App;
