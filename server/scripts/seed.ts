import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import UserService from '../services/userService';
import Standup from '../models/Standup';
import TeamSettings from '../models/TeamSettings';
import User from '../models/User';
import { ROLES } from 'shared';

// Load environment variables
dotenv.config();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Create admin user (first user)
    console.log('\n👤 Creating admin user...');
    const admin = await UserService.create({
      email: 'admin@standupsync.com',
      password: 'Admin123!',
      name: 'Admin User',
    });
    console.log(`✅ Created admin: ${admin.email} (Role: ${admin.role})`);
    console.log(`   TeamId: ${admin.teamId}`);

    // Create team members (invited by admin)
    console.log('\n👥 Creating team members...');

    const member1 = await UserService.create({
      email: 'john@standupsync.com',
      password: 'Password123!',
      name: 'John Doe',
      role: ROLES.USER,
      teamId: admin.teamId,
      invitedBy: admin._id,
      isInvited: true,
    });
    console.log(`✅ Created member: ${member1.email}`);

    const member2 = await UserService.create({
      email: 'jane@standupsync.com',
      password: 'Password123!',
      name: 'Jane Smith',
      role: ROLES.USER,
      teamId: admin.teamId,
      invitedBy: admin._id,
      isInvited: true,
    });
    console.log(`✅ Created member: ${member2.email}`);

    const member3 = await UserService.create({
      email: 'bob@standupsync.com',
      password: 'Password123!',
      name: 'Bob Johnson',
      role: ROLES.USER,
      teamId: admin.teamId,
      invitedBy: admin._id,
      isInvited: true,
    });
    console.log(`✅ Created member: ${member3.email}`);

    // Create another admin with their own team
    console.log('\n👤 Creating second admin user...');
    const admin2 = await UserService.create({
      email: 'alice@standupsync.com',
      password: 'Admin123!',
      name: 'Alice Williams',
    });
    console.log(`✅ Created admin: ${admin2.email} (Role: ${admin2.role})`);
    console.log(`   TeamId: ${admin2.teamId}`);

    // Create sample standups
    console.log('\n📝 Creating sample standups...');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Admin's standups
    await Standup.create({
      userId: admin._id,
      teamId: admin.teamId,
      date: today,
      yesterdayWork: [
        'Reviewed pull requests from team members',
        'Set up CI/CD pipeline improvements',
        'Meeting with stakeholders about Q1 goals',
      ],
      todayPlan: [
        'Sprint planning meeting',
        'Code review for authentication feature',
        'Update project documentation',
      ],
      blockers: [],
    });

    await Standup.create({
      userId: admin._id,
      teamId: admin.teamId,
      date: yesterday,
      yesterdayWork: [
        'Implemented new API endpoints',
        'Fixed critical bug in payment system',
      ],
      todayPlan: [
        'Review pull requests from team members',
        'Set up CI/CD pipeline improvements',
      ],
      blockers: ['Waiting for design assets from design team'],
    });

    // Member1's standups
    await Standup.create({
      userId: member1._id,
      teamId: admin.teamId,
      date: today,
      yesterdayWork: [
        'Completed user authentication feature',
        'Fixed bugs in login flow',
        'Updated unit tests',
      ],
      todayPlan: [
        'Start working on password reset feature',
        'Code review for team members',
      ],
      blockers: [],
    });

    await Standup.create({
      userId: member1._id,
      teamId: admin.teamId,
      date: yesterday,
      yesterdayWork: [
        'Worked on authentication module',
        'Wrote integration tests',
      ],
      todayPlan: [
        'Complete user authentication feature',
        'Fix bugs in login flow',
      ],
      blockers: [],
    });

    // Member2's standups
    await Standup.create({
      userId: member2._id,
      teamId: admin.teamId,
      date: today,
      yesterdayWork: [
        'Designed new dashboard UI',
        'Created responsive layout for mobile',
      ],
      todayPlan: [
        'Implement dashboard components',
        'Add dark mode support',
      ],
      blockers: ['Need API endpoints for dashboard data'],
    });

    // Member3's standups
    await Standup.create({
      userId: member3._id,
      teamId: admin.teamId,
      date: today,
      yesterdayWork: [
        'Optimized database queries',
        'Added indexes for better performance',
      ],
      todayPlan: [
        'Work on data migration script',
        'Review database schema changes',
      ],
      blockers: [],
    });

    console.log(`✅ Created ${await Standup.countDocuments()} standups`);

    // Create team settings (without actual Slack tokens for security)
    console.log('\n⚙️  Creating team settings...');
    await TeamSettings.create({
      teamId: admin.teamId,
      isSlackConnected: false,
    });
    console.log('✅ Created team settings');

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Standups: ${await Standup.countDocuments()}`);
    console.log(`   Team Settings: ${await TeamSettings.countDocuments()}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@standupsync.com / Admin123!');
    console.log('   User 1: john@standupsync.com / Password123!');
    console.log('   User 2: jane@standupsync.com / Password123!');
    console.log('   User 3: bob@standupsync.com / Password123!');
    console.log('   Admin 2: alice@standupsync.com / Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
