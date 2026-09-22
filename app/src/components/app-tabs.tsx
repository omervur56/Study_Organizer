import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { usePathname } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SIDEBAR_WIDTH = 220;
const TOP_BAR_CONTENT_HEIGHT = 64;
const TOP_BAR_BACKGROUND = '#F3F4F6';
const PAGE_TITLES: Record<string, string> = { '/': 'Studienplan', '/todo': 'To-Do-Liste' };

type MenuContextValue = { isOpen: boolean; progress: SharedValue<number>; toggle: () => void };
const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within AppTabs');
  return ctx;
}

export default function AppTabs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const progress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    progress.value = withTiming(isMenuOpen ? 1 : 0, { duration: 250 });
  }, [isMenuOpen, progress]);

  return (
    <MenuContext.Provider
      value={{ isOpen: isMenuOpen, progress, toggle: () => setIsMenuOpen((open) => !open) }}>
      <Tabs style={styles.tabs}>
        <TabSlot
          style={[styles.content, { paddingTop: insets.top + TOP_BAR_CONTENT_HEIGHT }]}
        />
        <TabList asChild>
          <Sidebar progress={progress}>
            <TabTrigger name="termine" href="/" asChild>
              <SidebarItem>Termine</SidebarItem>
            </TabTrigger>
            <TabTrigger name="todo" href="/todo" asChild>
              <SidebarItem>To-Do-Liste</SidebarItem>
            </TabTrigger>
          </Sidebar>
        </TabList>
        {isMenuOpen && (
          <Pressable
            accessibilityLabel="Menü schließen"
            style={styles.backdrop}
            onPress={() => setIsMenuOpen(false)}
          />
        )}
        <TopBar />
      </Tabs>
    </MenuContext.Provider>
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

function Sidebar(props: TabListProps & { progress: SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { progress, ...tabListProps } = props;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-SIDEBAR_WIDTH, 0]) }],
  }));

  return (
    <Animated.View
      {...tabListProps}
      style={[
        styles.sidebar,
        animatedStyle,
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
    </Animated.View>
  );
}

function TopBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? '';

  return (
    <View style={[styles.topBar, { paddingTop: insets.top }]}>
      <MenuButton />
      <ThemedText type="smallBold" style={styles.topBarTitle}>
        {title}
      </ThemedText>
    </View>
  );
}

function MenuButton() {
  const { isOpen, progress, toggle } = useMenu();
  const theme = useTheme();

  const topLineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, 6]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` },
    ],
  }));
  const middleLineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
  }));
  const bottomLineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -6]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, -45])}deg` },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isOpen ? 'Menü schließen' : 'Menü öffnen'}
      onPress={toggle}
      hitSlop={Spacing.two}
      style={[styles.menuButton, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.burger}>
        <Animated.View style={[styles.line, { backgroundColor: theme.text }, topLineStyle]} />
        <Animated.View style={[styles.line, { backgroundColor: theme.text }, middleLineStyle]} />
        <Animated.View style={[styles.line, { backgroundColor: theme.text }, bottomLineStyle]} />
      </View>
    </Pressable>
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
    zIndex: 20,
  },
  brand: { marginBottom: Spacing.four, paddingHorizontal: Spacing.three },
  item: {},
  itemInner: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: { opacity: 0.7 },
  content: { flex: 1, height: '100%' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    minHeight: TOP_BAR_CONTENT_HEIGHT,
    paddingHorizontal: Spacing.four,
    backgroundColor: TOP_BAR_BACKGROUND,
    zIndex: 25,
  },
  topBarTitle: { fontSize: 26 },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burger: { width: 22, height: 16, justifyContent: 'space-between' },
  line: { height: 2, width: 22, borderRadius: 1 },
});
