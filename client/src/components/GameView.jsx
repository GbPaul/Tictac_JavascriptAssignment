import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import "./GameView.css"
import io from "socket.io-client"
import { Grid } from "./UI/Grid"
const socket = io("http://localhost:5000")

const combinations = [
  [0, 2, 1],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const random = () => {
  return Array.from(Array(8), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("")
}

export default function GameView() {
  const [game, setGame] = useState(Array(9).fill(""))
  const [turnNumber, setTurnNumber] = useState(0)

  const [myTurn, setMyTurn] = useState(true)
  const [winner, setWinner] = useState(false)
  const [moveXo, setMoveXO] = useState("X")
  const [player, setPlayer] = useState("")

  const [hasOpponent, setHasOpponent] = useState(false)
  const [share, setShare] = useState(false)
  const [turnData, setTurnData] = useState(false)

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const guestsRoom = params.get("room")
  const [room, setRoom] = useState(guestsRoom)

  const turn = (index) => {
    if (!game[index] && !winner && myTurn && hasOpponent) {
      socket.emit("reqTurn", JSON.stringify({ index, value: moveXo, room }))
    }
  }

  const sendRestart = () => {
    socket.emit("reqRestart", JSON.stringify({ room }))
  }

  const restartGame = () => {
    setGame(Array(9).fill(""))
    setWinner(false)
    setTurnNumber(0)
    setMyTurn(false)
  }

  useEffect(() => {
    combinations.forEach((c) => {
      if (
        game[c[0]] === game[c[1]] &&
        game[c[0]] === game[c[2]] &&
        game[c[0]] !== ""
      ) {
        setWinner(true)
      }
    })

    if (turnNumber === 0) {
      setMyTurn(moveXo === "X" ? true : false)
    }
  }, [game, turnNumber, moveXo])

  useEffect(() => {
    socket.on("playerTurn", (json) => {
      setTurnData(json)
    })

    socket.on("restart", () => {
      restartGame()
    })

    socket.on("opponent_joined", () => {
      setHasOpponent(true)
      setShare(false)
    })
  }, [])

  useEffect(() => {
    if (turnData) {
      const data = JSON.parse(turnData)
      let g = [...game]
      if (!g[data.index] && !winner) {
        g[data.index] = data.value
        setGame(g)
        setTurnNumber(turnNumber + 1)
        setTurnData(false)
        setMyTurn(!myTurn)
        setPlayer(data.value)
      }
    }
  }, [turnData, game, turnNumber, winner, myTurn])

  useEffect(() => {
    if (guestsRoom) {
      setMoveXO("O")
      socket.emit("join", guestsRoom)
      setRoom(guestsRoom)
      setMyTurn(false)
    } else {
      const newRoomName = random()
      socket.emit("create", newRoomName)
      setRoom(newRoomName)
      setMyTurn(true)
    }
  }, [guestsRoom])

  return (
    <div className="container">
      Room ID: {room}
      <button className="btn" onClick={() => setShare(!share)}>
        Share Link
      </button>
      {share ? (
        <>
          <br />
          <br />
          Share:{" "}
          <input
            type="text"
            value={`${window.location.href}?room=${room}`}
            readOnly
          />
        </>
      ) : null}
      <br />
      <br />
      Turn: {myTurn ? "You" : "Opponent"}
      <br />
      {hasOpponent ? "" : "Waiting for opponent..."}
      <p>
        {winner || turnNumber === 9 ? (
          <button className="btn" onClick={sendRestart}>
            Restart Game
          </button>
        ) : null}
        {winner ? (
          <span>We have a winner: User {player}</span>
        ) : turnNumber === 9 ? (
          <span>It's a tie!</span>
        ) : (
          <br />
        )}
      </p>
      <div className="row">
        <Grid index={0} turn={turn} value={game[0]} />
        <Grid index={1} turn={turn} value={game[1]} />
        <Grid index={2} turn={turn} value={game[2]} />
      </div>
      <div className="row">
        <Grid index={3} turn={turn} value={game[3]} />
        <Grid index={4} turn={turn} value={game[4]} />
        <Grid index={5} turn={turn} value={game[5]} />
      </div>
      <div className="row">
        <Grid index={6} turn={turn} value={game[6]} />
        <Grid index={7} turn={turn} value={game[7]} />
        <Grid index={8} turn={turn} value={game[8]} />
      </div>
    </div>
  )
}
