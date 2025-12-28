import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../firebaseConfig";

interface MatchItem {
  matchId: string;
  otherId: string;
  otherUsername: string;
  lastMessage: string;
  lastTimestamp: number;
  unread: number;
}

export default function MessagesList() {
  const uid = auth.currentUser?.uid;
  const [list, setList] = useState<MatchItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const loadMessagesList = async () => {
    if (!uid) return;

    const qMatches = query(
      collection(db, "matches"),
      where("userAid", "==", uid)
    );

    const qMatches2 = query(
      collection(db, "matches"),
      where("userBid", "==", uid)
    );

    const snapA = await getDocs(qMatches);
    const snapB = await getDocs(qMatches2);

    const allMatchIds = [...snapA.docs, ...snapB.docs];

    let result: MatchItem[] = [];

    for (let m of allMatchIds) {
      const matchId = m.id;
      const data = m.data();

      const otherId = data.userAid === uid ? data.userBid : data.userAid;

      // LOAD USERNAME
      const uSnap = await getDoc(doc(db, "users", otherId));
      const username = uSnap.exists() ? uSnap.data().username : "Unknown";

      // LOAD LAST MESSAGE
      const lastQ = query(
        collection(db, "messages", matchId, "msgs"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const lastSnap = await getDocs(lastQ);
      if (lastSnap.empty) continue; // ❗ skip empty conversations

      const last = lastSnap.docs[0].data();

      // COUNT UNREAD MESSAGES
      const unreadQ = query(
        collection(db, "messages", matchId, "msgs"),
        where("read", "==", false),
        where("senderId", "!=", uid)
      );

      const unreadSnap = await getDocs(unreadQ);

      result.push({
        matchId,
        otherId,
        otherUsername: username,
        lastMessage: last.text,
        lastTimestamp: last.createdAt,
        unread: unreadSnap.size
      });
    }

    // SORT newest first
    result.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

    setList(result);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMessagesList().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadMessagesList();
  }, []);

  const renderRow = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/messages/${item.matchId}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>@{item.otherUsername}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.matchId}
      renderItem={renderRow}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  preview: {
    color: "#777",
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    color: "white",
    fontWeight: "700",
  },
});
