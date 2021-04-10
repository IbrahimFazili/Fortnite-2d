import adapter from 'webrtc-adapter';

const ICE_SERVERS = [
    { url: 'stun:stun.l.google.com:19302' },
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'stun:stun2.l.google.com:19302' },
    { url: 'stun:stun3.l.google.com:19302' },
    { url: 'stun:stun4.l.google.com:19302' },
];

const LOG_LEVELS = {
    'low': 'background-color: none;',
    'med': 'background-color: yellow;',
    'high': 'background-color: red;'
}

class RTCPeer {

    /**
     * @param {string} username unique identifier for peer
     * @param {boolean} shouldCreateOffer whether to create the connection offer
     * @param {RTCConnectionHandler} rtcConnHandler Handler which manages this peer
     */
    constructor(username, shouldCreateOffer, rtcConnHandler) {
        this.username = username;
        this.shouldCreateOffer = shouldCreateOffer;
        this.rtcConnHandler = rtcConnHandler;
        this.rtcConn = this._initRTCPeerConnection();
        if (this.shouldCreateOffer) this._createOffer();
    }

    /**
     * init the RTCPeerConnection for this peer
     * @returns {RTCPeerConnection}
     */
    _initRTCPeerConnection() {
        const c = new RTCPeerConnection({ 'iceServers': ICE_SERVERS });
        c.onicecandidate = (ev) => {
            if (ev.candidate) {
                this.rtcConnHandler.sendICECandidates(this.username, ev);
            }
        }

        c.ontrack = this._handleOnTrack.bind(this);
        c.addTrack(this.rtcConnHandler.userMedia.getAudioTracks()[0]);
        c.addEventListener('connectionstatechange', (ev) => this._handleConnectionStateChange(ev));

        return c;
    }

    closeConnection() {
        this.rtcConn.close();
    }

    /**
     * Create offer for connection with this peer
     */
    async _createOffer() {
        const rtcSdpInit = await this.rtcConn.createOffer();
        await this.rtcConn.setLocalDescription(rtcSdpInit);
        this.rtcConnHandler.sendSessionDescription(this.rtcConn.localDescription.toJSON(), this.username);
    }

    /**
     * Handle incoming session description from this peer
     * @param {JSON} desc Session description init dict
     */
    async handleSessionDescription(desc) {
        try {
            const sessionDescription = new RTCSessionDescription(desc);
            await this.rtcConn.setRemoteDescription(sessionDescription);
            if (sessionDescription.type === 'offer') {
                const rtcSdpInit = await this.rtcConn.createAnswer();
                await this.rtcConn.setLocalDescription(rtcSdpInit);
                this.rtcConnHandler.sendSessionDescription(
                    this.rtcConn.localDescription.toJSON(),
                    this.username
                );
            }
        } catch (error) {
            console.log(error);
            return;
        }

    }

    handleIceCandidate(iceCandidate) {
        this.rtcConn.addIceCandidate(new RTCIceCandidate(iceCandidate));
    }

    /**
     * handle new track coming from this peer
     * @param {RTCTrackEvent} ev 
     */
    _handleOnTrack(ev) {
        const audioElement = document.createElement('audio');
        audioElement.srcObject = new MediaStream([ev.track]);
        audioElement.autoplay = true;
        audioElement.play();
    }

    /**
     * Handle connection state change for this RTCPeerConnection, cleanup on failure
     * @param {Event} ev 
     */
    _handleConnectionStateChange(ev) {
        const state = this.rtcConn.connectionState;
        console.log(`%c voice state ${state}`, LOG_LEVELS.low);
        const badStates = { 'closed': 0, 'failed': 0, 'disconnected': 0 };
        if (state in badStates) {
            console.log(`%c connection closd with state ${state} with ${this.username}`, LOG_LEVELS.high);
            this.rtcConn.close();
            delete this.rtcConnHandler.peerConnections[this.username];
        }
    }

}

/**
 * Class to handle all Voice Chat/WebRTC related events
 */
export class RTCConnectionHandler {
    /**
     * @param {WebSocket} ws
     * @param {function():void} onMediaCaptured
     */
    constructor(ws, onMediaCaptured = undefined) {
        /**
         * Map of peer usernames to their WebRTC connections
         * @type { { [Key: string]: RTCPeer } }
         * */
        this.peerConnections = {};
        this._ws = ws;
        /** @type {MediaStream} voice capture of user */
        this.userMedia = null;
        this.onMediaCaptured = onMediaCaptured;
        this.captureMedia();
    }

    captureMedia() {
        this._getUserMedia()
            .then((v) => {
                this.userMedia = v;
                this.onMediaCaptured && this.onMediaCaptured();
            })
            .catch((err) => console.log(`%c ${err}`, LOG_LEVELS.high));
    }

    terminateConnections() {
        for (const peer in this.peerConnections) {
            const peerConn = this.peerConnections[peer];
            peerConn.closeConnection();
        }

        this.userMedia && this.userMedia.getTracks().forEach((v) => v.stop());

        this.peerConnections = {};
    }

    /**
     * send an event to the signalling server
     * @param {*} props props (JSON object) to send as part of the event
     */
    _emitEvent(props) {
        const obj = {
            type: 'Voice',
        };
        for (const key in props) {
            const val = props[key];
            obj[key] = val;
        }

        this._ws.send(JSON.stringify(obj));
    }

    /**
     * Handle incoming payload of type 'Voice'
     * @param {*} data incoming payload of type 'Voice'
     */
    handleConnectionData(data) {
        if (data.action === 'addPeer') this._handleAddPeer(data);
        if (data.action === 'ICEcandidates') this._handleICEcandidates(data);
        if (data.action === 'SessionDescription') this._handleSDP(data);
    }

    /**
     * handle add peer request
     * @param {*} data incoming payload from server
     */
    _handleAddPeer(data) {
        if (data.peerName in this.peerConnections) {
            this.peerConnections[data.peerName].closeConnection();
            delete this.peerConnections[data.peerName];
        }

        this.peerConnections[data.peerName] = new RTCPeer(
            data.peerName,
            data.shouldCreateOffer,
            this
        );
    }

    /**
     * handle incoming ICE candidates from another peer
     * @param {*} data payload containing ICE candidates
     */
    _handleICEcandidates(data) {
        if (!(data.peerName in this.peerConnections)) return;
        this.peerConnections[data.peerName].handleIceCandidate(data.iceCandidate);
        return;
    }

    /**
     * handle incoming session description from another peer
     * @param {*} data payload containing other peer's session description
     */
    _handleSDP(data) {
        if (!(data.peerName in this.peerConnections)) return;
        this.peerConnections[data.peerName].handleSessionDescription(data.sessionDescription);
    }

    _getUserMedia() {
        const constraints = {
            'audio': true,
            'video': false
        }

        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {

                // First get ahold of the legacy getUserMedia, if present
                var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                // Some browsers just don't implement it - return a rejected promise with an error
                // to keep a consistent interface
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }

        var mediaObject = navigator.mediaDevices.getUserMedia(constraints);

        return mediaObject;
    }

    /**
     * Send our session description to the signalling server
     * @param {JSON} sdp the session description to send
     * @param {string} peerName the peer this session description is intended
     */
    sendSessionDescription(sdp, peerName) {
        const event = {
            action: 'SessionDescription',
            peerName,
            sessionDescription: sdp
        };

        this._emitEvent(event);
    }

    /**
     * 
     * @param {string} peerName 
     * @param {RTCPeerConnectionIceEvent} ev 
     */
    sendICECandidates(peerName, ev) {
        const event = {
            action: 'ICEcandidates',
            peerName,
            iceCandidate: {
                'sdpMLineIndex': ev.candidate.sdpMLineIndex,
                'candidate': ev.candidate.candidate
            }
        };

        this._emitEvent(event);
    }
}

