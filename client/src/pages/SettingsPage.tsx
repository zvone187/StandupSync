import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Loader2, Send, Link, Unlink, RefreshCw } from 'lucide-react';
import { getSlackSettings, configureSlack, testSlackMessage, disconnectSlack, getSlackChannels } from '@/api/slack';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SlackSettings {
  slackAccessToken?: string;
  slackChannelId?: string;
  slackChannelName?: string;
  isSlackConnected: boolean;
}

interface SlackChannel {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [settings, setSettings] = useState<SlackSettings | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSlackSettings();
      setSettings(response.settings);
      if (response.settings) {
        setChannelId(response.settings.slackChannelId || '');
        setChannelName(response.settings.slackChannelName || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchChannels = async () => {
    if (!accessToken) {
      toast({
        title: 'Error',
        description: 'Please enter a Slack access token first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoadingChannels(true);
      const response = await getSlackChannels(accessToken);
      setChannels(response.channels || []);
      toast({
        title: 'Success',
        description: `Found ${response.channels?.length || 0} channels`,
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch channels',
        variant: 'destructive',
      });
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleConfigure = async () => {
    if (!accessToken || !channelId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await configureSlack({
        accessToken,
        channelId,
        channelName: channelName || channelId,
      });

      toast({
        title: 'Success',
        description: 'Slack integration configured successfully',
      });

      await fetchSettings();
      setAccessToken('');
    } catch (error) {
      console.error('Error configuring Slack:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to configure Slack',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    try {
      setTestingSlack(true);
      const response = await testSlackMessage();

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Test message sent successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to send test message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send test message',
        variant: 'destructive',
      });
    } finally {
      setTestingSlack(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Slack integration?')) {
      return;
    }

    try {
      setLoading(true);
      await disconnectSlack();

      toast({
        title: 'Success',
        description: 'Slack integration disconnected',
      });

      await fetchSettings();
      setChannelId('');
      setChannelName('');
      setChannels([]);
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect Slack',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure integrations and team settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Connect your Slack workspace to receive standup notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings?.isSlackConnected ? (
            <>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    ✅ Slack Connected
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Channel: #{settings.slackChannelName || settings.slackChannelId}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  Disconnect
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Test Slack Connection</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a test message to verify your Slack integration is working
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                    ⚠️ Required Permissions
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                    Make sure your Slack bot has these permissions:
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                    <li><code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">chat:write</code> - Post messages</li>
                    <li><code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">chat:write.public</code> - Post to public channels</li>
                    <li><code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">channels:join</code> - Join channels automatically</li>
                  </ul>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                    If you get an error, you may need to <strong>reinstall the bot</strong> to your workspace after adding these permissions.
                  </p>
                </div>

                <Button
                  onClick={handleTestMessage}
                  disabled={testingSlack}
                  className="gap-2"
                >
                  {testingSlack ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Test Message
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Slack Bot Token *</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="xoxb-your-token-here"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your Slack bot token (starts with xoxb-)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="channelId">Channel ID *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchChannels}
                    disabled={loadingChannels || !accessToken}
                    className="gap-2"
                  >
                    {loadingChannels ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Fetch Channels
                  </Button>
                </div>

                {channels.length > 0 ? (
                  <Select value={channelId} onValueChange={(value) => {
                    setChannelId(value);
                    const channel = channels.find((c) => c.id === value);
                    if (channel) setChannelName(channel.name);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          #{channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="channelId"
                    placeholder="C01234ABCDE"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  The Slack channel ID where standups will be posted
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelName">Channel Name (optional)</Label>
                <Input
                  id="channelName"
                  placeholder="daily-standups"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name for the channel (optional)
                </p>
              </div>

              <Button
                onClick={handleConfigure}
                disabled={loading || !accessToken || !channelId}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    Connect Slack
                  </>
                )}
              </Button>

              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  📚 Need help setting up Slack?
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Check out <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">SLACK_SETUP_GUIDE.md</code> in the project root for detailed setup instructions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
