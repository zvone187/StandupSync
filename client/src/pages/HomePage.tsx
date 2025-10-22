import { useState, useEffect } from 'react';
import { TeamMemberTabs } from '@/components/standups/TeamMemberTabs';
import { WeekNavigation } from '@/components/standups/WeekNavigation';
import { StandupsList } from '@/components/standups/StandupsList';
import { CreateStandupCard } from '@/components/standups/CreateStandupCard';
import { getTeamMembers, getCurrentUser } from '@/api/users';
import { getStandupsRange, createStandup, updateStandup } from '@/api/standups';
import { TeamMember, Standup } from '@/types/standup';
import { useToast } from '@/hooks/useToast';
import { getWeekDays, getWeekRange, formatDateForAPI, isDateToday } from '@/utils/dateUtils';
import { format, parseISO, compareDesc } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface UserResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface TeamResponse {
  users: TeamMember[];
}

interface StandupsResponse {
  standups: Standup[];
}

interface StandupResponse {
  standup: Standup;
  message?: string;
}

export function HomePage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  const isViewingOwnStandups = activeTab === currentUserId;
  const weekDays = getWeekDays(weekOffset);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial data...');
        const [userResponse, teamResponse] = await Promise.all([
          getCurrentUser() as Promise<UserResponse>,
          getTeamMembers() as Promise<TeamResponse>,
        ]);

        const userId = userResponse.user._id;
        setCurrentUserId(userId);
        setTeamMembers(teamResponse.users);
        setActiveTab(userId);

        console.log('Initial data loaded:', { userId, teamCount: teamResponse.users.length });
      } catch (error: unknown) {
        console.error('Error fetching initial data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    if (!activeTab) return;

    const fetchStandups = async () => {
      try {
        console.log('Fetching stand-ups for user:', activeTab);
        setLoading(true);

        const { start, end } = getWeekRange(weekOffset);
        const response = await getStandupsRange({
          startDate: formatDateForAPI(start),
          endDate: formatDateForAPI(end),
          userId: activeTab,
        }) as StandupsResponse;

        setStandups(response.standups);
        console.log('Loaded stand-ups:', response.standups.length);

        // Auto-select today's date when switching users (if no date is selected)
        if (!selectedDate) {
          setSelectedDate(new Date());
        }
      } catch (error: unknown) {
        console.error('Error fetching stand-ups:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load stand-ups';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStandups();
  }, [activeTab, currentUserId, weekOffset, toast, selectedDate]);

  const handleTabChange = (userId: string) => {
    console.log('Switching to user tab:', userId);
    setActiveTab(userId);
    setWeekOffset(0);
    
    // Auto-select today for own stand-ups, clear for others
    if (userId === currentUserId) {
      setSelectedDate(new Date());
    } else {
      setSelectedDate(null);
    }
  };

  const handleWeekChange = (offset: number) => {
    console.log('Changing week offset to:', offset);
    setWeekOffset(offset);
    setSelectedDate(null);
  };

  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', format(date, 'yyyy-MM-dd'));
    setSelectedDate(date);
  };

  const handleCreateStandup = async (data: { yesterday: string; today: string; blockers: string }) => {
    try {
      console.log('Creating stand-up for today...');
      // Use the actual current date (today), not selectedDate
      // The create card only shows when selectedDate === today anyway
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0); // Reset to midnight local time
      const dateToUse = formatDateForAPI(todayDate);

      console.log('Creating standup for date:', dateToUse);

      // Convert strings to arrays by splitting on newlines and filtering empty lines
      const yesterdayWork = data.yesterday.split('\n').filter(line => line.trim());
      const todayPlan = data.today.split('\n').filter(line => line.trim());
      const blockers = data.blockers.split('\n').filter(line => line.trim());

      const response = await createStandup({
        date: dateToUse,
        yesterdayWork,
        todayPlan,
        blockers,
      }) as StandupResponse;

      setStandups((prev) => [response.standup, ...prev]);
      toast({
        title: 'Success',
        description: 'Stand-up created successfully',
      });
      console.log('Stand-up created successfully');
    } catch (error: unknown) {
      console.error('Error creating stand-up:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create stand-up';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStandup = async (id: string, data: { yesterday: string; today: string; blockers: string }) => {
    try {
      console.log('Updating stand-up:', id);

      // Convert strings to arrays by splitting on newlines and filtering empty lines
      const yesterdayWork = data.yesterday.split('\n').filter(line => line.trim());
      const todayPlan = data.today.split('\n').filter(line => line.trim());
      const blockers = data.blockers.split('\n').filter(line => line.trim());

      const response = await updateStandup(id, {
        yesterdayWork,
        todayPlan,
        blockers,
      }) as StandupResponse;

      setStandups((prev) =>
        prev.map((standup) => (standup._id === id ? response.standup : standup))
      );
      toast({
        title: 'Success',
        description: 'Stand-up updated successfully',
      });
      console.log('Stand-up updated successfully');
    } catch (error: unknown) {
      console.error('Error updating stand-up:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stand-up';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getDisplayDates = (): string[] => {
    if (selectedDate) {
      return [formatDateForAPI(selectedDate)];
    }
    return [];
  };

  const todayDate = formatDateForAPI(new Date());
  // Normalize standup dates to YYYY-MM-DD format for comparison
  const hasTodayStandup = standups.some((s) => {
    const standupDate = s.date.split('T')[0]; // Extract YYYY-MM-DD from ISO string
    return standupDate === todayDate;
  });
  // Only show create card when viewing own standups, no standup exists for today,
  // and either no date is selected OR today is selected
  const isViewingToday = !selectedDate || formatDateForAPI(selectedDate) === todayDate;
  const shouldShowCreateCard = isViewingOwnStandups && !hasTodayStandup && isViewingToday && weekOffset === 0;

  if (loading && teamMembers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Daily Stand-ups</h1>

        <TeamMemberTabs
          currentUserId={currentUserId}
          teamMembers={teamMembers}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <WeekNavigation
          weekDays={weekDays}
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          onDateSelect={handleDateSelect}
          onWeekChange={handleWeekChange}
          canGoBack={isViewingOwnStandups ? true : weekOffset > -1}
          standups={standups}
        />
      </div>

      <div className="space-y-4">
        {shouldShowCreateCard && <CreateStandupCard onSubmit={handleCreateStandup} />}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <StandupsList
            standups={standups}
            dates={getDisplayDates()}
            isOwn={isViewingOwnStandups}
            onUpdate={isViewingOwnStandups ? handleUpdateStandup : undefined}
          />
        )}
      </div>
    </div>
  );
}