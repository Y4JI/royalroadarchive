import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/config';

import LibraryScreen    from '../screens/LibraryScreen';
import SearchScreen     from '../screens/SearchScreen';
import NovelDetailScreen from '../screens/NovelDetailScreen';
import ReaderScreen     from '../screens/ReaderScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Library"
        screenOptions={{
          headerStyle:         { backgroundColor: COLORS.surface },
          headerTintColor:     COLORS.textPrimary,
          headerTitleStyle:    { fontWeight: '600' },
          contentStyle:        { backgroundColor: COLORS.background },
          animation:           'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={{ title: 'My Library' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Search Novels' }}
        />
        <Stack.Screen
          name="NovelDetail"
          component={NovelDetailScreen}
          options={({ route }) => ({ title: route.params?.title || 'Novel' })}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
