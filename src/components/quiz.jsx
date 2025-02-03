import { useState, useEffect } from "react";

const Quiz = () => {
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [attemptedQuestions, setAttemptedQuestions] = useState(new Set());
  const [questionTimers, setQuestionTimers] = useState([]);

  useEffect(() => {
    fetch("/Questions.json")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        setQuestionTimers(new Array(data.length).fill(30));
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  useEffect(() => {
    if (questions.length === 0 || quizCompleted) return;

    const interval = setInterval(() => {
      setQuestionTimers((prevTimers) => {
        if (prevTimers[currentQuestionIndex] <= 0) return prevTimers;
        const updatedTimers = [...prevTimers];
        updatedTimers[currentQuestionIndex] -= 1;

        if (updatedTimers[currentQuestionIndex] === 0) {
          nextQuestion();
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, questions.length, quizCompleted]);

  useEffect(() => {
    if (attemptedQuestions.size === questions.length && questions.length > 0) {
      setQuizCompleted(true);
    }
  }, [attemptedQuestions, questions.length]);

  const handleOptionClick = (index) => {
    if (selectedOption !== null || attemptedQuestions.has(currentQuestionIndex))
      return;

    setSelectedOption(index);
    const isCorrect =
      index === questions[currentQuestionIndex].correctOptionIndex;

    setScore((prevScore) => (isCorrect ? prevScore + 4 : prevScore - 1));

    //setAttemptedQuestions((prev) => new Set([...prev, currentQuestionIndex]));

    setTimeout(() => nextQuestion(), 1000);
  };

  const nextQuestion = () => {
    setSelectedOption(null);

    setAttemptedQuestions((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(currentQuestionIndex);
      let nextIndex = currentQuestionIndex;
      do {
        nextIndex = (nextIndex + 1) % questions.length;
      } while (updatedSet.has(nextIndex) && nextIndex !== currentQuestionIndex);
      setCurrentQuestionIndex(nextIndex);
      return updatedSet;
    });
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuizCompleted(false);
    setAttemptedQuestions(new Set());

    if (questions.length > 0) {
      setQuestionTimers(new Array(questions.length).fill(30));
    }
  };
  if (questions.length === 0) return <h2>Loading questions...</h2>;
  // if (quizCompleted) {
  //   return (
  //     <div className="flex flex-col justify-center items-center m-auto mt-10 p-6 text-center w-[600px] h-auto border-2 rounded-xl">
  //       <h1 className="text-3xl font-bold">Quiz Completed!</h1>
  //       <p className="text-lg mt-4">
  //         Final Score: {score}/{questions.length * 4}
  //       </p>
  //       <button
  //         className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
  //         onClick={restartQuiz}
  //       >
  //         Restart Quiz
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="flex justify-center items-center h-screen p-10 bg-gray-800">
      {quizCompleted ? (
        <div className="flex flex-col justify-center items-center m-auto mt-10 p-6 text-center w-[600px] h-auto border-2 rounded-xl bg-gray-300">
          <h1 className="text-3xl font-bold">Quiz Completed!</h1>
          <p className="text-lg mt-4">
            Final Score: {score}/{questions.length * 4}
          </p>
          <button
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            onClick={restartQuiz}
          >
            Restart Quiz
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center m-auto mt-16 p-4 text-center w-[500px] h-auto border-2 rounded-xl bg-gray-300">
          <h1 className="text-2xl font-bold">Quiz</h1>
          <div className="flex justify-between my-3">
            <div className="text-lg">Score: {score}</div>
            <div className="text-lg">
              Time: {questionTimers[currentQuestionIndex]}s
            </div>
          </div>

          {questions.length > 0 && (
            <>
              <h2 className="text-xl font-semibold">
                {questions[currentQuestionIndex].question}
              </h2>
              <div className="mt-4 space-y-2">
                {questions[currentQuestionIndex].options.map(
                  (option, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg text-lg font-medium transition-all duration-200 ${
                        selectedOption !== null
                          ? index ===
                            questions[currentQuestionIndex].correctOptionIndex
                            ? "bg-green-500 text-white"
                            : index === selectedOption
                            ? "bg-red-500 text-white"
                            : "bg-gray-400 opacity-50"
                          : attemptedQuestions.has(currentQuestionIndex)
                          ? "bg-gray-400 opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-200 cursor-pointer"
                      } `}
                      onClick={() => handleOptionClick(index)}
                    >
                      {option}
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-center mt-4 space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? "bg-blue-500 text-white"
                        : attemptedQuestions.has(index)
                        ? "border-2 border-blue-500 bg-gray-300"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
