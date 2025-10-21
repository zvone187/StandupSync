import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from 'lucide-react';
import { TeamMember } from '@/types/standup';

interface TeamMemberTabsProps {
  currentUserId: string;
  teamMembers: TeamMember[];
  activeTab: string;
  onTabChange: (userId: string) => void;
}

export function TeamMemberTabs({ currentUserId, teamMembers, activeTab, onTabChange }: TeamMemberTabsProps) {
  const currentUser = teamMembers.find(member => member._id === currentUserId);
  const otherMembers = teamMembers.filter(member => member._id !== currentUserId);

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm rounded-lg border shadow-sm p-2">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-transparent">
          {currentUser && (
            <TabsTrigger
              value={currentUser._id}
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
            >
              <User className="h-4 w-4" />
              <span className="font-semibold">My Stand-ups</span>
            </TabsTrigger>
          )}
          {otherMembers.map((member) => (
            <TabsTrigger
              key={member._id}
              value={member._id}
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all whitespace-nowrap"
            >
              <User className="h-4 w-4" />
              <span>{member.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}