import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import User from '../models/User';
import Standup from '../models/Standup';
import TeamSettings from '../models/TeamSettings';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function cleanup() {
  console.log('🧹 Starting database cleanup...');

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get counts before cleanup
    const userCount = await User.countDocuments();
    const standupCount = await Standup.countDocuments();
    const teamSettingsCount = await TeamSettings.countDocuments();

    console.log('\n📊 Current database state:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Standups: ${standupCount}`);
    console.log(`   Team Settings: ${teamSettingsCount}`);

    // Ask for confirmation (in production, you might want to add readline for user input)
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('   This action cannot be undone.');

    // Delete all data
    console.log('\n🗑️  Deleting all data...');

    const deletedUsers = await User.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.deletedCount} users`);

    const deletedStandups = await Standup.deleteMany({});
    console.log(`✅ Deleted ${deletedStandups.deletedCount} standups`);

    const deletedTeamSettings = await TeamSettings.deleteMany({});
    console.log(`✅ Deleted ${deletedTeamSettings.deletedCount} team settings`);

    // Verify cleanup
    const remainingUsers = await User.countDocuments();
    const remainingStandups = await Standup.countDocuments();
    const remainingTeamSettings = await TeamSettings.countDocuments();

    console.log('\n📊 After cleanup:');
    console.log(`   Users: ${remainingUsers}`);
    console.log(`   Standups: ${remainingStandups}`);
    console.log(`   Team Settings: ${remainingTeamSettings}`);

    if (remainingUsers === 0 && remainingStandups === 0 && remainingTeamSettings === 0) {
      console.log('\n✨ Database cleaned successfully!');
    } else {
      console.log('\n⚠️  Warning: Some data may not have been deleted');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

// Run the cleanup function
cleanup();
