import { useState, useEffect, useRef } from "react";
import { Mic, Square, Trash2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAvatarRenderer } from "@/hooks/use-avatar-renderer";
import { toast } from "sonner";

// Speech recognition types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function Convert() {
    const [textInput, setTextInput] = useState("");
    const [processedText, setProcessedText] = useState("");
    const [playingText, setPlayingText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [containerElement, setContainerElement] =
        useState<HTMLDivElement | null>(null);

    const recognitionRef = useRef<any>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeCharRef = useRef<HTMLSpanElement>(null);

    // Keep track of listening state for the closure
    const isListeningRef = useRef(isListening);
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Auto-scroll to active character
    useEffect(() => {
        if (activeCharRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const activeChar = activeCharRef.current;

            // Calculate center position
            const scrollLeft =
                activeChar.offsetLeft -
                container.clientWidth / 2 +
                activeChar.clientWidth / 2;

            container.scrollTo({
                left: scrollLeft,
                behavior: "smooth",
            });
        }
    }, [processedText]);

    // Initialize avatar renderer with fixed optimal values
    const { executeSignSequence } = useAvatarRenderer({
        containerElement,
        modelPath: "./ybot.glb",
        animationSpeed: 1.2,
        pauseDuration: 300,
        onTextUpdate: (text: string) => {
            // Append text but avoid duplicates by checking if it already ends with this text
            setProcessedText((prev) => {
                const combined = prev + text;
                return combined;
            });
        },
        onLoadingChange: (loading: boolean) => setIsModelLoading(loading),
    });

    /**
     * Initialize Web Speech API for voice recognition
     */
    useEffect(() => {
        if (
            !("webkitSpeechRecognition" in window) &&
            !("SpeechRecognition" in window)
        ) {
            toast.error("Speech recognition not supported in this browser");
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Configure for better stability
        recognition.continuous = true; // Enable continuous recording
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + " ";
                }
            }

            if (finalTranscript) {
                setTextInput((prev) => prev + finalTranscript);
            }
        };

        recognition.onend = () => {
            // Use ref to check if we should still be listening
            if (isListeningRef.current) {
                try {
                    recognition.start();
                } catch {
                    // ignore
                }
            } else {
                setIsListening(false);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === "no-speech") return;

            if (event.error === "not-allowed") {
                toast.error(
                    "Microphone access denied. Please allow permissions.",
                );
                setIsListening(false);
            } else if (event.error === "network") {
                toast.error("Network error. Check your connection.");
                setIsListening(false);
            } else {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    /**
     * Toggle voice recording
     */
    const toggleListening = async () => {
        if (isListening) {
            setIsListening(false);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        } else {
            if (recognitionRef.current) {
                try {
                    // Explicitly request permission via getUserMedia
                    // This is often required in WebViews to trigger the permission prompt correctly
                    if (
                        navigator.mediaDevices &&
                        navigator.mediaDevices.getUserMedia
                    ) {
                        const stream =
                            await navigator.mediaDevices.getUserMedia({
                                audio: true,
                            });
                        stream.getTracks().forEach((track) => track.stop());
                    }

                    console.log("Starting speech recognition...");
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (err) {
                    console.error("Error starting speech recognition:", err);
                    setIsListening(false);
                    toast.error(
                        "Failed to start microphone. Please check permissions.",
                    );
                }
            } else {
                toast.error("Speech recognition not initialized");
            }
        }
    };

    /**
     * Clear voice input transcript
     */
    const clearInput = () => {
        setTextInput("");
        setProcessedText("");
        setPlayingText("");
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleConversion = () => {
        if (!textInput.trim()) return;
        // Replace newlines with spaces to ensure single-line display
        const sanitizedText = textInput.replace(/\n/g, " ");
        setProcessedText("");
        setPlayingText(sanitizedText);
        setTimeout(() => {
            executeSignSequence(sanitizedText);
        }, 100);
    };

    const navigate = useNavigate();

    return (
        <div className="flex h-full flex-col bg-[#917CF5] p-4">
            <div className="mx-auto grid h-full w-full max-w-md grid-rows-[1fr_auto_auto] gap-4">
                {/* 3D Avatar Display Section - Takes remaining space */}
                <Card className="flex flex-col overflow-hidden border-2 border-[#032068] bg-white py-0">
                    <CardContent className="flex flex-1 flex-col p-0">
                        <div
                            ref={setContainerElement}
                            className="relative flex flex-1 items-center justify-center bg-[#EAEBFF]"
                        >
                            {isModelLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-[#032068]">
                                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#032068] border-t-transparent"></div>
                                        <p className="text-sm">
                                            Loading 3D Model...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Typing Software Style Subtitle */}
                        <div className="flex h-16 items-center justify-center border-t-2 border-[#032068] bg-white p-4">
                            <div
                                ref={scrollContainerRef}
                                className="relative flex h-full w-full items-center overflow-x-auto overflow-y-hidden px-2 whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            >
                                {playingText ? (
                                    <div
                                        className="flex items-center text-xl font-bold tracking-wide whitespace-pre"
                                        style={{
                                            fontFamily:
                                                'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                                        }}
                                    >
                                        {/* Completed Text */}
                                        <span className="text-[#032068]">
                                            {playingText.slice(
                                                0,
                                                Math.max(
                                                    0,
                                                    processedText.length - 1,
                                                ),
                                            )}
                                        </span>
                                        {/* Current Character (Cursor) */}
                                        {processedText.length > 0 &&
                                            processedText.length <=
                                                playingText.length && (
                                                <span
                                                    ref={activeCharRef}
                                                    className="relative inline-flex min-w-[1ch] items-center justify-center rounded bg-[#0014D8] px-1 text-white"
                                                >
                                                    {playingText[
                                                        processedText.length - 1
                                                    ] === " "
                                                        ? "\u00A0"
                                                        : playingText[
                                                              processedText.length -
                                                                  1
                                                          ]}
                                                </span>
                                            )}
                                        {/* Remaining Text */}
                                        <span className="text-[#032068]/60">
                                            {playingText.slice(
                                                processedText.length,
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex w-full items-center justify-center">
                                        <span className="text-sm font-medium text-[#032068]/40">
                                            Processed text will appear here...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Combined Input Controls - Fixed height */}
                <Card className="border-2 border-[#032068] bg-white py-0">
                    <CardContent className="space-y-3 p-4">
                        {/* Controls Section */}
                        <div className="mb-4 grid grid-cols-2 gap-3">
                            <Button
                                onClick={toggleListening}
                                className={`h-12 w-full rounded-xl border-2 border-[#0014D8] text-white shadow-[0_4px_0_#0014D8] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_#0014D8] active:translate-y-1 active:shadow-none ${
                                    isListening
                                        ? "border-red-700 bg-red-500 shadow-[0_4px_0_#b91c1c] hover:bg-red-600 hover:shadow-[0_2px_0_#b91c1c]"
                                        : "bg-[#818CFF] hover:bg-[#6b78ff]"
                                }`}
                            >
                                {isListening ? (
                                    <>
                                        <Square className="h-5 w-5 fill-current" />
                                        <span className="font-medium">
                                            Stop Speaking
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Mic className="h-5 w-5" />
                                        <span className="font-medium">
                                            Start Speaking
                                        </span>
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={clearInput}
                                className="h-12 w-full rounded-xl border-2 border-[#0014D8] bg-[#818CFF] text-white shadow-[0_4px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_2px_0_#0014D8] active:translate-y-1 active:shadow-none"
                            >
                                <Trash2 className="h-5 w-5" />
                                <span className="font-medium">Clear Text</span>
                            </Button>
                        </div>

                        <Textarea
                            value={textInput}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setTextInput(newValue);
                                if (!newValue.trim()) {
                                    setProcessedText("");
                                    setPlayingText("");
                                }
                            }}
                            placeholder="Tap mic to speak or type here..."
                            className="h-20 resize-none rounded-xl border-2 border-[#0014D8] bg-white p-4 text-lg font-medium wrap-break-word text-[#032068] placeholder:text-[#032068]/40 focus-visible:border-[#0014D8] focus-visible:ring-0"
                        />

                        <Button
                            onClick={handleConversion}
                            disabled={!textInput.trim()}
                            className="h-14 w-full rounded-xl border-2 border-[#0014D8] bg-[#818CFF] text-lg font-medium text-white shadow-[0_4px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_2px_0_#0014D8] active:translate-y-1 active:shadow-none disabled:translate-y-1 disabled:opacity-50 disabled:shadow-none"
                        >
                            <Play className="h-5 w-5" />
                            Convert to Sign Language
                        </Button>
                    </CardContent>
                </Card>

                {/* Page Switch Button */}
                <div className="flex justify-center">
                    <div className="mx-auto w-full">
                        <Button
                            onClick={() => navigate("/learn")}
                            className="h-12 w-full rounded-xl border-2 border-[#0014D8] bg-[#818CFF] text-white shadow-[0_4px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_2px_0_#0014D8] active:translate-y-1 active:shadow-none"
                        >
                            Switch to Learn
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
