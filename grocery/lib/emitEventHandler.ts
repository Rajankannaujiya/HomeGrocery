
export async function emitEventHandler(event:string, data:any, userId?: string){
    const wsData = {
        type: event,
        data: data,
        userId: userId
    }
    console.log(wsData);
    try {
        await fetch(`${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER}/notify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(wsData)
        })
    } catch (error) {
        console.log(error);
    }
}