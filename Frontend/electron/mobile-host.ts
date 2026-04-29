import { app, type BrowserWindow } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import os from "node:os";
import { URL } from "node:url";
import WebSocket, { WebSocketServer } from "ws";
import {
  createEmptyDraftSessionSyncState,
  createEmptyMobileSyncSnapshot,
  type MobileSyncSnapshot,
  type MobileSyncWireMessage,
} from "../src/sync/mobileSync";

export interface MobileHostStatus {
  running: boolean;
  port: number | null;
  sessionId: string | null;
  draftActive: boolean;
  activeStudyLabel: string;
  organization: string | null;
  pairingCode: string | null;
  startedAt: string | null;
  clients: number;
  addresses: string[];
  httpUrl: string | null;
  wsUrl: string | null;
}

type PairPayload = {
  code?: string;
};

type PersistedMobileSyncState = {
  sessionId: string | null;
  pairingCode: string | null;
  startedAt: string | null;
  syncState: MobileSyncSnapshot;
};

const DEFAULT_PORT = 38241;
const MAX_PORT_ATTEMPTS = 10;
const RENDERER_CHANNEL = "mobile-host:sync-message";

function generatePairingCode(): string {
  return String(randomInt(100000, 1000000));
}

function generateSessionId(): string {
  return `${Date.now()}-${randomInt(100000, 1000000)}`;
}

function getCurrentDate(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function getLocalIpv4Addresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses = new Set<string>();

  Object.values(interfaces).forEach((entries) => {
    entries?.forEach((entry) => {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.add(entry.address);
      }
    });
  });

  return [...addresses];
}

function readJsonBody(req: IncomingMessage): Promise<PairPayload | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")) as PairPayload;
        resolve(parsed);
      } catch {
        resolve(null);
      }
    });

    req.on("error", () => resolve(null));
  });
}

function writeJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.end(JSON.stringify(payload));
}

class MobileHostService {
  private httpServer: ReturnType<typeof createServer> | null = null;

  private wsServer: WebSocketServer | null = null;

  private runningPort: number | null = null;

  private sessionId: string | null = null;

  private pairingCode: string | null = null;

  private startedAt: string | null = null;

  private clients = new Set<WebSocket>();

  private rendererWindow: BrowserWindow | null = null;

  private syncState: MobileSyncSnapshot = createEmptyMobileSyncSnapshot();

  private persistencePath: string | null = null;

  private get statusSnapshot(): MobileHostStatus {
    const addresses = this.runningPort ? getLocalIpv4Addresses() : [];
    const httpUrl =
      this.runningPort && addresses.length > 0
        ? `http://${addresses[0]}:${this.runningPort}`
        : null;
    const sessionId = this.sessionId ?? this.syncState.session.sessionId;

    return {
      running: this.runningPort !== null,
      port: this.runningPort,
      sessionId,
      draftActive: this.syncState.session.isDraftActive,
      activeStudyLabel: this.syncState.session.activeStudyLabel,
      organization: this.syncState.header.organization || null,
      pairingCode: this.pairingCode,
      startedAt: this.startedAt ?? this.syncState.session.startedAt,
      clients: this.clients.size,
      addresses,
      httpUrl,
      wsUrl:
        this.runningPort && addresses.length > 0
          ? `ws://${addresses[0]}:${this.runningPort}`
          : null,
    };
  }

  async start(preferredPort = DEFAULT_PORT): Promise<MobileHostStatus> {
    if (this.httpServer) {
      return this.getStatus();
    }

    await this.loadPersistedState();

    const portsToTry = Array.from(
      { length: MAX_PORT_ATTEMPTS },
      (_, index) => preferredPort + index,
    );

    let lastError: unknown;

    for (const port of portsToTry) {
      try {
        await this.listenOnPort(port);
        return this.getStatus();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Unable to start mobile host service");
  }

  stop(): void {
    this.clients.forEach((client) => {
      try {
        client.close(1001, "Host stopped");
      } catch {
        // Ignore client shutdown errors.
      }
    });
    this.clients.clear();

    this.wsServer?.close();
    this.wsServer = null;

    this.httpServer?.close();
    this.httpServer = null;

    this.runningPort = null;
    this.sessionId = null;
    this.pairingCode = null;
    this.startedAt = null;
    this.syncState = createEmptyMobileSyncSnapshot();
  }

  getStatus(): MobileHostStatus {
    return this.statusSnapshot;
  }

  setRendererWindow(window: BrowserWindow | null): void {
    this.rendererWindow = window;
  }

  publishSyncMessage(message: MobileSyncWireMessage): void {
    if (message.type === "sync:update") {
      this.applyUpdate(message);
    } else if (message.type === "sync:snapshot") {
      this.syncState = message.state;
    } else if (message.type === "sync:command") {
      this.broadcastSyncMessage(message);
      this.applyCommand(message);
      this.broadcastSyncMessage({
        type: "sync:snapshot",
        state: this.syncState,
        origin: "desktop",
        updatedAt: message.updatedAt,
      });
      return;
    }

    void this.persistState();
    this.broadcastSyncMessage(message);
  }

  setProfile(profile: { organization?: string | null }): MobileHostStatus {
    const nextOrganization = profile.organization?.trim() ?? "";

    this.syncState = {
      ...this.syncState,
      header: {
        ...this.syncState.header,
        organization: nextOrganization,
      },
    };

    void this.persistState();
    this.broadcastSyncMessage({
      type: "sync:update",
      fragment: "header",
      data: { organization: nextOrganization },
      origin: "desktop",
      updatedAt: new Date().toISOString(),
    });

    return this.getStatus();
  }

  async restart(): Promise<MobileHostStatus> {
    this.stop();
    return this.start();
  }

  private async listenOnPort(port: number): Promise<void> {
    if (!this.sessionId) {
      this.sessionId = generateSessionId();
    }
    if (!this.pairingCode) {
      this.pairingCode = generatePairingCode();
    }
    if (!this.startedAt) {
      this.startedAt = new Date().toISOString();
    }

    const server = createServer(async (req, res) => {
      this.applyCorsHeaders(res);

      if (!req.url) {
        writeJson(res, 400, {
          success: false,
          message: "Missing request URL",
        });
        return;
      }

      const requestUrl = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === "GET" && requestUrl.pathname === "/health") {
        writeJson(res, 200, {
          success: true,
          status: this.getStatus(),
        });
        return;
      }

      if (req.method === "GET" && requestUrl.pathname === "/session") {
        writeJson(res, 200, {
          success: true,
          status: this.getStatus(),
        });
        return;
      }

      if (req.method === "POST" && requestUrl.pathname === "/pair") {
        const payload = await readJsonBody(req);
        if (!payload?.code || payload.code !== this.pairingCode) {
          writeJson(res, 401, {
            success: false,
            message: "Invalid pairing code",
          });
          return;
        }

        writeJson(res, 200, {
          success: true,
          sessionId: this.sessionId,
          status: this.getStatus(),
        });
        return;
      }

      writeJson(res, 404, {
        success: false,
        message: "Not found",
      });
    });

    const wsServer = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      if (!req.url) {
        socket.destroy();
        return;
      }

      const requestUrl = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
      if (requestUrl.pathname !== "/ws") {
        socket.destroy();
        return;
      }

      const code = requestUrl.searchParams.get("code");
      if (code !== this.pairingCode) {
        socket.destroy();
        return;
      }

      wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit("connection", ws, req);
      });
    });

    wsServer.on("connection", (socket: WebSocket) => {
      this.clients.add(socket);
      this.sendStatus(socket);
      this.sendSnapshot(socket);

      socket.on("message", (raw) => {
        const messageText = raw.toString();

        if (messageText === "ping") {
          socket.send("pong");
          return;
        }

        try {
          const message = JSON.parse(messageText) as MobileSyncWireMessage | { type?: string };
          if (message.type === "sync:update") {
            this.publishSyncMessage(
              message as Extract<MobileSyncWireMessage, { type: "sync:update" }>,
            );
            return;
          }

          if (message.type === "sync:command") {
            this.publishSyncMessage(
              message as Extract<MobileSyncWireMessage, { type: "sync:command" }>,
            );
            return;
          }

          if (message.type === "sync:requestState") {
            this.sendSnapshot(socket);
            return;
          }

          if (message.type === "ping") {
            socket.send(JSON.stringify({ type: "pong" }));
          }
        } catch {
          // Ignore malformed messages for now.
        }
      });

      socket.on("close", () => {
        this.clients.delete(socket);
      });

      socket.on("error", () => {
        this.clients.delete(socket);
      });
    });

    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        server.off("listening", onListening);
        reject(error);
      };

      const onListening = () => {
        server.off("error", onError);
        this.httpServer = server;
        this.wsServer = wsServer;
        this.runningPort = port;
        resolve();
      };

      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(port, "0.0.0.0");
    });
  }

  private applyCorsHeaders(res: ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  private sendStatus(socket: WebSocket): void {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "status",
        status: this.getStatus(),
      }),
    );
  }

  private sendSnapshot(socket: WebSocket): void {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "sync:snapshot",
        state: this.syncState,
        origin: "desktop",
        updatedAt: new Date().toISOString(),
      } satisfies MobileSyncWireMessage),
    );
  }

  private broadcastSyncMessage(message: MobileSyncWireMessage): void {
    const payload = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.readyState !== WebSocket.OPEN) {
        continue;
      }

      client.send(payload);
    }

    this.rendererWindow?.webContents.send(RENDERER_CHANNEL, message);
  }

  private applyUpdate(message: Extract<MobileSyncWireMessage, { type: "sync:update" }>): void {
    if (message.fragment === "selection") {
      this.syncState = {
        ...this.syncState,
        selection: {
          ...this.syncState.selection,
          ...message.data,
        },
      };
      return;
    }

    if (message.fragment === "header") {
      this.syncState = {
        ...this.syncState,
        header: {
          ...this.syncState.header,
          ...message.data,
        },
      };
      return;
    }

    if (message.data.mode === "replace") {
      this.syncState = {
        ...this.syncState,
        studiesData: { ...message.data.studiesData },
      };
      return;
    }

    if (message.data.mode === "set") {
      this.syncState = {
        ...this.syncState,
        studiesData: {
          ...this.syncState.studiesData,
          [message.data.studyType]: message.data.value,
        },
      };
      return;
    }

    const nextStudiesData = { ...this.syncState.studiesData };
    delete nextStudiesData[message.data.studyType];

    this.syncState = {
      ...this.syncState,
      studiesData: nextStudiesData,
    };
  }

  private applyCommand(message: Extract<MobileSyncWireMessage, { type: "sync:command" }>): void {
    if (message.command === "draft:save") {
      return;
    }

    if (message.command === "draft:saved") {
      return;
    }

    if (message.command === "draft:close") {
      this.closeDraftSession(message.updatedAt);
      return;
    }

    this.createDraftSession(message.studyLabel?.trim() ?? "", message.updatedAt);
  }

  private createDraftSession(studyLabel: string, updatedAt: string): void {
    const sessionId = generateSessionId();
    const startedAt = updatedAt || new Date().toISOString();
    const nextSnapshot = createEmptyMobileSyncSnapshot();
    const selectedLabel = studyLabel.trim();

    nextSnapshot.session = {
      ...createEmptyDraftSessionSyncState(),
      sessionId,
      activeStudyLabel: selectedLabel,
      isDraftActive: true,
      startedAt,
      updatedAt: startedAt,
    };

    nextSnapshot.header.researchDate = nextSnapshot.header.researchDate || getCurrentDate();

    if (selectedLabel) {
      nextSnapshot.selection = {
        ...nextSnapshot.selection,
        selectedStudy: selectedLabel,
        selectedStudies: [selectedLabel],
        isMultiSelectMode: false,
      };
      nextSnapshot.studiesData = {
        [selectedLabel]: {
          general: "",
          sections: {},
        },
      };
    }

    this.sessionId = sessionId;
    this.startedAt = startedAt;
    this.syncState = nextSnapshot;

    void this.persistState();
  }

  private closeDraftSession(updatedAt: string): void {
    this.sessionId = null;
    this.startedAt = null;
    this.syncState = createEmptyMobileSyncSnapshot();
    this.syncState.session = {
      ...createEmptyDraftSessionSyncState(),
      sessionId: null,
      isDraftActive: false,
      startedAt: updatedAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
    };

    void this.persistState();
  }

  private async loadPersistedState(): Promise<void> {
    try {
      if (!this.persistencePath) {
        this.persistencePath = path.join(app.getPath("userData"), "mobile-sync-session.json");
      }

      const raw = await fs.readFile(this.persistencePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<PersistedMobileSyncState>;

      if (parsed.syncState) {
        this.syncState = {
          ...createEmptyMobileSyncSnapshot(),
          ...parsed.syncState,
          selection: {
            ...createEmptyMobileSyncSnapshot().selection,
            ...(parsed.syncState.selection ?? {}),
          },
          header: {
            ...createEmptyMobileSyncSnapshot().header,
            ...(parsed.syncState.header ?? {}),
          },
          session: {
            ...createEmptyDraftSessionSyncState(),
            ...(parsed.syncState.session ?? {}),
          },
          studiesData: {
            ...(parsed.syncState.studiesData ?? {}),
          },
        };

        this.syncState.header.researchDate = this.syncState.header.researchDate || getCurrentDate();
      }

      this.sessionId = parsed.sessionId ?? this.syncState.session.sessionId;
      this.pairingCode = parsed.pairingCode ?? null;
      this.startedAt = parsed.startedAt ?? this.syncState.session.startedAt;
    } catch {
      // No persisted state yet.
    }
  }

  private async persistState(): Promise<void> {
    if (!this.persistencePath) {
      try {
        this.persistencePath = path.join(app.getPath("userData"), "mobile-sync-session.json");
      } catch {
        return;
      }
    }

    const payload: PersistedMobileSyncState = {
      sessionId: this.sessionId,
      pairingCode: this.pairingCode,
      startedAt: this.startedAt,
      syncState: this.syncState,
    };

    try {
      await fs.mkdir(path.dirname(this.persistencePath), { recursive: true });
      await fs.writeFile(this.persistencePath, JSON.stringify(payload, null, 2), "utf8");
    } catch {
      // Best-effort persistence.
    }
  }
}

const mobileHostService = new MobileHostService();

export function getMobileHostService(): MobileHostService {
  return mobileHostService;
}
