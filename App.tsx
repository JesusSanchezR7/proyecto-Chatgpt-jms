import { useEffect, useState } from 'react';
import { StyleSheet, Text, View , Pressable, Image, Platform } from 'react-native';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { writeAudioToFile } from './utils/writeAudioToFile';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

export default function App() {
  const [borderColor, setBorderColor] = useState<"lightgray" | "lightblue">("lightgray");
  const [urlPath, setUrlPath] = useState("");
  const { State, startRecognizing, stopRecognizing, destroyRecognizer } = useVoiceRecognition(); 

  useEffect(() => {
    listFiles();
  }, []);

  const listFiles = async () => {
    try {
      if (Platform.OS !== 'web') {
        const result = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
        if (result.length > 0) {
          const filename = result[0];
          const path = FileSystem.documentDirectory + filename;
          setUrlPath(path);
          console.log(path);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleSubmit = async () => {
    if (!State.results[0]) return;

    try {
      const audioBlob = await fetchAudio(State.results[0])

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && typeof e.target.result === "string") {
          const audioData = e.target.result.split(",")[1];
          const path = await writeAudioToFile(audioData);
          
          await playFromPath(path);
          destroyRecognizer(); 
        }
      }
      reader.readAsDataURL(audioBlob)
    } catch (e) {
      console.log(e)
    }
  }

  const fetchAudio = async (text: string) => {
    const response = await fetch(
      "http://localhost:3000/text-to-speech/synthesize",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    return await response.blob();
  };

  async function playFromPath(path: string) {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: path });
      await soundObject.playAsync();
    } catch (error) {
      console.log("Se produjo un error al reproducir el audio:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 32, fontWeight:"bold", color:"#cd1818"}}>
        --| 📢 Talk GPT 🤖 |--
      </Text>
          
      <Text
        style={{
          textAlign: "center",
          marginBottom: 5,
          fontSize: 12,
        }}
      >
        Mantenga presionado este botón para grabar su voz.
        Si envía la grabación, escucharás una respuesta.
      </Text>
      <Text style={{ marginVertical: 10, fontSize: 17}}> Mensaje:</Text>
     
      <Pressable 
        onPressIn={() => {
          setBorderColor("lightblue");
          startRecognizing();
        }}
        onPressOut={() => {
          setBorderColor("lightgray");
          stopRecognizing();
          handleSubmit(); // Llama a handleSubmit al soltar el botón
        }}
        style={{
          width: "90%",
          padding: 30,
          gap: 10,
          borderWidth: 3,
          alignItems: "center",
          borderRadius: 10,
          borderColor: borderColor        
        }}
      >
        <Text style={{color:"#000000"}}> {State.isRecording ? "Liberar para enviar": "Mantener presionado para hablar" }</Text>
        <Image style={styles.button} source={require("./assets/micro.png")} />
      </Pressable>
      
      <Text style={{ marginVertical: 10, fontSize: 17}}>{JSON.stringify(State, null, 2)}</Text> 
      
      <Pressable 
        onPress={async () => {
          await playFromPath(urlPath)
        }}
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10
        }}
      >
        <Text style={{color: 'white'}}>Ultimo Mensaje</Text>
      </Pressable>
      
      <Text style={{fontSize:10, fontWeight:"bold"}}>Jesus Manuel Sanchez IDGS</Text> 
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
});
