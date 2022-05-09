import React from "react"
import ReactDOM from "react-dom"
import "./App.css"
import GameView from "./components/GameView"
import logo from "./logo.svg"
import { BrowserRouter } from "react-router-dom"
import Card from "./components/UI/Card"

function App() {
  return (
    <div className="app">
      <h1>Welcome Tic Tac Game </h1>

      <img className="logo" src={logo} alt="logo" />
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Card>
      <BrowserRouter>
        <GameView />,
        <App />
      </BrowserRouter>
    </Card>
  </React.StrictMode>,
  document.getElementById("root")
)
