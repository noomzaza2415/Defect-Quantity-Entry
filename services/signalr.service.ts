import * as signalR from "@microsoft/signalr";

const REALTIME_API = process.env.NEXT_PUBLIC_REALTIME_API;

export const connectionD1 = new signalR.HubConnectionBuilder()
  .withUrl(`${REALTIME_API}/hubs/d1`, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000])
  .configureLogging(signalR.LogLevel.Information)
  .build();

export const connectionD2 = new signalR.HubConnectionBuilder()
  .withUrl(`${REALTIME_API}/hubs/d2`, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000])
  .configureLogging(signalR.LogLevel.Information)
  .build();

export const connectionD3 = new signalR.HubConnectionBuilder()
  .withUrl(`${REALTIME_API}/hubs/d3`, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000])
  .configureLogging(signalR.LogLevel.Information)
  .build();

export async function startConnections() {
  try {
    if (
      connectionD1.state === signalR.HubConnectionState.Disconnected
    ) {
      await connectionD1.start();
      console.log("✅ D1 Connected");
    }

    if (
      connectionD2.state === signalR.HubConnectionState.Disconnected
    ) {
      await connectionD2.start();
      console.log("✅ D2 Connected");
    }

    if (
      connectionD3.state === signalR.HubConnectionState.Disconnected
    ) {
      await connectionD3.start();
      console.log("✅ D3 Connected");
    }
  } catch (error) {
    console.error("❌ SignalR Error:", error);
    setTimeout(startConnections, 5000);
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