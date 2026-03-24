import { Inngest } from "inngest";
import {User} from "../models/user.model.js";
import { Connection } from "../models/connection.model.js";
import sendEmail from "../configs/nodemailer.js";
import { Story } from "../models/story.model.js";
import { Message } from "../models/message.model.js";
// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    // Use the explicit triggers object
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    let username = email_addresses[0]?.email_address.split("@")[0]

    const user = await User.findOne({username})

    if(user){
        username = username + Math.floor(Math.random() * 1000)
    }
    
    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username
    }
    await User.create(userData);
  },
);

// 2. Sync User Updation
const syncUserUpdation = inngest.createFunction(
  { 
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }]
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const updatedUserData = {
      email: email_addresses[0]?.email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    };
    await User.findByIdAndUpdate(id, updatedUserData);
  }
);

// 3. Sync User Deletion
const syncUserDeletion = inngest.createFunction(
{ 
    id: "delete-user-with-clerk",
    triggers: [{ event: "clerk/user.deleted" }]
  },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);

// INNGEST function to send reminder when a new connection request is received
const sendConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    triggers: [{ event: "app/connection-request" }],
  },
  async ({ event, step}) => {
    const { connectionId } = event.data;
    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id').populate('to_user_id');
      const subject = "New Connection Request Received 😊";
      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have received a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
        <p>Click the button below to view the request and respond:</p>
        <a href="${process.env.FRONTEND_URL}/connections" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">View Connection Request</a>
        <p style="margin-top: 20px;">Best regards,<br/>The PingUp Team</p>
        </div>
      `
      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      })
    })
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id').populate('to_user_id');

      if(connection.status === "accepted"){
        return {message: "Connection request already accepted."};
      }

      if (!connection || connection.status !== "pending") {
        return { message: "No reminder needed" };
    }
      const subject = "Reminder: New Connection Request";
      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${connection.to_user_id.full_name},</h2>
          <p>This is a reminder about the connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
          <p>Click the button below to view the request and respond:</p>
          <a href="${process.env.FRONTEND_URL}/connections" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">View Connection Request</a>
          <p style="margin-top: 20px;">Best regards,<br/>The PingUp Team</p>
        </div>
      `;
      await sendEmail({
        to: connection.to_user_id.email,
        subject,  
        body
      })
      return {message: "Connection request reminder sent successfully."};
    })
  }
);

// Inngest func to delete stories after 24 hours of creation
const deleteStory = inngest.createFunction(
  {
    id: "story-delete",
    triggers: [{ event: "app/story.delete" }],
  },
  async ({ event, step }) => {
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);
       return {message: "Story deleted successfully."};
    })
  }
)

const sendNotificationOfUnseenMessages = inngest.createFunction(
  {
    id: "send-unseen-messages-notification",
    triggers: [{ event: "TZ=America/New_York 0 9 * * *" }],
  },
  async({step}) => {
    const message = await Message.find({seen: false}).populate('to_user_id')
    const unseenCount = {}
    message.map(message => {
      unseenCount[message.to_user_id.id] = (unseenCount[message.to_user_id.id] || 0 ) + 1
    })
    for(const userId in unseenCount) {
      const user = await User.findById(userId)
      const subject = `🔴 You have ${unseenCount[userId]} unseen messages`
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hi ${user.full_name},</h2>
      <p>You have ${unseenCount[userId]} unseen messages</p>
      <p>Click <a herf="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them</p>
      <br/>
      <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>
      `
      await sendEmail({
        to: user.email,
        subject,
        body
      })
    }
    return {message: "Notification Sent."}
  }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion, sendConnectionRequestReminder, deleteStory, sendNotificationOfUnseenMessages];
