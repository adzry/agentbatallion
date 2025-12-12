/**
 * Mobile Agent
 *
 * Responsible for:
 * - React Native / Expo project generation
 * - Mobile UI components
 * - Navigation setup
 * - Platform-specific code
 * - Mobile best practices
 */
import { BaseTeamAgent } from '../base-team-agent.js';
export class MobileAgent extends BaseTeamAgent {
    constructor(memory, tools, messageBus) {
        const profile = {
            id: 'mobile-agent',
            name: 'Taylor',
            role: 'frontend_engineer',
            avatar: '📱',
            description: 'Mobile Engineer - Creates cross-platform mobile apps',
            capabilities: {
                canWriteCode: true,
                canDesign: true,
                canTest: true,
                canDeploy: false,
                canResearch: true,
                canReview: false,
                languages: ['TypeScript', 'JavaScript'],
                frameworks: ['React Native', 'Expo', 'React Navigation'],
            },
            personality: 'Mobile-first mindset. Focused on performance and native feel.',
            systemPrompt: `You are Taylor, an experienced Mobile Engineer AI agent.
Your responsibilities:
1. Generate React Native / Expo project structure
2. Create mobile-optimized UI components
3. Set up navigation (React Navigation)
4. Handle platform-specific code
5. Implement mobile best practices

Focus on:
- Cross-platform compatibility (iOS & Android)
- Performance optimization
- Native-like animations
- Responsive layouts
- Offline support
- Deep linking`,
        };
        super(profile, memory, tools, messageBus);
    }
    /**
     * Generate mobile app code
     */
    async generateMobileApp(requirements, designSystem, architecture) {
        this.updateStatus('working');
        this.think('Starting mobile app generation...');
        const files = [];
        const screens = [];
        const components = [];
        // Project configuration files
        this.think('Setting up Expo project...');
        const configFiles = await this.act('code', 'Generating config files', async () => {
            return this.generateConfigFiles(requirements, designSystem);
        });
        files.push(...configFiles);
        this.updateProgress(20);
        // Navigation
        this.think('Setting up navigation...');
        const navFiles = await this.act('code', 'Generating navigation', async () => {
            return this.generateNavigation(requirements);
        });
        files.push(...navFiles);
        this.updateProgress(35);
        // Theme and styling
        this.think('Creating theme system...');
        const themeFiles = await this.act('design', 'Generating theme', async () => {
            return this.generateTheme(designSystem);
        });
        files.push(...themeFiles);
        this.updateProgress(50);
        // Components
        this.think('Building UI components...');
        const componentFiles = await this.act('code', 'Generating components', async () => {
            const comps = this.generateComponents(designSystem);
            comps.forEach(f => components.push(f.path.split('/').pop()?.replace('.tsx', '') || ''));
            return comps;
        });
        files.push(...componentFiles);
        this.updateProgress(70);
        // Screens
        this.think('Creating screens...');
        const screenFiles = await this.act('code', 'Generating screens', async () => {
            const scrs = this.generateScreens(requirements);
            scrs.forEach(f => screens.push(f.path.split('/').pop()?.replace('.tsx', '') || ''));
            return scrs;
        });
        files.push(...screenFiles);
        this.updateProgress(85);
        // Utils and hooks
        this.think('Adding utilities...');
        const utilFiles = await this.act('code', 'Generating utilities', async () => {
            return this.generateUtils();
        });
        files.push(...utilFiles);
        this.updateProgress(100);
        // Create artifacts
        files.forEach(file => {
            this.createArtifact('code', file.path.split('/').pop() || '', file.content, file.path);
        });
        this.updateStatus('complete');
        return {
            projectType: 'expo',
            files,
            screens,
            components,
        };
    }
    async executeTask(task) {
        switch (task.title) {
            case 'generate_mobile':
                const reqs = await this.memory.recall('requirements', 20);
                const design = await this.memory.recall('design_system', 1);
                return await this.generateMobileApp(reqs, design[0]);
            default:
                throw new Error(`Unknown task: ${task.title}`);
        }
    }
    generateConfigFiles(requirements, designSystem) {
        const files = [];
        const appName = 'MyMobileApp';
        // package.json
        files.push({
            path: 'mobile/package.json',
            content: JSON.stringify({
                name: appName.toLowerCase(),
                version: '1.0.0',
                main: 'expo-router/entry',
                scripts: {
                    start: 'expo start',
                    android: 'expo start --android',
                    ios: 'expo start --ios',
                    web: 'expo start --web',
                    lint: 'eslint .',
                    test: 'jest',
                },
                dependencies: {
                    'expo': '~50.0.0',
                    'expo-router': '~3.4.0',
                    'expo-status-bar': '~1.11.0',
                    'expo-linking': '~6.2.0',
                    'expo-constants': '~15.4.0',
                    'expo-secure-store': '~12.8.0',
                    'react': '18.2.0',
                    'react-native': '0.73.2',
                    'react-native-safe-area-context': '4.8.2',
                    'react-native-screens': '~3.29.0',
                    'react-native-gesture-handler': '~2.14.0',
                    'react-native-reanimated': '~3.6.0',
                    '@react-navigation/native': '^6.1.9',
                    '@react-navigation/native-stack': '^6.9.17',
                    '@tanstack/react-query': '^5.17.0',
                    'zustand': '^4.4.7',
                    'zod': '^3.22.4',
                },
                devDependencies: {
                    '@babel/core': '^7.23.0',
                    '@types/react': '~18.2.0',
                    'typescript': '^5.3.0',
                    'jest': '^29.7.0',
                    '@testing-library/react-native': '^12.4.0',
                },
            }, null, 2),
            type: 'config',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // app.json (Expo config)
        files.push({
            path: 'mobile/app.json',
            content: JSON.stringify({
                expo: {
                    name: appName,
                    slug: appName.toLowerCase(),
                    version: '1.0.0',
                    orientation: 'portrait',
                    icon: './assets/icon.png',
                    userInterfaceStyle: 'automatic',
                    splash: {
                        image: './assets/splash.png',
                        resizeMode: 'contain',
                        backgroundColor: designSystem.colors.primary,
                    },
                    assetBundlePatterns: ['**/*'],
                    ios: {
                        supportsTablet: true,
                        bundleIdentifier: `com.example.${appName.toLowerCase()}`,
                    },
                    android: {
                        adaptiveIcon: {
                            foregroundImage: './assets/adaptive-icon.png',
                            backgroundColor: designSystem.colors.primary,
                        },
                        package: `com.example.${appName.toLowerCase()}`,
                    },
                    web: {
                        favicon: './assets/favicon.png',
                        bundler: 'metro',
                    },
                    scheme: appName.toLowerCase(),
                    experiments: {
                        typedRoutes: true,
                    },
                },
            }, null, 2),
            type: 'config',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // tsconfig.json
        files.push({
            path: 'mobile/tsconfig.json',
            content: JSON.stringify({
                extends: 'expo/tsconfig.base',
                compilerOptions: {
                    strict: true,
                    baseUrl: '.',
                    paths: {
                        '@/*': ['./src/*'],
                        '@components/*': ['./src/components/*'],
                        '@screens/*': ['./src/screens/*'],
                        '@hooks/*': ['./src/hooks/*'],
                        '@utils/*': ['./src/utils/*'],
                        '@theme/*': ['./src/theme/*'],
                    },
                },
                include: ['**/*.ts', '**/*.tsx', '.expo/types/**/*.ts', 'expo-env.d.ts'],
            }, null, 2),
            type: 'config',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // babel.config.js
        files.push({
            path: 'mobile/babel.config.js',
            content: `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
`,
            type: 'config',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        return files;
    }
    generateNavigation(requirements) {
        const files = [];
        // App entry (_layout.tsx for expo-router)
        files.push({
            path: 'mobile/app/_layout.tsx',
            content: `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@theme/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: true,
                headerBackTitleVisible: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                }}
              />
            </Stack>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Tab layout
        files.push({
            path: 'mobile/app/(tabs)/_layout.tsx',
            content: `import { Tabs } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { Home, Settings, User } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Auth layout
        files.push({
            path: 'mobile/app/(auth)/_layout.tsx',
            content: `import { Stack } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        return files;
    }
    generateTheme(designSystem) {
        const files = [];
        // Theme constants
        files.push({
            path: 'mobile/src/theme/colors.ts',
            content: `export const lightColors = {
  primary: '${designSystem.colors.primary}',
  secondary: '${designSystem.colors.secondary}',
  accent: '${designSystem.colors.accent}',
  background: '${designSystem.colors.background}',
  surface: '#ffffff',
  text: '${designSystem.colors.text}',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '${designSystem.colors.error}',
  success: '${designSystem.colors.success}',
  warning: '${designSystem.colors.warning}',
  info: '#3b82f6',
};

export const darkColors = {
  primary: '${designSystem.colors.primary}',
  secondary: '${designSystem.colors.secondary}',
  accent: '${designSystem.colors.accent}',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export type Colors = typeof lightColors;
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Spacing
        files.push({
            path: 'mobile/src/theme/spacing.ts',
            content: `export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Typography
        files.push({
            path: 'mobile/src/theme/typography.ts',
            content: `import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
} as const;

export type Typography = typeof typography;
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Theme Provider
        files.push({
            path: 'mobile/src/theme/ThemeProvider.tsx',
            content: `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

interface Theme {
  colors: Colors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  isDark: boolean;
}

interface ThemeContextType extends Theme {
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const theme: ThemeContextType = {
    colors: isDark ? darkColors : lightColors,
    spacing,
    borderRadius,
    typography,
    isDark,
    toggleTheme: () => {
      setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
    },
    setTheme: (mode) => {
      setThemeMode(mode);
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        return files;
    }
    generateComponents(designSystem) {
        const files = [];
        // Button component
        files.push({
            path: 'mobile/src/components/Button.tsx',
            content: `import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#ffffff';
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return '#ffffff';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'lg':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.lg,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: variant === 'outline' ? colors.primary : undefined,
        },
        getPadding(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            typography.button,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Input component
        files.push({
            path: 'mobile/src/components/Input.tsx',
            content: `import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  ...props
}: InputProps) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[typography.bodySmall, { color: colors.text, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : focused ? colors.primary : colors.border,
            borderRadius: borderRadius.md,
            color: colors.text,
            padding: spacing.md,
          },
          props.style,
        ]}
        placeholderTextColor={colors.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
      />
      {error && (
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Card component
        files.push({
            path: 'mobile/src/components/Card.tsx',
            content: `import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  const { colors, spacing, borderRadius } = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.surface,
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: borderRadius.lg,
          padding: spacing.md,
        },
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Component index
        files.push({
            path: 'mobile/src/components/index.ts',
            content: `export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        return files;
    }
    generateScreens(requirements) {
        const files = [];
        // Home screen
        files.push({
            path: 'mobile/app/(tabs)/index.tsx',
            content: `import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Card, Button } from '@components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Fetch data here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.h1, { color: colors.text }]}>
            Welcome! 👋
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            Your mobile app is ready to use.
          </Text>
        </View>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text }]}>
            Quick Stats
          </Text>
          <View style={[styles.statsRow, { marginTop: spacing.md }]}>
            <View style={styles.stat}>
              <Text style={[typography.h2, { color: colors.primary }]}>12</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Active</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[typography.h2, { color: colors.success }]}>48</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[typography.h2, { color: colors.warning }]}>3</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Pending</Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text }]}>
            Recent Activity
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            No recent activity to display.
          </Text>
        </Card>

        <Button title="Get Started" onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Profile screen
        files.push({
            path: 'mobile/app/(tabs)/profile.tsx',
            content: `import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Card, Button } from '@components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: spacing.md, alignItems: 'center' }}
      >
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Text style={[typography.h1, { color: '#ffffff' }]}>JD</Text>
        </View>

        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>
          John Doe
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          john.doe@example.com
        </Text>

        <Card style={{ width: '100%', marginTop: spacing.lg }}>
          <View style={styles.row}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Member since</Text>
            <Text style={[typography.body, { color: colors.text }]}>Jan 2024</Text>
          </View>
          <View style={[styles.row, { marginTop: spacing.md }]}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Status</Text>
            <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[typography.caption, { color: colors.success }]}>Active</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Edit Profile"
          variant="outline"
          onPress={() => {}}
          style={{ width: '100%', marginTop: spacing.lg }}
        />
        <Button
          title="Sign Out"
          variant="ghost"
          onPress={() => {}}
          style={{ width: '100%', marginTop: spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Settings screen
        files.push({
            path: 'mobile/app/(tabs)/settings.tsx',
            content: `import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Card } from '@components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, spacing, typography, isDark, toggleTheme } = useTheme();

  const SettingRow = ({
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.settingRow,
        { borderBottomColor: colors.border, paddingVertical: spacing.md },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={colors.textSecondary} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: spacing.md }}
      >
        <Text style={[typography.h3, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Appearance
        </Text>
        <Card>
          <SettingRow
            title="Dark Mode"
            subtitle={isDark ? 'On' : 'Off'}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            }
          />
        </Card>

        <Text style={[typography.h3, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Account
        </Text>
        <Card>
          <SettingRow title="Notifications" subtitle="Manage notifications" onPress={() => {}} />
          <SettingRow title="Privacy" subtitle="Privacy settings" onPress={() => {}} />
          <SettingRow title="Security" subtitle="Password and authentication" onPress={() => {}} />
        </Card>

        <Text style={[typography.h3, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Support
        </Text>
        <Card>
          <SettingRow title="Help Center" onPress={() => {}} />
          <SettingRow title="Contact Us" onPress={() => {}} />
          <SettingRow title="About" subtitle="Version 1.0.0" onPress={() => {}} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Login screen
        files.push({
            path: 'mobile/app/(auth)/login.tsx',
            content: `import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { Input, Button } from '@components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Implement login logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.content, { padding: spacing.lg }]}>
          <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.sm }]}>
            Welcome back
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
            Sign in to your account
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={{ marginBottom: spacing.md }}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            containerStyle={{ marginBottom: spacing.lg }}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginBottom: spacing.md }}
          />

          <Button
            title="Create Account"
            variant="outline"
            onPress={() => router.push('/(auth)/register')}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        return files;
    }
    generateUtils() {
        const files = [];
        // API client
        files.push({
            path: 'mobile/src/utils/api.ts',
            content: `import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await SecureStore.getItemAsync('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: \`Bearer \${token}\` }),
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }

    return response.json();
  }

  async delete(endpoint: string, options?: RequestOptions): Promise<void> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
  }
}

export const api = new ApiClient(API_URL);
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        // Auth store
        files.push({
            path: 'mobile/src/stores/auth.ts',
            content: `import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // Implement actual login API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { user, token } = await response.json();

    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userStr = await SecureStore.getItemAsync('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
`,
            type: 'source',
            createdBy: this.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        });
        return files;
    }
}
//# sourceMappingURL=mobile-agent.js.map