import { useState, useEffect } from 'react';
import { TeamMemberTabs } from '@/components/standups/TeamMemberTabs';
import { WeekNavigation } from '@/components/standups/WeekNavigation';
import { StandupsList } from '@/components/standups/StandupsList';
import { CreateStandupCard } from '@/components/standups/CreateStandupCard';
import { getTeamMembers, getCurrentUser } from '@/api/users';
import { getMyStandups, getUserStandups, createStandup, updateStandup } from '@/api/standups';
import { TeamMember, Standup } from '@/types/standup';
import { useToast } from '@/hooks/useToast';
import { getWeekDays, getWeekRange, formatDateForAPI, isDateToday } from '@/utils/dateUtils';
import { format, parseISO, eachDayOfInterval, compareDesc } from 'date-fns';
import { Loader2 } from 'lucide-react';

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
        const [userResponse, teamResponse]: any = await Promise.all([
          getCurrentUser(),
          getTeamMembers(),
        ]);

        const userId = userResponse.user._id;
        setCurrentUserId(userId);
        setTeamMembers(teamResponse.users);
        setActiveTab(userId);

        console.log('Initial data loaded:', { userId, teamCount: teamResponse.users.length });
      } catch (error: any) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load data',
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

        if (activeTab === currentUserId) {
          const response: any = await getMyStandups();
          setStandups(response.standups);
          console.log('Loaded my stand-ups:', response.standups.length);
        } else {
          const { start, end } = getWeekRange(weekOffset);
          const response: any = await getUserStandups(
            activeTab,
            formatDateForAPI(start),
            formatDateForAPI(end)
          );
          setStandups(response.standups);
          console.log('Loaded user stand-ups:', response.standups.length);
        }
      } catch (error: any) {
        console.error('Error fetching stand-ups:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load stand-ups',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStandups();
  }, [activeTab, currentUserId, weekOffset, toast]);

  const handleTabChange = (userId: string) => {
    console.log('Switching to user tab:', userId);
    setActiveTab(userId);
    setWeekOffset(0);
    setSelectedDate(null);
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
      const today = formatDateForAPI(new Date());
      const response: any = await createStandup({
        date: today,
        ...data,
      });

      setStandups((prev) => [response.standup, ...prev]);
      toast({
        title: 'Success',
        description: 'Stand-up created successfully',
      });
      console.log('Stand-up created successfully');
    } catch (error: any) {
      console.error('Error creating stand-up:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create stand-up',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStandup = async (id: string, data: { yesterday: string; today: string; blockers: string }) => {
    try {
      console.log('Updating stand-up:', id);
      const response: any = await updateStandup(id, data);

      setStandups((prev) =>
        prev.map((standup) => (standup._id === id ? response.standup : standup))
      );
      toast({
        title: 'Success',
        description: 'Stand-up updated successfully',
      });
      console.log('Stand-up updated successfully');
    } catch (error: any) {
      console.error('Error updating stand-up:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stand-up',
        variant: 'destructive',
      });
    }
  };

  const getDisplayDates = (): string[] => {
    if (isViewingOwnStandups) {
      const allDates = standups.map((s) => s.date);
      const uniqueDates = Array.from(new Set(allDates));
      return uniqueDates.sort((a, b) => compareDesc(parseISO(a), parseISO(b)));
    } else {
      if (selectedDate) {
        return [formatDateForAPI(selectedDate)];
      }
      const { start, end } = getWeekRange(weekOffset);
      const allDatesInRange = eachDayOfInterval({ start, end });
      return allDatesInRange.map((date) => formatDateForAPI(date)).reverse();
    }
  };

  const todayDate = formatDateForAPI(new Date());
  const hasTodayStandup = standups.some((s) => s.date === todayDate);
  const shouldShowCreateCard = isViewingOwnStandups && !hasTodayStandup;

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

        {!isViewingOwnStandups && (
          <WeekNavigation
            weekDays={weekDays}
            selectedDate={selectedDate}
            weekOffset={weekOffset}
            onDateSelect={handleDateSelect}
            onWeekChange={handleWeekChange}
            canGoBack={weekOffset > -1}
          />
        )}
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