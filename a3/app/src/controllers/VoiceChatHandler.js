
const ICE_SERVERS = {
    urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302'
    ]
};

/**
 * Class to handle all Voice Chat/WebRTC related events
 */
class RTCConnectionHandler {
    constructor() {
        /**
         * Map of peer usernames to their WebRTC connections
         * @type { { [Key: string]: RTCPeerConnection } }
         * */
        this.peerConnections = {};
    }

    /**
     * Handle incoming payload of type 'Voice'
     * @param {*} data incoming payload of type 'Voice'
     */
    handleConnectionData(data) {
        if (data.action === 'addPeer') return;
        if (data.action === 'ICEcandidates') return;
        if (data.action === 'SessionDescription') return;
    }

    /**
     * handle add peer request
     * @param {*} data incoming payload from server
     */
    _handleAddPeer(data) {
        return;
    }

    /**
     * handle incoming ICE candidates from another peer
     * @param {*} data payload containing ICE candidates
     */
    _handleICEcandidates(data) {
        return;
    }

    /**
     * handle incoming session description from another peer
     * @param {*} data payload containing other peer's session description
     */
    _handleSDP(data) {
        return;
    }
}

