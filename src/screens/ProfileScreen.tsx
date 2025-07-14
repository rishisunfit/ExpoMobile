import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles';

export default function ProfileScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 96 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' }}
              style={styles.profileImage}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.profileName}>Sarah Johnson</Text>
              <Text style={styles.profileMemberSince}>Member since March 2024</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>Intermediate</Text></View>
                <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>Premium</Text></View>
              </View>
            </View>
          </View>
          <LinearGradient
            colors={[COLORS.primary, '#000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.editProfileButton}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.primary }] }>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>18</Text>
            <Text style={[styles.statLabel, { color: COLORS.primary }]}>Day Streak</Text>
          </View>
        </View>

        {/* Achievement Card */}
        <LinearGradient
          colors={[COLORS.primary, '#000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.achievementCardGradient}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={styles.achievementTitleWhite}>Latest Achievement</Text>
            <Icon name="trophy" size={22} color="#ffe066" style={{ marginLeft: 8, marginTop: 2 }} />
          </View>
          <Text style={styles.achievementDescriptionWhite}>Completed 3 weeks in a row! Keep up the amazing work.</Text>
          <View style={styles.achievementBadgeRowWhite}>
            <Icon name="fire" size={18} color="#fff" style={styles.achievementBadgeIconWhite} />
            <Text style={styles.achievementBadgeTextWhite}>Consistency Champion</Text>
          </View>
        </LinearGradient>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuOption icon="clock-rotate-left" iconColor="#2563eb" bgColor="#eff6ff" title="Workout History" subtitle="View past workouts" />
          <MenuOption icon="chart-line" iconColor="#22c55e" bgColor="#f0fdf4" title="Progress Reports" subtitle="Track your improvements" />
          <MenuOption icon="bullseye" iconColor="#a21caf" bgColor="#faf5ff" title="My Goals" subtitle="Set and track goals" />
          <MenuOption icon="clipboard-list" iconColor="#ea580c" bgColor="#fff7ed" title="Assessments" subtitle="View and complete assessments" onPress={() => navigation.navigate('MobilityAssessmentScreen')} />
          <MenuOption icon="question-circle" iconColor="#dc2626" bgColor="#fef2f2" title="Help & Support" subtitle="Get help when you need it" />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuOption({ icon, iconColor, bgColor, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.menuIconWrap, { backgroundColor: bgColor }] }>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={16} color="#64748b" />
    </TouchableOpacity>
  );
}

function BottomNavButton({ icon, label, active }: any) {
  return (
    <TouchableOpacity style={styles.bottomNavButton}>
      <Icon name={icon} size={20} color={active ? '#22c55e' : '#64748b'} />
      <Text style={[styles.bottomNavLabel, active && { color: '#22c55e', fontWeight: '600' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statusBar: {
    backgroundColor: '#fff',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statusIcon: {
    color: '#1f2937',
    marginLeft: 4,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  profileMemberSince: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  levelBadgeText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '500',
  },
  premiumBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  premiumBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  editProfileButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  editProfileButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  achievementCard: {
    backgroundColor: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  achievementDesc: {
    color: '#f1f5f9',
    fontSize: 14,
    marginBottom: 8,
  },
  achievementIconWrap: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  achievementBadge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuOption: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '500',
  },
  menuSubtitle: {
    color: '#64748b',
    fontSize: 13,
  },
  signOutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginTop: 16,
  },
  signOutButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  bottomNavLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  achievementCardGradient: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  achievementTitleWhite: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  achievementDescriptionWhite: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  achievementBadgeRowWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementBadgeIconWhite: {
    marginRight: 8,
  },
  achievementBadgeTextWhite: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
}); 