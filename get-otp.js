const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function getOtp() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    const db = mongoose.connection.db;
    const otps = await db.collection('otps').find({ 
      user_email: 'rashedclassicit@gmail.com',
      is_used: false 
    }).sort({ createdAt: -1 }).limit(1).toArray();
    
    if (otps.length > 0) {
      console.log('OTP Code:', otps[0].otp_code);
      console.log('Type:', otps[0].otp_type);
      console.log('Expires:', otps[0].expires_at);
    } else {
      console.log('No unused OTP found');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

getOtp();
