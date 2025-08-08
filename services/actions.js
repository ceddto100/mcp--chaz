import axios from 'axios';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Calls a Make.com webhook to book an appointment.
 * @param {object} data - The data to send, e.g., { client_id, details: "Appointment for tomorrow at 2 PM" }.
 * @returns {Promise<object>}
 */
export async function makeAppointment(data) {
  try {
    const response = await axios.post(process.env.MAKE_APPOINTMENT_WEBHOOK_URL, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error calling Make.com appointment webhook:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Calls a Make.com webhook to send a follow-up email.
 * @param {object} data - The data to send, e.g., { to: 'customer@example.com', subject: 'Your Follow-Up', body: '...' }.
 * @returns {Promise<object>}
 */
export async function sendFollowUpEmail(data) {
  try {
    const response = await axios.post(process.env.MAKE_EMAIL_WEBHOOK_URL, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error calling Make.com email webhook:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sends an SMS message using Twilio.
 * @param {string} to - The recipient's phone number.
 * @param {string} body - The message content.
 * @returns {Promise<object>}
 */
export async function sendTwilioText(to, body) {
  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error sending Twilio text:', error.message);
    return { success: false, error: error.message };
  }
}
