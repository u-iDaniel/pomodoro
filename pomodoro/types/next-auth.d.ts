import { DefaultSession } from "next-auth";
declare module '@auth/core/types' {
	interface User {
		id: string
		isNewUser?: boolean
	}

	interface Session {
		user: {
            id: string
            isNewUser?: boolean
		} & DefaultSession['user']
	}
}



// declare module "next-auth" {
//   interface User {
//     userid: string; // Ensure the user has an ID
//     isNewUser?: boolean; // Add isNewUser flag
//   }

//   interface Session {
//     user: DefaultSession["user"] & User;
//   }

//   interface JWT {
//     isNewUser?: boolean; // Store isNewUser in JWT
//   }
// }
