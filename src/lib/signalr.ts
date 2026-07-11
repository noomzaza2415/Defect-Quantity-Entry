import * as signalR from "@microsoft/signalr";

const REALTIME_API = process.env.NEXT_PUBLIC_REALTIME_API;

const createConnection = (hub: string) =>
  new signalR.HubConnectionBuilder()
    .withUrl(`${REALTIME_API}/hubs/${hub}`, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

export const connectionD1 = createConnection("d1");
export const connectionD2 = createConnection("d2");
export const connectionD3 = createConnection("d3");

export async function startConnections() {
  const connections = [
    connectionD1,
    connectionD2,
    connectionD3,
  ];

  for (const connection of connections) {
    try {
      if (
        connection.state !== signalR.HubConnectionState.Connected &&
        connection.state !== signalR.HubConnectionState.Connecting
      ) {
        await connection.start();
        console.log(`✅ Connected : ${connection.baseUrl}`);
      }
    } catch (err) {
      console.error("SignalR Error:", err);
    }
  }
}

connectionD1.onreconnecting(() => {
  console.log("🔄 D1 Reconnecting...");
});

connectionD1.onreconnected(() => {
  console.log("✅ D1 Reconnected");
});

connectionD2.onreconnecting(() => {
  console.log("🔄 D2 Reconnecting...");
});

connectionD2.onreconnected(() => {
  console.log("✅ D2 Reconnected");
});

connectionD3.onreconnecting(() => {
  console.log("🔄 D3 Reconnecting...");
});

connectionD3.onreconnected(() => {
  console.log("✅ D3 Reconnected");
});