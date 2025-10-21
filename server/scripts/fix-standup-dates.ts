import mongoose from 'mongoose';
import Standup from '../models/Standup';
import { connectDB } from '../config/database';

/**
 * This script fixes standup dates that were created with incorrect timezone parsing.
 * It normalizes all standup dates to UTC midnight.
 */

async function fixStandupDates() {
  try {
    console.log('🔧 Starting standup date normalization...\n');

    // Connect to database
    await connectDB();

    // Get all standups
    const standups = await Standup.find({});
    console.log(`📊 Found ${standups.length} standups to process\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const standup of standups) {
      try {
        const originalDate = standup.date;

        // Extract just the date part (YYYY-MM-DD)
        const dateStr = originalDate.toISOString().split('T')[0];

        // Create new UTC date at midnight
        const normalizedDate = new Date(dateStr + 'T00:00:00.000Z');

        // Only update if dates are different
        if (originalDate.getTime() !== normalizedDate.getTime()) {
          standup.date = normalizedDate;
          await standup.save();
          updatedCount++;
          console.log(`✅ Updated standup ${standup._id}: ${originalDate.toISOString()} → ${normalizedDate.toISOString()}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing standup ${standup._id}:`, error);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   Total processed: ${standups.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Unchanged: ${standups.length - updatedCount - errorCount}`);

    console.log('\n✨ Date normalization complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
fixStandupDates();
