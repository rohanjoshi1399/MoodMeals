"use client";

import React, { useState, useRef } from "react";
import styles from "./MoodInput.module.css";

interface VoiceRecorderProps {
    onRecordingComplete: (base64Data: string, mimeType: string) => void;
    onRecordingStart?: () => void;
    disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
    onRecordingComplete, 
    onRecordingStart,
    disabled 
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // base64data is something like "data:audio/webm;codecs=opus;base64,GkXfo..."
                    // We just want the base64 part
                    const base64 = base64data.split(",")[1];
                    onRecordingComplete(base64, mediaRecorder.mimeType);
                };
                
                // Stop all tracks in the stream to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            if (onRecordingStart) onRecordingStart();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check your browser permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className={styles.voiceRecorder}>
            <button
                type="button"
                className={`${styles.recordBtn} ${isRecording ? styles.recording : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
            >
                {isRecording ? "⏹️ Stop Recording" : "🎤 Start Voice Log"}
            </button>
            {isRecording && <span className={styles.recordingPulse}></span>}
        </div>
    );
};

export default VoiceRecorder;
