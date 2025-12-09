import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAvatarRenderer } from "@/hooks/use-avatar-renderer";
import { AlphabetKeyboard } from "@/components/AlphabetKeyboard";

export default function Learn() {
    const [processedText, setProcessedText] = useState("");
    const [playingText, setPlayingText] = useState("");
    const [inputBuffer, setInputBuffer] = useState("");
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [containerElement, setContainerElement] =
        useState<HTMLDivElement | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeCharRef = useRef<HTMLSpanElement>(null);

    // Auto-scroll to active character
    useEffect(() => {
        if (activeCharRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const activeChar = activeCharRef.current;
            const scrollLeft =
                activeChar.offsetLeft -
                container.clientWidth / 2 +
                activeChar.clientWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
    }, [processedText]);

    const { executeSignSequence } = useAvatarRenderer({
        containerElement,
        modelPath: "./ybot.glb",
        animationSpeed: 1.2,
        pauseDuration: 300,
        onTextUpdate: (text: string) => {
            setProcessedText((prev) => prev + text);
        },
        onLoadingChange: (loading: boolean) => setIsModelLoading(loading),
    });

    const handleKeyPress = (char: string) => {
        setInputBuffer((prev) => prev + char);
    };

    const handleBackspace = () => {
        setInputBuffer((prev) => prev.slice(0, -1));
    };

    const handleEnter = () => {
        if (inputBuffer.trim()) {
            setPlayingText(inputBuffer);
            setProcessedText("");
            executeSignSequence(inputBuffer);
            setInputBuffer("");
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#917CF5] p-2 sm:p-4">
            <div className="mx-auto grid h-full w-full max-w-md grid-rows-[minmax(400px,1fr)_auto] gap-2 sm:gap-4">
                {/* 3D Avatar Display Section */}
                <Card className="flex flex-col overflow-hidden border-2 border-[#032068] bg-white py-0">
                    <CardContent className="flex flex-1 flex-col p-0">
                        <div
                            ref={setContainerElement}
                            className="relative flex min-h-[350px] flex-1 items-center justify-center bg-[#EAEBFF]"
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
                        {/* Subtitle Section */}
                        <div className="flex h-12 items-center justify-center border-t-2 border-[#032068] bg-white p-2 sm:h-16 sm:p-4">
                            <div
                                ref={scrollContainerRef}
                                className="relative flex h-full w-full items-center overflow-x-auto overflow-y-hidden px-2 whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            >
                                {playingText ? (
                                    <div
                                        className="flex items-center text-base font-bold tracking-wide whitespace-pre sm:text-xl"
                                        style={{
                                            fontFamily:
                                                'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                                        }}
                                    >
                                        <span className="text-[#032068]">
                                            {playingText.slice(
                                                0,
                                                Math.max(
                                                    0,
                                                    processedText.length - 1,
                                                ),
                                            )}
                                        </span>
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
                                        <span className="text-[#032068]/60">
                                            {playingText.slice(
                                                processedText.length,
                                            )}
                                        </span>
                                    </div>
                                ) : inputBuffer ? (
                                    <div className="flex w-full items-center justify-center">
                                        <span className="text-sm font-medium text-[#032068] sm:text-lg">
                                            {inputBuffer}
                                            <span className="ml-1 animate-pulse">
                                                |
                                            </span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex w-full items-center justify-center">
                                        <span className="text-[#032068]/40] text-xs font-medium sm:text-sm">
                                            Type and press Enter to see signs...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Keyboard Section */}
                <Card className="border-2 border-[#032068] bg-white py-0">
                    <CardContent className="space-y-2 p-2 sm:p-4">
                        <AlphabetKeyboard
                            onKeyPress={handleKeyPress}
                            onBackspace={handleBackspace}
                            onEnter={handleEnter}
                            disabled={isModelLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
