import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <TooltipProvider>
      <LandingPage />
    </TooltipProvider>
  );
}

export default App;
