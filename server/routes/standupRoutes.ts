import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import Standup from '../models/Standup';
import User from '../models/User';
import { postStandupToSlack, updateSlackStandup } from '../services/slackService';

const router = express.Router();

// Description: Get standups for a specific date and user
// Endpoint: GET /api/standups
// Request: { date?: string, userId?: string }
// Response: { standups: Array<Standup> }
router.get('/', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { date, userId } = req.query;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query: any = { teamId: currentUser.teamId };

    // Filter by user ID if provided
    if (userId) {
      query.userId = userId;
    } else {
      // Default to current user's standups
      query.userId = currentUser._id;
    }

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    console.log(`📋 Fetching standups for query:`, query);
    const standups = await Standup.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .exec();

    res.status(200).json({ standups });
  } catch (error) {
    console.error('❌ Error fetching standups:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch standups' });
  }
});

// Description: Get standups for a date range
// Endpoint: GET /api/standups/range
// Request: { startDate: string, endDate: string, userId?: string }
// Response: { standups: Array<Standup> }
router.get('/range', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { startDate, endDate, userId } = req.query;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const query: any = {
      teamId: currentUser.teamId,
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    };

    // Filter by user ID if provided, otherwise get all team standups
    if (userId) {
      query.userId = userId;
    }

    console.log(`📋 Fetching standups for date range:`, startDate, 'to', endDate);
    const standups = await Standup.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .exec();

    res.status(200).json({ standups });
  } catch (error) {
    console.error('❌ Error fetching standups:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch standups' });
  }
});

// Description: Get team standups for a specific date
// Endpoint: GET /api/standups/team/:date
// Request: {}
// Response: { standups: Array<Standup> }
router.get('/team/:date', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { date } = req.params;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    console.log(`👥 Fetching team standups for ${date}`);
    const standups = await Standup.find({
      teamId: currentUser.teamId,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .exec();

    res.status(200).json({ standups });
  } catch (error) {
    console.error('❌ Error fetching team standups:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch team standups' });
  }
});

// Description: Create a new standup
// Endpoint: POST /api/standups
// Request: { date: string, yesterdayWork: string[], todayPlan: string[], blockers: string[] }
// Response: { standup: Standup }
router.post('/', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { date, yesterdayWork, todayPlan, blockers } = req.body;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    console.log(`📝 Creating standup for ${currentUser.email} on ${date}`);

    // Check if standup already exists for this user and date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const existingStandup = await Standup.findOne({
      userId: currentUser._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingStandup) {
      return res.status(400).json({ error: 'Standup already exists for this date' });
    }

    // Create standup
    const standup = new Standup({
      userId: currentUser._id,
      teamId: currentUser.teamId,
      date: new Date(date),
      yesterdayWork: yesterdayWork || [],
      todayPlan: todayPlan || [],
      blockers: blockers || [],
    });

    await standup.save();

    // Post to Slack if configured
    try {
      const slackMessageId = await postStandupToSlack(
        currentUser.teamId,
        currentUser.name || currentUser.email,
        yesterdayWork || [],
        todayPlan || [],
        blockers || []
      );

      if (slackMessageId) {
        standup.slackMessageId = slackMessageId;
        await standup.save();
      }
    } catch (slackError) {
      console.error('⚠️ Failed to post to Slack, but standup was saved:', slackError);
      // Continue - standup was created successfully
    }

    const populatedStandup = await Standup.findById(standup._id).populate('userId', 'name email').exec();

    console.log(`✅ Standup created successfully for ${currentUser.email}`);
    res.status(201).json({ standup: populatedStandup });
  } catch (error) {
    console.error('❌ Error creating standup:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create standup' });
  }
});

// Description: Update an existing standup
// Endpoint: PUT /api/standups/:id
// Request: { yesterdayWork?: string[], todayPlan?: string[], blockers?: string[] }
// Response: { standup: Standup }
router.put('/:id', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { id } = req.params;
    const { yesterdayWork, todayPlan, blockers } = req.body;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`📝 Updating standup ${id}`);

    // Find the standup
    const standup = await Standup.findById(id);

    if (!standup) {
      return res.status(404).json({ error: 'Standup not found' });
    }

    // Check if user owns this standup
    if (standup.userId.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Cannot update another user\'s standup' });
    }

    // Update fields
    if (yesterdayWork !== undefined) standup.yesterdayWork = yesterdayWork;
    if (todayPlan !== undefined) standup.todayPlan = todayPlan;
    if (blockers !== undefined) standup.blockers = blockers;
    standup.updatedAt = new Date();

    await standup.save();

    // Update Slack message if it exists
    if (standup.slackMessageId) {
      try {
        await updateSlackStandup(
          currentUser.teamId,
          standup.slackMessageId,
          currentUser.name || currentUser.email,
          standup.yesterdayWork,
          standup.todayPlan,
          standup.blockers
        );
      } catch (slackError) {
        console.error('⚠️ Failed to update Slack message, but standup was updated:', slackError);
        // Continue - standup was updated successfully
      }
    }

    const populatedStandup = await Standup.findById(standup._id).populate('userId', 'name email').exec();

    console.log(`✅ Standup updated successfully`);
    res.status(200).json({ standup: populatedStandup });
  } catch (error) {
    console.error('❌ Error updating standup:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update standup' });
  }
});

// Description: Delete a standup
// Endpoint: DELETE /api/standups/:id
// Request: {}
// Response: { message: string }
router.delete('/:id', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { id } = req.params;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`🗑️  Deleting standup ${id}`);

    // Find the standup
    const standup = await Standup.findById(id);

    if (!standup) {
      return res.status(404).json({ error: 'Standup not found' });
    }

    // Check if user owns this standup
    if (standup.userId.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Cannot delete another user\'s standup' });
    }

    await Standup.deleteOne({ _id: id });

    console.log(`✅ Standup deleted successfully`);
    res.status(200).json({ message: 'Standup deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting standup:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete standup' });
  }
});

export default router;
