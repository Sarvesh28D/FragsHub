import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Trigger when a new team is created
export const onTeamCreate = functions.firestore
  .document('teams/{teamId}')
  .onCreate(async (snap, context) => {
    const teamData = snap.data();
    const teamId = context.params.teamId;

    try {
      console.log(`New team created: ${teamData.name} (${teamId})`);

      // Send welcome email to team captain
      // This would integrate with EmailJS or similar service
      await sendTeamRegistrationEmail(teamData.captainEmail, teamData.name, teamId);

      // Create notification for admins
      await db.collection('notifications').add({
        type: 'new_team_registration',
        title: 'New Team Registration',
        message: `Team "${teamData.name}" has registered for the tournament`,
        teamId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Welcome email sent to ${teamData.captainEmail}`);
    } catch (error) {
      console.error('Error processing team creation:', error);
    }
  });

// Trigger when payment is completed
export const onPaymentComplete = functions.firestore
  .document('teams/{teamId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const teamId = context.params.teamId;

    // Check if payment status changed to 'paid'
    if (beforeData?.paymentStatus !== 'paid' && afterData?.paymentStatus === 'paid') {
      try {
        console.log(`Payment completed for team: ${afterData.name} (${teamId})`);

        // Send payment confirmation email
        await sendPaymentConfirmationEmail(
          afterData.captainEmail,
          afterData.name,
          afterData.entryFee,
          afterData.paymentId
        );

        // Create notification for admins
        await db.collection('notifications').add({
          type: 'payment_completed',
          title: 'Payment Completed',
          message: `Team "${afterData.name}" has completed payment of ₹${afterData.entryFee}`,
          teamId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Auto-approve team if payment is completed (optional)
        const autoApprove = process.env.AUTO_APPROVE_TEAMS === 'true';
        if (autoApprove) {
          await change.after.ref.update({
            registrationStatus: 'approved',
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: 'system_auto',
          });

          console.log(`Team ${afterData.name} auto-approved after payment`);
        }

      } catch (error) {
        console.error('Error processing payment completion:', error);
      }
    }
  });

// Helper function to send team registration email
async function sendTeamRegistrationEmail(email: string, teamName: string, teamId: string) {
  // This would integrate with EmailJS or another email service
  // For now, just log the action
  console.log(`Sending registration email to ${email} for team ${teamName} (${teamId})`);
  
  // Example integration with EmailJS would look like:
  // const emailData = {
  //   to_email: email,
  //   team_name: teamName,
  //   team_id: teamId,
  //   registration_link: `https://fragshub.com/team/${teamId}`
  // };
  // 
  // await sendEmailViaEmailJS('team_registration_template', emailData);
}

// Helper function to send payment confirmation email
async function sendPaymentConfirmationEmail(
  email: string, 
  teamName: string, 
  amount: number, 
  paymentId: string
) {
  console.log(`Sending payment confirmation email to ${email} for team ${teamName}`);
  
  // Example integration with EmailJS:
  // const emailData = {
  //   to_email: email,
  //   team_name: teamName,
  //   amount: amount,
  //   payment_id: paymentId,
  //   tournament_link: 'https://fragshub.com/bracket'
  // };
  // 
  // await sendEmailViaEmailJS('payment_confirmation_template', emailData);
}
