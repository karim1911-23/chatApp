import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import socket from '../../lib/socket';

interface CallComponentProps {
  userId: string;
  targetUserId: string;
  isVideo: boolean;
  onEndCall: () => void;
}

const CallComponent: React.FC<CallComponentProps> = ({ userId, targetUserId, isVideo, onEndCall }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');

  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance>();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ 
      video: isVideo, 
      audio: true 
    })
    .then((stream) => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    })
    .catch(err => {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/microphone");
      onEndCall();
    });

    // Listen for incoming calls
    socket.on('incoming-call', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
      setCallStatus('ringing');
    });

    // Listen for call answers
    socket.on('call-answered', (data) => {
      if (connectionRef.current) {
        connectionRef.current.signal(data.signal);
        setCallAccepted(true);
        setCallStatus('connected');
      }
    });

    // Listen for call rejections
    socket.on('call-rejected', () => {
      alert('Call was rejected');
      endCall();
    });

    // Listen for call ends
    socket.on('call-ended', () => {
      endCall();
    });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [isVideo]);

  const callUser = () => {
    setCallStatus('calling');
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!
    });

    peer.on('signal', (data) => {
      socket.emit('call-user', {
        to: targetUserId,
        signal: data,
        from: userId,
        type: isVideo ? 'video' : 'audio'
      });
    });

    peer.on('stream', (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setCallStatus('connected');
    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!
    });

    peer.on('signal', (data) => {
      socket.emit('answer-call', { 
        signal: data, 
        to: caller 
      });
    });

    peer.on('stream', (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const rejectCall = () => {
    socket.emit('reject-call', { to: caller });
    setReceivingCall(false);
    setCallStatus('idle');
    onEndCall();
  };

  const endCall = () => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    stream?.getTracks().forEach(track => track.stop());
    socket.emit('end-call', { to: targetUserId });
    setCallAccepted(false);
    setReceivingCall(false);
    setCallStatus('idle');
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 p-4 rounded-lg">
        {/* Call status indicator */}
        {callStatus === 'calling' && (
          <div className="mb-4 text-center">
            <p className="text-lg">Calling...</p>
          </div>
        )}
        
        {/* Incoming call UI */}
        {receivingCall && !callAccepted && (
          <div className="mb-4 text-center">
            <h2 className="text-xl mb-2">Incoming {isVideo ? 'Video' : 'Voice'} Call</h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={answerCall} 
                className="bg-green-500 px-4 py-2 rounded"
              >
                Accept
              </button>
              <button 
                onClick={rejectCall} 
                className="bg-red-500 px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {stream && (
            <video
              playsInline
              muted
              ref={userVideo}
              autoPlay
              className="w-64 h-48 bg-black"
            />
          )}
          {callAccepted && (
            <video
              playsInline
              ref={partnerVideo}
              autoPlay
              className="w-64 h-48 bg-black"
            />
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {!callAccepted && !receivingCall && callStatus === 'idle' && (
            <button
              onClick={callUser}
              className="bg-green-500 px-4 py-2 rounded"
            >
              {isVideo ? 'Video Call' : 'Voice Call'}
            </button>
          )}
          <button
            onClick={endCall}
            className="bg-red-500 px-4 py-2 rounded"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallComponent;