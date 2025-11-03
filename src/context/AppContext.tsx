'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, Avatar, PlayerStats, SportType } from '@/types';
import { calculateAgeGroup } from '@/lib/utils';
import { mockUser, mockPlayerStats, mockAvatars } from '@/lib/mockData';

interface AppContextType {
  // User data
  user: Partial<User>;
  updateUser: (data: Partial<User>) => void;
  setUserEmail: (email: string) => void;
  setUserProfile: (name: string, age: number, gender: string, location: string) => void;
  setProfilePicture: (url: string) => void;

  // Avatar data
  avatar: Avatar | null;
  createAvatar: (hairColor: string, hairStyle: string, jerseyNumber: number, items: any) => void;

  // Stats
  stats: PlayerStats | null;
  updateStats: (xp: number, challenges: number) => void;

  // App state
  hasAvatar: boolean;
  canAccessFeatures: boolean;
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;

  // Onboarding
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Partial<User>>({ ...mockUser });
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [selectedSport, setSelectedSport] = useState<SportType>('basketball');

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => ({ ...prev, ...data }));
  }, []);

  const setUserEmail = useCallback((email: string) => {
    setUser(prev => ({
      ...prev,
      email,
      emailVerified: true, // Mock: auto-verify
    }));
  }, []);

  const setUserProfile = useCallback((name: string, age: number, gender: string, location: string) => {
    const ageGroup = calculateAgeGroup(age);
    setUser(prev => ({
      ...prev,
      name,
      age,
      ageGroup,
      gender,
      location,
    }));
  }, []);

  const setProfilePicture = useCallback((url: string) => {
    setUser(prev => ({
      ...prev,
      profilePictureUrl: url,
    }));
  }, []);

  const createAvatar = useCallback(
    (hairColor: string, hairStyle: string, jerseyNumber: number, items: any) => {
      const newAvatar: Avatar = {
        id: 'avatar-current',
        userId: user.id || 'user-1',
        hairColor,
        hairStyle,
        jerseyNumber,
        equippedItems: items,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAvatar(newAvatar);

      // Initialize stats when avatar is created
      setStats({
        id: 'stats-current',
        userId: user.id || 'user-1',
        totalXp: 0,
        currentRank: 999,
        totalChallenges: 0,
        sportType: selectedSport,
        venueStatsJson: {},
        updatedAt: new Date(),
      });
    },
    [user.id, selectedSport]
  );

  const updateStats = useCallback((xp: number, challenges: number) => {
    setStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        totalXp: prev.totalXp + xp,
        totalChallenges: prev.totalChallenges + challenges,
        updatedAt: new Date(),
      };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
  }, []);

  const hasAvatar = avatar !== null;
  const canAccessFeatures = user.hasCompletedOnboarding === true && hasAvatar;

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        setUserEmail,
        setUserProfile,
        setProfilePicture,
        avatar,
        createAvatar,
        stats,
        updateStats,
        hasAvatar,
        canAccessFeatures,
        selectedSport,
        setSelectedSport,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}