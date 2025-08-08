import { makeAppointment, sendFollowUpEmail, sendTwilioText } from '../services/actions.js';

async function mcpRoutes(server, options) {
  server.post('/', async (request, reply) => {
    // Log the incoming request for debugging
    request.log.info({ body: request.body }, 'Received request on /mcp');

    const { client_id, user_input, conversation_id } = request.body;

    if (!client_id || !user_input || !conversation_id) {
      return reply.code(400).send({ error: 'Missing required fields: client_id, user_input, conversation_id' });
    }

    const lowerInput = user_input.toLowerCase();
    const actions_triggered = [];
    let context_response_parts = [];

    try {
      // --- Intent Detection Logic ---
      // This is a simple keyword-based approach. You can expand this with more complex NLP.

      // Intent: Book an Appointment
      if (lowerInput.includes('book an appointment') || lowerInput.includes('make an appointment')) {
        const result = await makeAppointment({ client_id, user_input, conversation_id });
        if (result.success) {
          actions_triggered.push('make_appointment');
          context_response_parts.push("Okay, I've initiated the appointment booking process for you.");
        }
      }

      // Intent: Send Follow-Up Email
      if (lowerInput.includes('send a follow up') || lowerInput.includes('follow-up email')) {
        const result = await sendFollowUpEmail({
          to: process.env[`CLIENT_${client_id}_TARGET_EMAIL`] || 'default@example.com', // Example of client-specific config
          subject: 'Your Follow-Up Information',
          body: `As requested during our conversation (${conversation_id}), here is your follow-up information.`,
        });
        if (result.success) {
          actions_triggered.push('send_follow_up_email');
          context_response_parts.push("I've sent the follow-up email.");
        }
      }
      
      // Intent: Send a Text Message
      if (lowerInput.includes('send a text') || lowerInput.includes('text me')) {
        const targetPhoneNumber = process.env[`CLIENT_${client_id}_TARGET_PHONE_NUMBER`];
        if (targetPhoneNumber) {
          const result = await sendTwilioText(targetPhoneNumber, `Hello! This is a text regarding our conversation: ${conversation_id}.`);
          if (result.success) {
            actions_triggered.push('send_twilio_text');
            context_response_parts.push("Done. I've just sent you a text message with the details.");
          }
        } else {
           context_response_parts.push("I can't send a text because I don't have a phone number on file for you.");
        }
      }
      
      // --- Final Response to ElevenLabs ---
      let finalContext;
      if (actions_triggered.length === 0) {
        finalContext = "I'm sorry, I wasn't able to understand that request. Could you please rephrase?";
      } else {
        finalContext = context_response_parts.join(' ');
      }
      
      const responsePayload = {
        context: finalContext,
        actions_triggered: actions_triggered,
      };

      request.log.info({ response: responsePayload }, 'Sending response from /mcp');
      reply.send(responsePayload);

    } catch (error) {
      request.log.error(error, 'An error occurred in the /mcp handler');
      reply.code(500).send({ error: 'An internal server error occurred.' });
    }
  });
}

export default mcpRoutes;
