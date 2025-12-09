import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Convert from "./pages/Convert";
import Learn from "./pages/Learn";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
    return (
        <Router>
            <div className="flex h-screen flex-col bg-[#917CF5]">
                <Toaster />
                <div className="flex-1 overflow-hidden">
                    <Routes>
                        <Route path="/" element={<Convert />} />
                        <Route path="/learn" element={<Learn />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
