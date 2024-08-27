import { Routes, Route } from "react-router-dom";
import Game from "./pages/Game";
import Home from "./pages/Home";
import MyButton from "./components/MyButton";

const App = () => {
    return (
        <div className="app">
            <MyButton to="" />
            <MyButton to="game" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </div>
    )
}

export default App;
