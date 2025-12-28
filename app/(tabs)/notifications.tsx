// app/(tabs)/notifications.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

interface NotificationItem {
  id: string;
  toUserId: string;
  fromUserId: string;
  polaroidId?: string;         // for "like"
  matchId?: string;            // for "match"
  type: "like" | "match";
  isRead: boolean;
  createdAt: number;
  fromUsername: string;        // enriched on client
}

function timeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default function Notifications() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadNotifs = useCallback(async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    const raw = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<NotificationItem, "id" | "fromUsername">),
    }));

    // unique sender ids
    const senderIds = [...new Set(raw.map((n) => n.fromUserId))];
    const userMap: Record<string, string> = {};

    await Promise.all(
      senderIds.map(async (uid) => {
        const userSnap = await getDoc(doc(db, "users", uid));
        userMap[uid] = userSnap.exists() ? userSnap.data().username : "unknown";
      })
    );

    const enriched: NotificationItem[] = raw.map((n) => ({
      ...n,
      fromUsername: userMap[n.fromUserId],
    }));

    setNotifs(enriched);
  }, []);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifs();
    setRefreshing(false);
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (item.type !== "match") {
      // like notification: maybe later show polaroid detail
      return;
    }

    if (!item.matchId) {
      console.warn("Match notification missing matchId");
      return;
    }

    Alert.alert(
      "New Match!",
      `You and @${item.fromUsername} liked each other's polaroids.\nStart chatting?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message user",
          onPress: () => {
            router.push({
              pathname: "../messages/[matchId]",
              params: { matchId: item.matchId },
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList<NotificationItem>
        data={notifs}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => {
          const iconName = item.type === "like" ? "heart" : "people";
          const mainText =
            item.type === "like"
              ? `@${item.fromUsername} liked your polaroid`
              : `You matched with @${item.fromUsername}!`;

          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.6}
              onPress={() => handleNotificationPress(item)}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={item.type === "like" ? "#FF6B6B" : "#B48CF0"}
                style={styles.icon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{mainText}</Text>
                <Text style={styles.timestamp}>{timeAgo(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 15,
    color: "#333",
  },
  timestamp: {
    marginTop: 3,
    fontSize: 12,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 52, // align under text, not icon
  },
});
