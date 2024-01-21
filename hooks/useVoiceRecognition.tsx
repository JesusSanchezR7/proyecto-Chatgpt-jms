import Voice, { SpeechErrorEvent, SpeechResultsEvent,} from "@react-native-voice/voice";
import { useState, useEffect, useCallback } from "react";

interface IState {
    recognized: string;
    pitch: string;
    error: string;
    end: string;
    started: string;
    results: string[];
    partialResults: string[];
    isRecording: boolean;
}

export const useVoiceRecognition = () => {
    const [State, setState] = useState<IState>({
      recognized: "",
      pitch: "",
      error: "",
      end: "",
      started: "",
      results: [],
      partialResults: [],
      isRecording: false,
    })

    const resetState = useCallback(() => {
        setState({
          recognized: "",
          pitch: "",
          error: "",
          started: "",
          results: [],
          partialResults: [],
          end: "",
          isRecording: false,
        });
    }, [setState]);
    
    const startRecognizing = useCallback(async () => {
        resetState();
        try {
            await Voice.start("en-US");
        } catch (e) {
            console.error(e);
        }
    }, [resetState]);  // --
     
    const stopRecognizing = useCallback(async () => {
        try {
            await Voice.stop(); // Invoca la función Voice.stop
        } catch (e) {
            console.error(e);
        }
    }, []);   

    const cancelRecognizing = useCallback(async () => {
    try {
        await Voice.cancel();
    } catch (e) {
        console.error(e);
    }
    }, []);
  
    const destroyRecognizer = useCallback(async () => {
    try {
        await Voice.destroy();
    } catch (e) {
        console.error(e);
    }
    resetState();
    }, [resetState]);


    useEffect(() => {
        Voice.onSpeechStart = (e:any) => {
            setState((prevState) => ({
            ...prevState,
            started: "☑",
            isRecording: false,
            }));
        }

        Voice.onSpeechRecognized = () => { 
            setState((prevState) => ({ ...prevState, recognized: "☑"}));  
        }

        Voice.onSpeechEnd = (e: any) => {
            setState((prevState) => ({ ...prevState, end: "☑", isRecording: true }));
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
        setState((prevState) => ({
            ...prevState,
            error: JSON.stringify(e.error),
            isRecording: false,
        }));
        };

        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value) {
            setState((prevState) => ({ ...prevState, results: e.value! }));
        }
        };

        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
        if (e.value) {
            setState((prevState) => ({ ...prevState, partialResults: e.value! }));
        }
        };

        Voice.onSpeechVolumeChanged = (e: any) => {
        setState((prevState) => ({ ...prevState, pitch: e.value }));
        };

        
        return () => {
        Voice.destroy().then(Voice.removeAllListeners);
        };

    }, [])

    return {
        State,
        setState,
        resetState,
        startRecognizing,
        stopRecognizing,
        cancelRecognizing,
        destroyRecognizer,
    }      

}