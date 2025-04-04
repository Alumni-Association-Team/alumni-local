import { apiSlice } from "./apiSlice.js";
import { USERS_URL } from "../constants.js";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),
    getProfile: builder.query({
      query: (rollNumber) => ({
        url: `${USERS_URL}/${rollNumber}`,
        method: "GET",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    signup: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    verify: builder.mutation({
      query: ({ email, code }) => ({
        url: `${USERS_URL}/verify/${email}`,
        method: "POST",
        body: { code },
      }),
    })
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useVerifyMutation,
  useGetProfileQuery
} = userApiSlice;
