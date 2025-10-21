import mongoose from 'mongoose';
import Standup from '../models/Standup';
import { connectDB } from '../config/database';

async function checkStandups() {
  try {
    await connectDB();

    const userId = '68f800fa7b61d6fe0d9eda77';
    const standups = await Standup.find({ userId }).sort({ date: -1 });

    console.log(`\n📊 Total standups for user ${userId}: ${standups.length}\n`);

    standups.forEach((s, index) => {
      console.log(`${index + 1}. ID: ${s._id}`);
      console.log(`   Date: ${s.date.toISOString()}`);
      console.log(`   Submitted: ${s.submittedAt?.toISOString() || 'N/A'}`);
      console.log(`   Yesterday: ${s.yesterdayWork?.length || 0} items`);
      console.log(`   Today: ${s.todayPlan?.length || 0} items`);
      console.log('');
    });

    // Check for today
    const today = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
    const todayDate = new Date(today);
    console.log(`\n🔍 Checking for standup on ${today}:`);

    const todayStandup = await Standup.findOne({ userId, date: todayDate });
    console.log(`   Found: ${todayStandup ? 'YES' : 'NO'}`);
    if (todayStandup) {
      console.log(`   ID: ${todayStandup._id}`);
      console.log(`   Date: ${todayStandup.date.toISOString()}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkStandups();
