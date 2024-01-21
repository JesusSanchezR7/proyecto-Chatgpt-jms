const fetchAudio = async (text: string) => {
    // http://localhost:/3000/text-to-speech/synthesize 
    const response = await fetch(process.env.GOOGLE_APPLICATION_CREDENTIALS!,{
       method: "POST",
       headers: {"Content-Type": "application/json" },
       body: JSON.stringify({ text })
    })
    return await response.blob()
}