import { start, cancel, onUrl } from '@fabianlars/tauri-plugin-oauth';
import { fetch } from "@tauri-apps/plugin-http";
import { openUrl } from "@tauri-apps/plugin-opener"

const CLIENT_ID = import.meta.env.VITE_SQUARE_CLIENT_ID;
const SQUARE_API_HOSTNAME = import.meta.env.VITE_SQUARE_API_HOSTNAME;

const dec2hex = (dec: number) => dec.toString(16).padStart(2, "0");

const sha256 = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    return await window.crypto.subtle.digest("SHA-256", data);
}

const b64encode = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    const text = Array
        .from(bytes)
        .map(b => String.fromCharCode(b))
        .join("");
    const base64 = btoa(text);
    const urlSafeBase64 = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return urlSafeBase64;
}

const randomString = () => {
    const buffer = new Uint32Array(28);
    window.crypto.getRandomValues(buffer);
    return Array.from(buffer, dec2hex).join("");
}

export async function authorize() {
    const port = await start();
    const redirectUri = `http://localhost:${port}`;
    console.log(`OAuth server started on port ${port}`);

    const token$ = Promise.withResolvers<string>();
    await onUrl(async url => {
        console.log('recieved oauth url:', url);
        const query = new URL(url).searchParams;
        const response = await fetch(`https://${SQUARE_API_HOSTNAME}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                code: query.get("code"),
                client_id: CLIENT_ID,
                redirect_uri: `${redirectUri}`,
                code_verifier: localStorage.getItem("pkceCodeVerifier")
            })
        });
        const json = await response.json();
        console.log(json);
        token$.resolve(json["access_token"]);
    });

    const state = randomString();
    const codeVerifier = randomString();
    const codeChallenge = b64encode(await sha256(codeVerifier));
    localStorage.setItem("pkceState", state);
    localStorage.setItem("pkceCodeVerifier", codeVerifier);
    const url = `https://${SQUARE_API_HOSTNAME}/oauth2/authorize`
        + "?response_type=code"
        + `&client_id=${CLIENT_ID}`
        + "&session=false"
        + "&scope=MERCHANT_PROFILE_READ+ORDERS_READ"
        + `&state=${state}`
        + `&redirect_uri=${redirectUri}`
        + `&code_challenge=${codeChallenge}`
        + "&code_challenge_method=S256";
    await openUrl(url);
    const token = await token$.promise;
    try {
        await cancel(port);
    } catch (err) {
        console.error(err);
    }
    return token;
}