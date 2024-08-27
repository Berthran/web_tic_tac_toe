import {
    BrowserRouter as Router, Routes,
    Route
} from "react-router-dom";
import Game from "./pages/Game";
import Home from "./pages/Home";
import MyButton from "./components/MyButton";

const App = () => {
    return (
        <div className="app">
            <Router>
                <MyButton to="" />
                <MyButton to="game" />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game"
                        element={<Game />} />
                </Routes>
            </Router>
        </div>
    )
}

export default App;
