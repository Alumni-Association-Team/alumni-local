import { QUERY_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const queryApiSlice= apiSlice.injectEndpoints({
    endpoints: (builder)=> ({
        showAllQuery: builder.query({
            query: ()=>({
                url: `${QUERY_URL}/`,
                method: "GET"
            })
        }),

        postQuestion: builder.mutation({
            query: (formData)=>({
                url: `${QUERY_URL}/question`,
                method: "POST",
                body: formData
            })
        }),

        showAllAnswer: builder.query({
            query: (questionId)=>({
                url: `${QUERY_URL}/${questionId}`,
                method: "GET",
            })
        }),

        upvotes: builder.mutation({
            query: ({questionId})=>({
                url: `${QUERY_URL}/${questionId}/upvote`,
                method: "POST",
            })
        }),

        downvotes: builder.mutation({
            query: ({questionId})=>({
                url: `${QUERY_URL}/${questionId}/downvote`,
                method: "POST",
            })
        }),

        postAnswer: builder.mutation({
            query: (data)=>({
                url: `${QUERY_URL}/${data.questionId}/answer`,
                method: "POST",
                body: data
            })
        }),

        postComment: builder.mutation({
            query: ( data)=>({
                url: `${QUERY_URL}/answer/${data.answerId}/comment`,
                method: "POST",
                body: data
            })
        }),

        answerUpvotes: builder.mutation({
            query: ({answerId})=>({
                url: `${QUERY_URL}/answer/${answerId}/upvote`,
                method: "POST",
            })
        }),

        answerDownvotes: builder.mutation({
            query: ({answerId})=>({
                url: `${QUERY_URL}/answer/${answerId}/downvote`,
                method: "POST",
            })
        }),
    })
})

export const {
    useShowAllQueryQuery, 
    usePostCommentMutation, 
    usePostAnswerMutation, 
    useDownvotesMutation, 
    useUpvotesMutation, 
    useShowAllAnswerQuery, 
    usePostQuestionMutation,
    useAnswerUpvotesMutation,
    useAnswerDownvotesMutation,
    }= queryApiSlice