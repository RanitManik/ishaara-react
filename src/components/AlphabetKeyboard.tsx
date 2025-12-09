import { Button } from "@/components/ui/button";
import { CornerDownLeft, Delete } from "lucide-react";

interface AlphabetKeyboardProps {
    onKeyPress: (char: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
    disabled?: boolean;
}

export function AlphabetKeyboard({
    onKeyPress,
    onBackspace,
    onEnter,
    disabled,
}: AlphabetKeyboardProps) {
    // QWERTY layout rows
    const row1 = "QWERTYUIOP".split("");
    const row2 = "ASDFGHJKL".split("");
    const row3 = "ZXCVBNM".split("");

    return (
        <div className="flex flex-col gap-1.5">
            {/* First Row - QWERTYUIOP */}
            <div className="grid grid-cols-10 gap-1">
                {row1.map((char) => (
                    <Button
                        key={char}
                        onClick={() => onKeyPress(char)}
                        disabled={disabled}
                        className="aspect-square w-full rounded-lg border-2 border-[#0014D8] bg-[#818CFF] p-0 text-sm font-bold text-white shadow-[0_3px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_1.5px_0_#0014D8] active:translate-y-0.5 active:shadow-[0_1px_0_#0014D8] disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-[0_1px_0_#0014D8] sm:text-lg"
                    >
                        {char}
                    </Button>
                ))}
            </div>

            {/* Second Row - ASDFGHJKL */}
            <div className="grid grid-cols-[0.5fr_repeat(9,1fr)_0.5fr] gap-1">
                <div></div>
                {row2.map((char) => (
                    <Button
                        key={char}
                        onClick={() => onKeyPress(char)}
                        disabled={disabled}
                        className="aspect-square w-full rounded-lg border-2 border-[#0014D8] bg-[#818CFF] p-0 text-sm font-bold text-white shadow-[0_3px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_1.5px_0_#0014D8] active:translate-y-0.5 active:shadow-[0_1px_0_#0014D8] disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-[0_1px_0_#0014D8] sm:text-lg"
                    >
                        {char}
                    </Button>
                ))}
                <div></div>
            </div>

            {/* Third Row - ZXCVBNM with Enter and Backspace */}
            <div className="grid grid-cols-[1.5fr_repeat(7,1fr)_1.5fr] gap-1">
                <Button
                    onClick={onEnter}
                    disabled={disabled}
                    className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-green-700 bg-green-500 p-0 text-sm font-bold text-white shadow-[0_3px_0_#15803d] transition-all hover:translate-y-0.5 hover:bg-green-600 hover:shadow-[0_1.5px_0_#15803d] active:translate-y-0.5 active:shadow-[0_1px_0_#15803d] disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-[0_1px_0_#15803d]"
                >
                    <CornerDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {row3.map((char) => (
                    <Button
                        key={char}
                        onClick={() => onKeyPress(char)}
                        disabled={disabled}
                        className="aspect-square w-full rounded-lg border-2 border-[#0014D8] bg-[#818CFF] p-0 text-sm font-bold text-white shadow-[0_3px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_1.5px_0_#0014D8] active:translate-y-0.5 active:shadow-[0_1px_0_#0014D8] disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-[0_1px_0_#0014D8] sm:text-lg"
                    >
                        {char}
                    </Button>
                ))}
                <Button
                    onClick={onBackspace}
                    disabled={disabled}
                    className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-orange-700 bg-orange-500 p-0 text-sm font-bold text-white shadow-[0_3px_0_#c2410c] transition-all hover:translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_1.5px_0_#c2410c] active:translate-y-0.5 active:shadow-[0_1px_0_#c2410c] disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-[0_1px_0_#c2410c]"
                >
                    <Delete className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </div>

            {/* Fourth Row - Spacebar */}
            <div className="grid grid-cols-[1.5fr_6fr_1.5fr] gap-1">
                <div></div>
                <Button
                    onClick={() => onKeyPress(" ")}
                    disabled={disabled}
                    className="w-full rounded-lg border-2 border-[#0014D8] bg-[#818CFF] py-2 text-xs font-bold text-white shadow-[0_3px_0_#0014D8] transition-all hover:translate-y-0.5 hover:bg-[#6b78ff] hover:shadow-[0_1.5px_0_#0014D8] active:translate-y-0.5 active:shadow-[0_1px_0_#0014D8] disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-[0_1px_0_#0014D8] sm:text-sm"
                >
                    SPACE
                </Button>
                <div></div>
            </div>
        </div>
    );
}
