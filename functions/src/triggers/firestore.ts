import * as admin from 'firebase-admin';

// Get firestore instance (will be available after admin.initializeApp() is called)
const getDB = () => admin.firestore();

// Email notification function (placeholder - replace with your email service)
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // TODO: Implement with your preferred email service (SendGrid, Nodemailer, etc.)
  console.log(`Email to ${to}: ${subject}\n${body}`);
}

// Handler for when a new team is created
export const onTeamCreateHandler = async (
  snapshot: any,
  context: any
): Promise<void> => {
  try {
    const teamData = snapshot.data();
    const teamId = context.params.teamId;

    console.log(`New team created: ${teamId}`, teamData);

    // Send approval email to team captain
    const emailSubject = 'Team Registration Received - FragsHub';
    const emailBody = `
Dear ${teamData.captainEmail},

Your team "${teamData.name}" has been successfully registered for the tournament.

Team Details:
- Team Name: ${teamData.name}
- Players: ${teamData.players.length}
- Entry Fee: ₹${teamData.entryFee}
- Status: ${teamData.status}

Our admin team will review your registration and approve it within 24 hours.
You will receive a payment link once your team is approved.

Best regards,
FragsHub Team
    `;

    await sendEmail(teamData.captainEmail, emailSubject, emailBody);

    // Update team with email sent timestamp
    await getDB().collection('teams').doc(teamId).update({
      emailSent: admin.firestore.FieldValue.serverTimestamp(),
      notifications: admin.firestore.FieldValue.arrayUnion({
        type: 'registration_confirmation',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        email: teamData.captainEmail
      })
    });

    console.log(`Registration email sent to ${teamData.captainEmail}`);
  } catch (error) {
    console.error('Error in onTeamCreateHandler:', error);
  }
};

// Handler for when payment is completed
export const onPaymentCompleteHandler = async (
  change: any,
  context: any
): Promise<void> => {
  try {
    const before = change.before.data();
    const after = change.after.data();
    const paymentId = context.params.paymentId;

    // Check if payment status changed to 'captured'
    if (before.status !== 'captured' && after.status === 'captured') {
      console.log(`Payment completed: ${paymentId}`, after);

      // Find associated team and update status
      if (after.teamId) {
        await getDB().collection('teams').doc(after.teamId).update({
          status: 'approved',
          paymentStatus: 'paid',
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentCompletedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Get team details for confirmation email
        const teamDoc = await getDB().collection('teams').doc(after.teamId).get();
        if (teamDoc.exists) {
          const teamData = teamDoc.data();
          
          const emailSubject = 'Payment Confirmed - Team Approved - FragsHub';
          const emailBody = `
Dear ${teamData?.captainEmail},

Great news! Your payment has been confirmed and your team "${teamData?.name}" is now approved for the tournament.

Payment Details:
- Amount: ₹${after.amount / 100}
- Transaction ID: ${after.razorpayPaymentId}
- Date: ${new Date().toLocaleDateString()}

Tournament Details will be shared with you closer to the event date.

Best regards,
FragsHub Team
          `;

          await sendEmail(teamData?.captainEmail, emailSubject, emailBody);
          
          console.log(`Team ${after.teamId} approved after payment completion`);
        }
      }
    }
  } catch (error) {
    console.error('Error in onPaymentCompleteHandler:', error);
  }
};
