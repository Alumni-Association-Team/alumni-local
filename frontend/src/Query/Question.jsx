import { useParams } from "react-router";
import {
  useDownvotesMutation,
  useShowAllAnswerQuery,
  useUpvotesMutation,
} from "../redux/Api/queryApiSlice";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaUserCircle,
  FaCalendarAlt,
  FaTag,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import { format } from "date-fns";
import AnswerCard from "./AnswerCard";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Question = () => {
  const { questionId } = useParams();
  const {data: question, isLoading, error, refetch,} = useShowAllAnswerQuery(questionId);
  const [upvotes] = useUpvotesMutation();
  const [downvotes] = useDownvotesMutation();
  const [voteStatus, setVoteStatus] = useState("");
  const [isVoting, setIsVoting]= useState(false);

  useEffect(() => {
    if(question){
      if(question.upvotes.includes(question.userId)){
        setVoteStatus("Liked")
      } else if(question.downvotes.includes(question.userId)){
        setVoteStatus("Disliked")
      } 
      else setVoteStatus("");
    }
  }, [question]);


  if(isLoading){
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-indigo-700 dark:text-indigo-400">
            Loading Question...
          </p>
        </div>
      </div>
    );
  }

  if(error){
    return(
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Question
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Failed to load Question. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  
  // let debounce= 2000;
  // let disable= false;
  
  const handleVote= async (action) => {
    if(isVoting) return;

    try {
      setIsVoting(true);

      if(action==="Liked"){
        await upvotes({questionId});

        if(voteStatus=="Liked") setVoteStatus("");
        else setVoteStatus("Liked");
      } 
      else{
        await downvotes({questionId})

        if(voteStatus=="Disliked") setVoteStatus("");
        else setVoteStatus("Disliked");
      }

      
      await refetch();

    } catch (error) {
      console.error("Error handling vote:", error);
    } finally{
      setTimeout(() => {
        setIsVoting(false);
      }, 2000);    
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 w-full">
              {question.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <FaUserCircle className="mr-1" />
                <span>{question.askedBy.fullName || "Anonymous"}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                <span>
                  {question.createdAt
                    ? format(new Date(question.createdAt), "dd MMM, yyyy")
                    : "Unknown date"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <div className="flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                <FaTag className="mr-1" />
                {question.category}
              </div>
              <div
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  question.status === "Open"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                {question.status === "Open" ? (
                  <FaLockOpen className="mr-1" />
                ) : (
                  <FaLock className="mr-1" />
                )}
                {question.status}
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
              {question.content}
            </pre>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <button
                  disabled= {isVoting}
                  onClick={() => handleVote("Liked")}
                  className={`flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 ${isVoting? "opacity-50 cursor-not-allowed": ""}`}
                >
                  <FaThumbsUp
                    className={`mr-1 ${
                      voteStatus === "Liked" ? "text-indigo-600" : ""
                    }`}
                  />
                </button>
                <span className="ml-1">{question.upvotes?.length || 0}</span>
              </div>

              <div className="flex items-center">
                <button
                disabled= {isVoting}
                  onClick={() => handleVote("Disliked")
                  }
                  className={`flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 ${isVoting? "opacity-50 cursor-not-allowed": ""}`}
                >
                  <FaThumbsDown
                    className={`mr-1 ${
                      voteStatus === "Disliked" ? "text-indigo-600" : ""
                    }`}
                  />
                </button>
                <span className="ml-1">{question.downvotes?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            Answers{" "}
            <span className="ml-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
              {question.answers?.length || 0}
            </span>
          </h2>

          {question.answers && question.answers.length > 0 ? (
            <div className="space-y-6">
              {question.answers.map((answer) => (
                <AnswerCard key={answer._id} answer={answer} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No answers yet. Be the first to answer!
              </p>
            </div>
          )}
        </div>

        {/* Answer Form - Can be added later */}
      </div>
    </div>
  );
};

export default Question;
