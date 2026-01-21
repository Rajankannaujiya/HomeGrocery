import { setConnected, setDisconnected } from "@/app/redux/slices/userSlice";

let socket: WebSocket | null = null;

export const getSocket = (dispatch: any, userData: any) => {
    const URL = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER;
    if (!URL) return null;

    if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(URL);

        socket.onopen = () => {
            console.log('✅ WS Connected');
            dispatch(setConnected());
            if (userData) {
                socket?.send(JSON.stringify({
                    type: "identity",
                    userId: userData.id
                }));
            }
        };

        socket.onclose = () => {
            console.log('❌ WS Disconnected');
            dispatch(setDisconnected());
        };

        socket.onerror = (err) => {
            console.error('⚠️ WS Error:', err);
            dispatch(setDisconnected());
        };
    }
    return socket;
};