class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;
    private listeners: ((message: any) => void)[] = [];
    private reconnectInterval = 3000;
    private isManuallyClosed = false;

    private constructor() {}

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            // console.log("⚠️ WebSocket already connected or connecting...");
            return; 
        }

        this.isManuallyClosed = false;
        this.ws = new WebSocket("ws://localhost:85/ws");

        this.ws.onopen = () => {
            // console.log("🔗 WebSocket connected!");
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log("📩 Received WebSocket message:", data);
            this.listeners.forEach((listener) => listener(data));
        };

        this.ws.onclose = () => {
            // console.warn("❌ WebSocket disconnected!");
            this.ws = null;

            if (!this.isManuallyClosed) {
                setTimeout(() => this.connect(), this.reconnectInterval);
                // console.log("♻️ Reconnecting...");
            }
        };

        this.ws.onerror = (error) => {
            // console.error("⚠️ WebSocket error:", error);
        };
    }

    public disconnect() {
        this.isManuallyClosed = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("📤 Sending message:", message);
            this.ws.send(JSON.stringify(message));
        } else {
            console.error("🚫 WebSocket is not connected! Message not sent.");
        }
    }

    public addListener(callback: (message: any) => void) {
        if (!this.listeners.includes(callback)) {
            console.log("📌 Adding listener", callback);
            this.listeners.push(callback);
        }
    }

    public removeListener(callback: (message: any) => void) {
        console.log("🗑️ Removing listener", callback);
        this.listeners = this.listeners.filter((listener) => listener !== callback);
    }
}

export default WebSocketService.getInstance();
