"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, Trophy, Play, Skull, Flame } from "lucide-react";
import { socket } from "@/lib/socket";

// Helper array for option colors (Kahoot style)
const OPTION_COLORS = [
  "bg-rose-500 text-white",
  "bg-blue-500 text-white",
  "bg-amber-400 text-black",
  "bg-emerald-500 text-white",
];

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState<"IDLE" | "WAITING" | "PLAYING" | "GAMEWON" | "GAMEOVER">("IDLE");
  const [players, setPlayers] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionProgress, setQuestionProgress] = useState({ current: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    // Connect to the Express server gracefully
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("startGame", ({ players }) => {
      setPlayers(players);
      setStatus("PLAYING");
    });

    socket.on("question", ({ question, questionIndex, totalQuestions }) => {
      setCurrentQuestion(question);
      if (questionIndex) setQuestionProgress({ current: questionIndex, total: totalQuestions });
      setSelectedAnswer(null);
      setLastResult(null);
    });

    socket.on("timer", ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });

    socket.on("answerResult", (data) => {
      setLastResult(data);
      setScore(data.score);
    });

    socket.on("gameWon", ({ finalScore }) => {
      setScore(finalScore);
      if (finalScore > 90) {
        setStatus("GAMEWON");
      }
    })

    socket.on("gameOver", ({ finalScore }) => {
      setScore(finalScore);
      setStatus("GAMEOVER");
    });

    socket.on("playerDisconnected", () => {
      alert("Your partner disconnected! Game Over.");
      window.location.reload();
    });

    return () => {
      // Remove listeners on hot-reloads so they don't double up
      socket.off("startGame");
      socket.off("question");
      socket.off("timer");
      socket.off("answerResult");
      socket.off("gameOver");
      socket.off("gameWon");
      socket.off("playerDisconnected");
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socket?.emit) return alert("Still connecting to server... wait a second!");
    if (!name.trim()) return alert("Please enter your name!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit("createRoom", { name }, (response: any) => {
      setRoomId(response.roomId.toUpperCase());
      setStatus("WAITING");
    });
  };

  const handleJoinRoom = () => {
    if (!socket?.emit) return alert("Still connecting to server... wait a second!");
    if (!name.trim() || !roomId.trim()) return alert("Need name and room ID!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit("joinRoom", { roomId: roomId.toLowerCase(), name }, (response: any) => {
      if (response.error) {
        alert(response.error);
      } else {
        setStatus((prev) => prev === "PLAYING" ? "PLAYING" : "WAITING");
      }
    });
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!socket?.emit) return;
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    socket.emit("submitAnswer", { roomId: roomId.toLowerCase(), answer }, () => {
      // confirmed
    });
  };

  return (
    <div className="min-h-screen bg-[#6d28d9] p-3 sm:p-5 md:p-8 flex flex-col items-center justify-center font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black pt-12 pb-20">

      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px] sm:bg-[length:30px_30px]" />

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-6 sm:mb-8 z-10 text-center w-full max-w-[95vw]"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter text-yellow-400 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] sm:drop-shadow-[6px_6px_0_rgba(0,0,0,1)] uppercase -rotate-2 transform">
            VibeCheckr
          </h1>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ================= IDLE STATE ================= */}
        {status === "IDLE" && (
          <motion.div
            key="idle"
            initial={{ scale: 0.8, opacity: 0, rotate: 2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: -2 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex flex-col gap-4 sm:gap-6 w-full max-w-[90vw] sm:max-w-md bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-3xl border-4 sm:border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-black relative z-10"
          >
            <div className="flex flex-col gap-2 sm:gap-3">
              <label className="font-black text-xl sm:text-2xl uppercase tracking-tight">Who are you?</label>
              <input
                type="text"
                placeholder="NICKNAME"
                className="border-[3px] sm:border-4 border-black bg-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-yellow-400 transition-all font-black text-xl sm:text-2xl uppercase placeholder-gray-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={10}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95, y: 4, x: 4, boxShadow: "0px 0px 0 0 rgba(0,0,0,1)" }}
              onClick={handleCreateRoom}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-yellow-400 border-[3px] sm:border-4 border-black text-black font-black py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] cursor-pointer text-xl sm:text-2xl uppercase tracking-tight mt-1 sm:mt-2"
            >
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 fill-black" /> HOST A GAME
            </motion.button>

            <div className="relative flex items-center py-2 sm:py-4">
              <div className="flex-grow border-t-[3px] sm:border-t-4 border-black"></div>
              <span className="flex-shrink-0 mx-3 sm:mx-4 text-black font-black text-lg sm:text-xl bg-white px-2 uppercase transform -rotate-3">OR JOIN</span>
              <div className="flex-grow border-t-[3px] sm:border-t-4 border-black"></div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="ROOM CODE"
                className="border-[3px] sm:border-4 border-black bg-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-cyan-400 transition-all font-black text-2xl sm:text-3xl text-center uppercase placeholder-gray-400 tracking-widest"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95, y: 4, x: 4, boxShadow: "0px 0px 0 0 rgba(0,0,0,1)" }}
              onClick={handleJoinRoom}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-cyan-400 border-[3px] sm:border-4 border-black text-black font-black py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] cursor-pointer text-xl sm:text-2xl uppercase tracking-tight"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-black" /> JOIN GAME
            </motion.button>
          </motion.div>
        )}

        {/* ================= WAITING STATE ================= */}
        {status === "WAITING" && (
          <motion.div
            key="waiting"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="flex flex-col text-center p-6 sm:p-10 bg-white border-4 sm:border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:shadow-[16px_16px_0_0_rgba(0,0,0,1)] rounded-[1.5rem] sm:rounded-3xl w-full max-w-[90vw] sm:max-w-md relative z-10"
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-1 sm:mb-2 text-black uppercase tracking-tight">You&apos;re In!</h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 font-bold leading-tight px-2">Waiting for your friend to join...</p>

            <div className="bg-yellow-400 border-[3px] sm:border-4 border-black p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 transform rotate-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <p className="text-base sm:text-lg text-black font-black uppercase tracking-widest mb-1">Room Code</p>
              <span className="font-mono text-5xl sm:text-6xl text-black select-all font-black tracking-widest break-all leading-none">{roomId}</span>
            </div>

            <div className="flex justify-center gap-3 sm:gap-4 mt-2">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-4 w-4 sm:h-6 sm:w-6 bg-rose-500 border-[3px] sm:border-4 border-black rounded-full"></motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-4 w-4 sm:h-6 sm:w-6 bg-cyan-400 border-[3px] sm:border-4 border-black rounded-full"></motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-4 w-4 sm:h-6 sm:w-6 bg-amber-400 border-[3px] sm:border-4 border-black rounded-full"></motion.div>
            </div>
          </motion.div>
        )}

        {/* ================= PLAYING STATE ================= */}
        {status === "PLAYING" && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-full max-w-3xl flex flex-col gap-4 sm:gap-6 relative z-10"
          >
            <div className="flex flex-row flex-wrap justify-between items-center bg-white border-4 border-black p-3 sm:p-4 rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] gap-2">
              <div className={`flex items-center justify-center gap-1 sm:gap-2 font-black text-lg sm:text-2xl px-3 py-2 sm:px-5 rounded-xl border-[3px] sm:border-4 flex-1 sm:flex-none ${timeLeft <= 5 ? "bg-red-500 text-white border-black animate-pulse" : "bg-gray-100 border-black text-black"}`}>
                <Clock className="w-5 h-5 sm:w-8 sm:h-8" /> {timeLeft}
              </div>

              {questionProgress.current > 0 && (
                <div className="flex items-center justify-center bg-yellow-400 text-black border-[3px] sm:border-4 border-black font-black px-3 py-2 sm:px-6 rounded-xl text-lg sm:text-xl uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex-none transform md:-rotate-2">
                  Q {questionProgress.current} <span className="hidden sm:inline">&nbsp;OF {questionProgress.total}</span>
                  <span className="sm:hidden">/{questionProgress.total}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-1 sm:gap-2 font-black text-lg sm:text-2xl bg-cyan-400 text-black border-[3px] sm:border-4 border-black px-3 py-2 sm:px-5 rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex-1 sm:flex-none text-right">
                <span className="hidden sm:inline">SCORE:</span> {score}
              </div>
            </div>

            <div className="bg-white p-6 sm:p-12 rounded-[1.5rem] sm:rounded-3xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:shadow-[12px_12px_0_0_rgba(0,0,0,1)] border-4 sm:border-8 border-black text-center relative mt-2 sm:mt-4 overflow-hidden w-full">
              {/* Question bubble tail */}
              <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] sm:border-l-[20px] border-l-transparent border-r-[12px] sm:border-r-[20px] border-r-transparent border-b-[16px] sm:border-b-[24px] border-b-black"></div>
              <div className="absolute -top-2 sm:-top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] sm:border-l-[14px] border-l-transparent border-r-[8px] sm:border-r-[14px] border-r-transparent border-b-[12px] sm:border-b-[18px] border-b-white z-10"></div>

              <h2 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-10 text-black leading-tight tracking-tight uppercase break-words">{currentQuestion.question}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                {currentQuestion.options.map((option: string, i: number) => {
                  const isSelected = selectedAnswer === option;
                  const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];

                  // if 3 options, make the last one span full width on md screens
                  const isThirdOfThree = currentQuestion.options.length === 3 && i === 2;

                  return (
                    <motion.button
                      whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                      whileTap={!selectedAnswer ? { scale: 0.95, y: 4, x: 4, boxShadow: "0px 0px 0 0 rgba(0,0,0,1)" } : {}}
                      key={i}
                      onClick={() => handleSubmitAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={`
                        border-[3px] sm:border-4 border-black font-black py-4 sm:py-8 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-lg sm:text-2xl flex items-center justify-center text-center tracking-tight uppercase relative overflow-hidden break-words w-full
                        ${colorClass}
                        ${isSelected ? 'brightness-110 shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-y-1 translate-x-1 scale-95 sm:scale-[0.98] ring-[3px] sm:ring-4 ring-white' : ''}
                        ${!!selectedAnswer && !isSelected ? 'opacity-30 grayscale saturate-0 pointer-events-none' : ''}
                        ${isThirdOfThree ? 'md:col-span-2' : ''}
                      `}
                    >
                      <span className="relative z-0 line-clamp-3 w-full self-center">{option}</span>

                      {/* Inner overlay for waiting state on selected button */}
                      {isSelected && !lastResult && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                          <span className="text-white font-black drop-shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-xl sm:text-3xl animate-pulse tracking-widest flex items-center gap-1 sm:gap-2">
                            WAITING <span className="animate-spin text-2xl sm:text-3xl">⏳</span>
                          </span>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Absolute Overlay Result Screen OVER the Question Div */}
              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.3, opacity: 0, rotate: 10 }}
                    className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 backdrop-blur-sm shadow-[inset_0px_0px_50px_rgba(0,0,0,0.5)] ${lastResult.isMatch ? 'bg-emerald-400/95' : 'bg-red-500/95'}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 font-black text-4xl sm:text-7xl uppercase tracking-tighter text-center transform -rotate-3 text-white">
                      {lastResult.isMatch ? (
                        <>
                          <Zap className="w-20 h-20 sm:w-32 sm:h-32 rounded-[2px] fill-yellow-400 text-yellow-400 stroke-black drop-shadow-[4px_4px_0_0_#000] sm:drop-shadow-[6px_6px_0_0_#000] animate-bounce" />
                          <span className="drop-shadow-[3px_3px_0_0_#000] sm:drop-shadow-[4px_4px_0_0_#000] stroke-black px-2 pb-1" style={{ WebkitTextStroke: '2px black' }}>VIBE <br className="sm:hidden" />MATCHED!</span>
                        </>
                      ) : (
                        <>
                          <Skull className="w-20 h-20 sm:w-32 sm:h-32 rounded-[2px] text-white fill-white stroke-black drop-shadow-[4px_4px_0_0_#000] sm:drop-shadow-[6px_6px_0_0_#000]" />
                          <span className="drop-shadow-[3px_3px_0_0_#000] sm:drop-shadow-[4px_4px_0_0_#000] stroke-black pb-1 leading-tight" style={{ WebkitTextStroke: '2px black' }}>NO <br className="sm:hidden" />MATCH!</span>
                        </>
                      )}

                      <div className="bg-black text-white px-6 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-xl sm:text-4xl font-black tracking-widest transform rotate-2 mt-2 border-[3px] sm:border-4 border-white shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000]">
                        {lastResult.isMatch ? "+10 POINTS" : "0 POINTS"}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ================= GAMEWON STATE ================= */}
        {status === "GAMEWON" && (
          <motion.div
            key="gamewon"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center p-8 sm:p-12 bg-white border-4 sm:border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:shadow-[16px_16px_0_0_rgba(0,0,0,1)] rounded-[1.5rem] sm:rounded-3xl w-full max-w-[90vw] sm:max-w-lg relative z-10"
          >
            <Trophy className="w-24 h-24 sm:w-32 sm:h-32 mx-auto text-yellow-400 mb-4 sm:mb-6 drop-shadow-[4px_4px_0_0_#000] sm:drop-shadow-[6px_6px_0_0_#000] fill-yellow-400" />
            <h2 className="text-4xl sm:text-6xl font-black mb-3 sm:mb-4 text-black uppercase tracking-tighter leading-none">Game <br /> Won!</h2>
            <p className="text-xl sm:text-2xl text-gray-700 mb-6 sm:mb-8 font-black uppercase bg-gray-200 border-[3px] sm:border-4 border-black inline-block px-3 py-1 sm:px-4 sm:py-2 transform -rotate-3">Final Score</p>
            <div className="text-7xl sm:text-9xl font-black text-cyan-400 drop-shadow-[5px_5px_0_0_#000] sm:drop-shadow-[8px_8px_0_0_#000] mb-8 sm:mb-12 stroke-black" style={{ WebkitTextStroke: '3px black' }}>
              {score}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 4, x: 4, boxShadow: "0px 0px 0 0 rgba(0,0,0,1)" }}
              className="w-full bg-rose-500 hover:bg-rose-600 border-[3px] sm:border-8 border-black text-white font-black py-4 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-2xl sm:text-3xl uppercase tracking-tighter"
            >
              Get the Clue
            </motion.div>
          </motion.div>
        )}

        {/* ================= GAMEOVER STATE ================= */}
        {status === "GAMEOVER" && (
          <motion.div
            key="gameover"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center p-8 sm:p-12 bg-white border-4 sm:border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:shadow-[16px_16px_0_0_rgba(0,0,0,1)] rounded-[1.5rem] sm:rounded-3xl w-full max-w-[90vw] sm:max-w-lg relative z-10"
          >
            <h2 className="text-4xl sm:text-6xl font-black mb-3 sm:mb-4 text-black uppercase tracking-tighter leading-none">Game <br /> Over!</h2>
            <p className="text-xl sm:text-2xl text-gray-700 mb-6 sm:mb-8 font-black uppercase bg-gray-200 border-[3px] sm:border-4 border-black inline-block px-3 py-1 sm:px-4 sm:py-2 transform -rotate-3">Final Score</p>
            <div className="text-7xl sm:text-9xl font-black text-cyan-400 drop-shadow-[5px_5px_0_0_#000] sm:drop-shadow-[8px_8px_0_0_#000] mb-8 sm:mb-12 stroke-black" style={{ WebkitTextStroke: '3px black' }}>
              {score}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 4, x: 4, boxShadow: "0px 0px 0 0 rgba(0,0,0,1)" }}
              className="w-full bg-rose-500 hover:bg-rose-600 border-[3px] sm:border-8 border-black text-white font-black py-4 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-2xl sm:text-3xl uppercase tracking-tighter"
            >
              Meet Alan
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
