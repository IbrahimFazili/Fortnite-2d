
/**
 * Bind listeners needed to establist WebRTC peer connection between all peers
 * for this client
 * @param {WebSocket} ws current user's websocket connection
 * @param {{ [Key: string]: { ws: WebSocket } }} clients client map
 */
function handleVoiceChatConnectionAttempt(ws, clients, data) {
    if (!data.action) return;

    if (data.action === 'Join') _handleJoinAction(ws, clients);
    if (data.action === 'Leave') return;
    if (data.action === 'ICEcandidates') _handleICEcandidates(ws, clients, data);
    if (data.action === 'SessionDescription') _handleSDPAction(ws, clients, data);
}

/**
 * Client is attemting to join the voice channel, let other clients know
 * about this
 * @param {WebSocket} ws 
 * @param {{ [Key: string]: { ws: WebSocket } }} clients 
 */
function _handleJoinAction(ws, clients) {
    for (const u in clients) {
        const clientWS = clients[u].ws;
        clientWS.send(JSON.stringify({
            type: 'Voice',
            action: 'addPeer',
            shouldCreateOffer: false,
            peerName: ws.username
        }));

        ws.send(JSON.stringify({
            type: 'Voice',
            action: 'addPeer',
            shouldCreateOffer: true,
            peerName: u
        }));
    }
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {{ [Key: string]: { ws: WebSocket } }} clients
 * @param {*} data payload containing ICE candidates & relavant meta-data
 */
function _handleICEcandidates(ws, clients, data) {
    const peerName = data.peerName;
    const iceCandidate = data.iceCandidate;

    clients[peerName].ws.send(JSON.stringify({
        type: 'Voice',
        action: 'ICEcandidates',
        peerName: ws.username,
        iceCandidate,
    }));
}


/**
 * Client is sending session description, forward it to the target client
 * @param {WebSocket} ws 
 * @param {{ [Key: string]: { ws: WebSocket } }} clients
 * @param {*} data payload containing sdp data & relavant meta-data
 */
function _handleSDPAction(ws, clients, data) {
    const peerName = data.peerName;
    const sessionDescription = data.sessionDescription;
    const clientWS = clients[peerName].ws;

    clientWS.send(JSON.stringify({
        type: 'Voice',
        action: 'SessionDescription',
        peerName: ws.username,
        sessionDescription
    }));
}

module.exports.handleVoiceChatConnectionAttempt = handleVoiceChatConnectionAttempt;
