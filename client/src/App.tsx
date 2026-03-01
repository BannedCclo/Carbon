import "./App.css";
import AppRouter from "./routes/Router";
import { LoadingProvider } from "./contexts/LoadingContext";

function App() {
  return (
    <LoadingProvider>
      <AppRouter />
    </LoadingProvider>
  );
}

export default App;
