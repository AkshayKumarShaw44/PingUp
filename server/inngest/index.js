// import { Inngest } from "inngest";
// import { User } from "../models/user.model.js";
// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "ping-up" });

// Inngest function to save user data to the database after sign up
// const syncUserCreation = inngest.createFunction(
//   {id: "sync-user-from-clerk"},
//   {event: "clerk/user.created"},
//   async ({event}) => {
//     const {id, first_name, last_name, email_addresses, image_url} = event.data;
//     let username = email_addresses[0].email_address.split("@")[0];

//     const user = await User.findOne({username})

//     if (user) {
//       username = username + Math.floor(Math.random() * 1000); // Append random number to ensure uniqueness
//     }

//     const userData = {
//       _id: id,
//       email: email_addresses[0].email_address,
//       full_name: first_name + " " +last_name,
//       profile_picture: image_url,
//       username,
//     };

//     // Save the user data to your database
//     await User.create(userData);
//   }
// );

// //update user data in the database after profile update
// const syncUserUpdation = inngest.createFunction(
//   {id: "update-user-from-clerk"},
//   {event: "clerk/user.updated"},
//   async ({event}) => {
//     const {id, first_name, last_name, email_addresses, image_url} = event.data;
    

//     const updatedUserData = {
//       email: email_addresses[0].email_address,
//       full_name: first_name + " " +last_name,
//       profile_picture: image_url,
//     };

//     // Update the user data in your database
//     await User.findByIdAndUpdate(id, updatedUserData);
//   }
// );

// //delete user data from the database after account deletion
// const syncUserDeletion = inngest.createFunction(
//   {id: "delete-user-with-clerk"},
//   {event: "clerk/user.deleted"},
//   async ({event}) => {
//     const {id} = event.data;

//     // Delete the user data from your database
//     await User.findByIdAndDelete(id);
//   }
// );

// // Create an empty array where we'll export future Inngest functions
// export const functions = [
//     syncUserCreation,
//     syncUserUpdation,
//     syncUserDeletion
// ];
// inngest/index.js

// 1. Sync User Creation
import { Inngest } from "inngest";
import { User } from "../models/user.model.js";

// Ensure this ID matches exactly what you see in the Inngest "Apps" tab
export const inngest = new Inngest({ id: "ping-up" });

// 1. Sync User Creation
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" }, 
  { event: "clerk/user.created" }, 
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url, username: clerkUsername } = event.data;
    
    // Safety check for email
    const email = email_addresses?.[0]?.email_address;
    if (!email) return; 

    await step.run("create-user-in-db", async () => {
      let finalUsername = (clerkUsername || email.split("@")[0]).toLowerCase();
      
      // Check for collision
      const existingUser = await User.findOne({ username: finalUsername });
      if (existingUser) {
        finalUsername = `${finalUsername}${Math.floor(Math.random() * 1000)}`;
      }

      return await User.create({
        _id: id,
        email: email,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
        username: finalUsername,
      });
    });
  }
);

// 2. Sync User Updation
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" }, 
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await step.run("update-user-in-db", async () => {
      return await User.findByIdAndUpdate(id, {
        email: email_addresses?.[0]?.email_address,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
      });
    });
  }
);

// 3. Sync User Deletion
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" }, 
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-from-db", async () => {
      return await User.findByIdAndDelete(id);
    });
  }
);

// Export the array for your server.js
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];