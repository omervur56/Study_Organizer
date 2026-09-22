import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SIDEBAR_WIDTH = 220;

export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.content} />
      <TabList asChild>
        <Sidebar>
          <TabTrigger name="termine" href="/" asChild>
            <SidebarItem>Termine</SidebarItem>
          </TabTrigger>
          <TabTrigger name="todo" href="/todo" asChild>
            <SidebarItem>To-Do-Liste</SidebarItem>
          </TabTrigger>
        </Sidebar>
      </TabList>
    </Tabs>
  );
}

function SidebarItem({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.itemInner}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function Sidebar(props: TabListProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      {...props}
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.backgroundElement,
          paddingTop: insets.top + Spacing.four,
          paddingLeft: insets.left,
          paddingBottom: insets.bottom,
        },
      ]}>
      <ThemedText type="smallBold" style={styles.brand}>
        Study Organizer
      </ThemedText>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  brand: { marginBottom: Spacing.four, paddingHorizontal: Spacing.three },
  item: {},
  itemInner: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: { opacity: 0.7 },
  content: { flex: 1, height: '100%', marginLeft: SIDEBAR_WIDTH },
});
