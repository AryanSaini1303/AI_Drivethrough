import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization:{
        params:{
          prompt:'select_account'// let's you choose an account on each sign in attempt
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,// Adding this secret is really crucial for the auth to work properly in production, this can be any random secret which can be stored in the ".env.local" file just like any other secret
});
export {handler as GET, handler as POST}